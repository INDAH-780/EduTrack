# from .students import Student
# from .face_records import FaceRecord
# from .lecturers import Lecturer
# from .admins import Admin
# from .courses import Course
# from .enrollments import Enrollment
# from .class_schedules import ClassSchedule
# from .attendance_records import AttendanceRecord
# from .attendance_exceptions import AttendanceException

# __all__ = [
#     'Student',
#     'FaceRecord',
#     'Lecturer',
#     'Admin',
#     'Course',
#     'Enrollment',
#     'ClassSchedule',
#     'AttendanceRecord',
#     'AttendanceException'
# ]

# models/__init__.py

# Import all your model classes here so SQLAlchemy can discover and map them.
# The order can be important for resolving relationships correctly.

# models/__init__.py

# models/__init__.py

# Import all your model classes here so SQLAlchemy can discover and map them.
# The order can be important for resolving relationships correctly.

# from .admins import Admin
# from .lecturers import Lecturer
# from .students import Student
# from .courses import Course

# # CRITICAL ORDER: Import ClassSchedule BEFORE AttendanceRecord
# # This ensures ClassSchedule is registered before AttendanceRecord tries to reference it.
# from .class_schedules import ClassSchedule
# from .attendance_records import AttendanceRecord

# from .enrollments import Enrollment
# from .face_records import FaceRecord
# from .attendance_exceptions import AttendanceException # Changed from .exceptions


# models/__init__.py

# Import all your model classes here so SQLAlchemy can discover and map them.
# The order can be important for resolving relationships correctly.

from .admins import Admin
from .lecturers import Lecturer
from .students import Student
from .courses import Course

# CRITICAL ORDER: Import ClassSchedule BEFORE AttendanceRecord
# This ensures ClassSchedule is registered before AttendanceRecord tries to reference it.
from .class_schedules import ClassSchedule
from .attendance_records import AttendanceRecord

from .enrollments import Enrollment
from .face_records import FaceRecord
from .attendance_exceptions import AttendanceException # Changed from .exceptions







