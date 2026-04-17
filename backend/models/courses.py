# # # models/courses.py
# # from extensions import db
# # from models.lecturers import Lecturer
# # from models.enrollments import Enrollment 

# # class Course(db.Model):
# #     __tablename__ = 'courses'
    
# #     course_code = db.Column(db.String(50), primary_key=True)
# #     course_name = db.Column(db.String(100), nullable=False)
# #     lecturer_id = db.Column(db.String(50), db.ForeignKey('lecturers.lecturer_id'), nullable=False)
    
# #     lecturer = db.relationship('Lecturer', backref='courses_taught', lazy=True)

# #     # Relationships to other models
# #     # --- FIX: Changed backref name to avoid conflict with ClassSchedule.course ---
# #     schedules = db.relationship('ClassSchedule', backref='course_associated', lazy=True)
    
# #     enrollments_list = db.relationship('Enrollment', backref='course_info', lazy=True)
    

# #     def to_dict(self):
# #         return {
# #             'course_code': self.course_code,
# #             'course_name': self.course_name,
# #             'lecturer_id': self.lecturer_id,
# #             'lecturer_name': self.lecturer.name if self.lecturer else None,
# #             'total_enrolled_students': len(self.enrollments_list)
# #         }

# #     def __repr__(self):
# #         return f'<Course {self.course_code} - {self.course_name}>'


# # models/courses.py
# from extensions import db
# from models.lecturers import Lecturer # To access lecturer details
# # No direct import for Enrollment or ClassSchedule needed here due to backref/back_populates usage

# class Course(db.Model):
#     __tablename__ = 'courses'
    
#     course_code = db.Column(db.String(50), primary_key=True)
#     course_name = db.Column(db.String(100), nullable=False)
#     lecturer_id = db.Column(db.String(50), db.ForeignKey('lecturers.lecturer_id'), nullable=False)
    
#     # --- NEW COLUMNS ---
#     department = db.Column(db.String(100), nullable=False) # e.g., "Computer Engineering"
#     level = db.Column(db.String(50), nullable=False)      # e.g., "Level 200", "Level 300", "Level 500"
#     semester = db.Column(db.String(50), nullable=False)    # e.g., "First Semester", "Second Semester"

#     # Relationships
#     lecturer = db.relationship('Lecturer', backref='courses_taught', lazy=True)

#     # Relationship to ClassSchedule (using the fixed backref name)
#     schedules = db.relationship('ClassSchedule', backref='course_associated', lazy=True)
    
#     # Relationship to Enrollment (using the fixed backref name)
#     enrollments_list = db.relationship('Enrollment', backref='course_info', lazy=True)
    

#     def to_dict(self):
#         """Converts the Course object to a dictionary for API responses."""
#         return {
#             'course_code': self.course_code,
#             'course_name': self.course_name,
#             'lecturer_id': self.lecturer_id,
#             'lecturer_name': self.lecturer.name if self.lecturer else None,
#             'department': self.department, # Include new field
#             'level': self.level,           # Include new field
#             'semester': self.semester,     # Include new field
#             'total_enrolled_students': len(self.enrollments_list)
#         }

#     def __repr__(self):
#         return f'<Course {self.course_code} - {self.course_name}>'


# models/courses.py
from extensions import db
from models.lecturers import Lecturer # To access lecturer details
# No direct import for Enrollment or ClassSchedule needed here due to backref/back_populates usage

class Course(db.Model):
    __tablename__ = 'courses'
    
    course_code = db.Column(db.String(50), primary_key=True)
    course_name = db.Column(db.String(100), nullable=False)
    lecturer_id = db.Column(db.String(50), db.ForeignKey('lecturers.lecturer_id'), nullable=False)
    
    # --- NEW COLUMNS ---
    department = db.Column(db.String(100), nullable=False) # e.g., "Computer Engineering"
    level = db.Column(db.String(50), nullable=False)      # e.g., "Level 200", "Level 300", "Level 500"
    semester = db.Column(db.String(50), nullable=False)    # e.g., "First Semester", "Second Semester"

    # Relationships
    lecturer = db.relationship('Lecturer', backref='courses_taught', lazy=True)

    # Relationship to ClassSchedule (using the fixed backref name)
    schedules = db.relationship('ClassSchedule', backref='course_associated', lazy=True)
    
    # Relationship to Enrollment (using the fixed backref name)
    enrollments_list = db.relationship('Enrollment', backref='course_info', lazy=True)
    

    def to_dict(self):
        """Converts the Course object to a dictionary for API responses."""
        return {
            'course_code': self.course_code,
            'course_name': self.course_name,
            'lecturer_id': self.lecturer_id,
            'lecturer_name': self.lecturer.name if self.lecturer else None,
            'department': self.department, # Include new field
            'level': self.level,           # Include new field
            'semester': self.semester,     # Include new field
            'total_enrolled_students': len(self.enrollments_list)
        }

    def __repr__(self):
        return f'<Course {self.course_code} - {self.course_name}>'

