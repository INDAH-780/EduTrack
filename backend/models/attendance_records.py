# models/attendance_records.py
from extensions import db
from datetime import datetime
# No explicit imports for other models needed here due to circular import fixes

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'
    
    attendance_id = db.Column(db.Integer, primary_key=True)
    # Foreign key to students.matricule
    matricule = db.Column(db.String(50), db.ForeignKey('students.matricule'), nullable=False)
    course_code = db.Column(db.String(50), db.ForeignKey('courses.course_code'), nullable=False)
    
    # --- NEW/UPDATED: Link to ClassSchedule ---
    schedule_id = db.Column(db.Integer, db.ForeignKey('class_schedules.schedule_id'), nullable=False) 
    
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # 'PRESENT', 'ABSENT', 'LATE'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) 

    # --- CRITICAL FIX: Add verified_by_face column back into the model definition ---
    verified_by_face = db.Column(db.Boolean, nullable=True, default=False) # Can be True/False, or NULL if not applicable

    # Relationships
    student = db.relationship('Student', backref='attendance_records_list', lazy=True)
    course = db.relationship('Course', backref='attendance_records_for_course', lazy=True) # Changed backref for uniqueness
    schedule = db.relationship('ClassSchedule', backref='attendance_records_for_schedule', lazy=True) 
    
    def to_dict(self):
        # Safely access related object names
        return {
            'attendance_id': self.attendance_id,
            'matricule': self.matricule,
            'student_name': self.student.name if self.student else None,
            'course_code': self.course_code,
            'course_name': self.course.course_name if self.course else None,
            'schedule_id': self.schedule_id,
            # Access schedule info via relationship, assuming ClassSchedule has a to_dict()
            'schedule_info': self.schedule.to_dict() if self.schedule else None, 
            'date': self.date.isoformat(),
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'verified_by_face': self.verified_by_face # Include the new field in to_dict
        }

    def __repr__(self):
        return f'<AttendanceRecord {self.matricule} - {self.course_code} - {self.date} - {self.status}>'
