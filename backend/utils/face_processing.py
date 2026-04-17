import face_recognition
import numpy as np
import pickle

def compare_faces(known_encoding, unknown_encoding, tolerance=0.6):
    """
    Compare two face encodings and return True if they match
    """
    return face_recognition.compare_faces(
        [known_encoding], 
        unknown_encoding, 
        tolerance=tolerance
    )[0]

def find_matching_student(unknown_encoding):
    """
    Search through all face records to find a matching student
    """
    from models.face_records import FaceRecord
    from models.students import Student
    
    face_records = FaceRecord.query.all()
    
    for record in face_records:
        known_encoding = record.get_face_embedding()
        if compare_faces(known_encoding, unknown_encoding):
            student = Student.query.get(record.matricule)
            return student
    
    return None