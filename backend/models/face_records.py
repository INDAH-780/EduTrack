# models/face_records.py
from extensions import db
from datetime import datetime
# No explicit imports for other models needed here due to circular import fixes

class FaceRecord(db.Model):
    __tablename__ = 'face_records'
    
    # --- CRITICAL FIX: 'id' is the primary key, matching your database ---
    id = db.Column(db.Integer, primary_key=True) 
    
    # Foreign key to students.matricule
    matricule = db.Column(db.String(50), db.ForeignKey('students.matricule'), nullable=False)
    
    face_embedding = db.Column(db.LargeBinary, nullable=False) # Stores face embeddings as binary data
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Removed: 'face_record_id' column from the model to match your DB schema.
    # Removed: 'verified_by_face' as it's not in your current DB schema.

    # Relationship to Student
    student = db.relationship('Student', backref='face_records_list', lazy=True) # Changed backref for uniqueness

    def to_dict(self):
        # Note: Face embeddings are usually not returned in API responses directly
        # due to size and sensitivity.
        return {
            'id': self.id, # Using 'id' in the response
            'matricule': self.matricule,
            'timestamp': self.timestamp.isoformat(),
            'student_name': self.student.name if self.student else None # Access student name via relationship
        }

    def __repr__(self):
        return f'<FaceRecord {self.id} for {self.matricule}>'
