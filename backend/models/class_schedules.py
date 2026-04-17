# # models/class_schedules.py
# from extensions import db
# from models.courses import Course # IMPORTS: Required for the db.relationship to Course

# class ClassSchedule(db.Model):
#     __tablename__ = 'class_schedules'
    
#     schedule_id = db.Column(db.Integer, primary_key=True)
#     course_code = db.Column(db.String(50), db.ForeignKey('courses.course_code'), nullable=False)
#     day_of_week = db.Column(db.String(10), nullable=False)  # 'Monday', 'Tuesday', etc.
#     start_time = db.Column(db.Time, nullable=False)
#     end_time = db.Column(db.Time, nullable=False)
#     location = db.Column(db.String(100))
    
#     # --- IMPORTANT: Define the relationship to the Course model ---
#     course = db.relationship('Course', backref='class_schedules', lazy=True)
    
#     def to_dict(self):
#         return {
#             'schedule_id': self.schedule_id,
#             'course_code': self.course_code,
#             # Access the course's name via the relationship
#             'course_name': self.course.course_name if self.course else None,
#             'day_of_week': self.day_of_week,
#             'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
#             'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
#             'location': self.location
#         }

#     def __repr__(self):
#         return f'<ClassSchedule {self.course_code} on {self.day_of_week} at {self.start_time}>'

# models/class_schedules.py
from extensions import db
# No explicit import for Course needed here due to circular import fixes,
# as the relationship uses a string literal 'Course' and Course is imported via __init__.py

class ClassSchedule(db.Model):
    __tablename__ = 'class_schedules'
    
    schedule_id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(50), db.ForeignKey('courses.course_code'), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)  # 'Monday', 'Tuesday', etc.
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(100))
    
    # --- IMPORTANT: Define the relationship to the Course model ---
    # The backref 'class_schedules' should not conflict as it's plural.
    course = db.relationship('Course', backref='class_schedules', lazy=True)
    
    def to_dict(self):
        return {
            'schedule_id': self.schedule_id,
            'course_code': self.course_code,
            # Access the course's name via the relationship
            'course_name': self.course.course_name if self.course else None,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'location': self.location
        }

    def __repr__(self):
        return f'<ClassSchedule {self.course_code} on {self.day_of_week} at {self.start_time}>'
