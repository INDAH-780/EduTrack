# models/students.py
from extensions import db
# Removed werkzeug.security imports because students do not have password fields in the DB

class Student(db.Model):
    __tablename__ = 'students'
    
    # --- CRITICAL: matricule is the PRIMARY KEY and unique identifier for students ---
    matricule = db.Column(db.String(50), primary_key=True) 
    
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=True) # Matches your description
    level = db.Column(db.String(50), nullable=True) # Matches your description

    # --- Relationships ---
    # FIX: Changed 'backref' name to avoid conflict with FaceRecord.student
    face_records = db.relationship('FaceRecord', backref='student_info_from_face_records', lazy=True)
    
    # FIX: Using back_populates to explicitly link to 'Enrollment.student'
    enrollments = db.relationship('Enrollment', back_populates='student', lazy=True)
    
    # attendance_records = db.relationship('AttendanceRecord', backref='student', lazy=True) 
    # If your AttendanceRecord model has a direct relationship back to Student, uncomment this.
    # Also, ensure AttendanceRecord.matricule correctly links to students.matricule.
    # If it also has a backref='student', you'd need to make that unique too, or use back_populates.

    def to_dict(self):
        """Converts the Student object to a dictionary for API responses."""
        return {
            'matricule': self.matricule, 
            'name': self.name,
            'department': self.department, 
            'level': self.level,           
            'total_enrolled_courses': len(self.enrollments) 
        }

    def __repr__(self):
        return f'<Student {self.matricule} ({self.name})>'
