import face_recognition
from scipy.spatial.distance import euclidean  # Add this import
from service.face_recognition_service import FaceRecognitionService
import cv2
import time

class VideoRecognition:
    def __init__(self, yolo_model_path):
        self.recognition_service = FaceRecognitionService(yolo_model_path)
        self.detected_students = set()
        self.unrecognized_faces = 0
        self.last_detection_time = time.time()
        self.inactivity_timeout = 30  # seconds
    
    def process_frame(self, frame):
        """Process a single video frame"""
        current_time = time.time()
        
        # Get recognition results
        results = self.recognition_service.yolo_model(frame)
        boxes = results[0].boxes.xyxy.cpu().numpy()
        
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            face_crop = frame[y1:y2, x1:x2]
            
            rgb_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
            face_encodings = face_recognition.face_encodings(rgb_face)
            
            if face_encodings:
                detected_embedding = face_encodings[0]
                best_match = None
                best_distance = float("inf")
                
                for student in self.recognition_service.student_embeddings:
                    distance = euclidean(student['embedding'], detected_embedding)
                    if distance < best_distance:
                        best_distance = distance
                        best_match = student
                
                if best_match and best_distance < 0.4:
                    matricule = best_match['matricule']
                    if matricule not in self.detected_students:
                        self.detected_students.add(matricule)
                        self._print_student_info(best_match)
                    self.last_detection_time = current_time
                    
                    # Annotate frame
                    display_text = f"{best_match['name']} ({matricule})"
                    cv2.putText(frame, display_text, (x1, y1-10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,0), 2)
                    cv2.rectangle(frame, (x1,y1), (x2,y2), (0,255,0), 2)
                else:
                    self.unrecognized_faces += 1
                    cv2.putText(frame, "Unknown", (x1, y1-10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)
                    cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
        
        return frame
    
    def _print_student_info(self, student):
        """Print formatted student information"""
        print("\n🔹 Detected Student Info:")
        print(f"   Matricule: {student['matricule']}")
        print(f"   Name: {student['name']}")
        print(f"   Level: {student['level']}")
        print(f"   Department: {student['department']}")
    
    def generate_report(self):
        """Generate final attendance report"""
        return self.recognition_service.get_attendance_report(self.detected_students)