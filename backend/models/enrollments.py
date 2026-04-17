# models/enrollments.py
from extensions import db
# No direct imports for Students or Courses needed here for relationships due to circular import fixes

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    
    enrollment_id = db.Column(db.Integer, primary_key=True)
   
    # Foreign key now correctly references students.matricule (the PK of Student)
    matricule = db.Column(db.String(50), db.ForeignKey('students.matricule'), nullable=False)
    course_code = db.Column(db.String(50), db.ForeignKey('courses.course_code'), nullable=False)
    enrollment_date = db.Column(db.Date, nullable=False)
    
    # --- FIX: Using back_populates to explicitly link to 'Student.enrollments' ---
    # This resolves the ArgumentError where 'enrollments' backref conflicted on Student model.
    student = db.relationship('Student', back_populates='enrollments', lazy=True)
    
    # Course relationship remains as is; if it ever causes conflicts, it would also need back_populates.
    course = db.relationship('Course', backref='enrollments_in_course', lazy=True)
    
    def to_dict(self):
        """Converts the Enrollment object to a dictionary for API responses,
        including detailed student, course, and lecturer information."""
        
        student_data = None
        if self.student:
            student_data = self.student.to_dict()
            student_data.pop('total_enrolled_courses', None) 

        course_data = None
        lecturer_data = None
        if self.course:
            course_data = self.course.to_dict()
            course_data.pop('total_enrolled_students', None) 
            if self.course.lecturer:
                lecturer_data = self.course.lecturer.to_dict()
                lecturer_data.pop('courses_taught_count', None) 


        return {
            'enrollment_id': self.enrollment_id,
            'enrollment_date': self.enrollment_date.isoformat(),
            'student_info': student_data, # Full student info
            'course_info': {             # Nested course and lecturer info
                'course_code': self.course_code,
                'course_name': self.course.course_name if self.course else None,
                'lecturer_info': lecturer_data # Lecturer info within course
            }
        }

    def __repr__(self):
        return f'<Enrollment {self.matricule} - {self.course_code}>'

