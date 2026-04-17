import cv2
import numpy as np
import face_recognition
from scipy.spatial.distance import euclidean
from ultralytics import YOLO
from flask import Flask
from models.students import Student
from models.face_records import FaceRecord

class FaceRecognitionService:
    def __init__(self, yolo_model_path, app, db):
        """Initialize service with Flask app and SQLAlchemy db instance"""
        self.app = app
        self.db = db  # Store db instance
        self.yolo_model = YOLO(yolo_model_path)
        self.student_embeddings = None  # Lazy-load embeddings

    def load_embeddings(self):
        """Lazy-load embeddings when needed"""
        if self.student_embeddings is None:
            with self.app.app_context():
                students = Student.query.join(FaceRecord).all()
                self.student_embeddings = [
                    {
                        'matricule': student.matricule,
                        'name': student.name,
                        'level': student.level.replace("Level", "").strip(),
                        'department': student.department.strip(),
                        'embedding': np.frombuffer(face_record.face_embedding, dtype=np.float64)[:128]
                    }
                    for student in students for face_record in student.face_records
                ]
        
        return self.student_embeddings

    def recognize_from_image(self, image_path):
        """Recognize faces from an image file and mark attendance"""
        frame = cv2.imread(image_path)
        if frame is None:
            raise ValueError("Could not read image file")

        results = self.yolo_model(frame)
        boxes = results[0].boxes.xyxy.cpu().numpy()
        detected_students = set()
        unrecognized_faces = 0
        embeddings = self.load_embeddings()  # Load embeddings here

        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            face_crop = frame[y1:y2, x1:x2]
            rgb_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
            face_encodings = face_recognition.face_encodings(rgb_face)

            if face_encodings:
                detected_embedding = face_encodings[0]
                best_match = None
                best_distance = float("inf")

                for student in embeddings:
                    distance = euclidean(student['embedding'], detected_embedding)
                    if distance < best_distance:
                        best_distance = distance
                        best_match = student

                if best_match and best_distance < 0.4:
                    matricule = best_match['matricule']
                    detected_students.add(matricule)

                    # Update last seen in database inside Flask context
                    with self.app.app_context():
                        student = Student.query.get(matricule)
                        if student:
                            student.last_seen = self.db.func.now()
                            self.db.session.commit()

                    # Annotate frame
                    display_text = f"{best_match['name']} ({matricule})"
                    cv2.putText(frame, display_text, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                else:
                    unrecognized_faces += 1
                    cv2.putText(frame, "Unknown", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)

        # Convert frame to bytes for API response
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        return {
            'detected_students': list(detected_students),
            'unrecognized_faces': unrecognized_faces,
            'frame_with_annotations': frame_bytes
        }

    def get_attendance_report(self, detected_matricules):
        """Generate attendance report"""
        embeddings = self.load_embeddings()  # Load embeddings only when needed
        present_students = [s for s in embeddings if s['matricule'] in detected_matricules]
        absent_students = [s for s in embeddings if s['matricule'] not in detected_matricules]

        return {
            'total_students': len(embeddings),
            'present_count': len(present_students),
            'absent_count': len(absent_students),
            'present_students': present_students,
            'absent_students': sorted(absent_students, key=lambda x: (x['department'], x['level'], x['name']))
        }
