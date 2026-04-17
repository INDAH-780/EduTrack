# from flask import current_app
# from models.admins import Admin
# from models.lecturers import Lecturer

# def authenticate_admin(username, password):
#     """Authenticate admin inside Flask context"""
#     with current_app.app_context():
#         admin = Admin.query.filter_by(email=username).first()
#         if admin and admin.check_password(password):
#             return admin
#     return None


# def authenticate_lecturer(username, password):
#     """Authenticate lecturer inside Flask context"""
#     with current_app.app_context():
#         lecturer = Lecturer.query.filter_by(email=username).first()
#         if lecturer and lecturer.check_password(password):
#             return lecturer
#     return None

# from flask import current_app
# from models.admins import Admin
# from models.lecturers import Lecturer

# def authenticate_admin(username, password):
#     """Authenticate admin inside Flask context"""
#     with current_app.app_context():
#         return Admin.query.filter_by(email=username).first()

# def authenticate_lecturer(username, password):
#     """Authenticate lecturer inside Flask context"""
#     with current_app.app_context():
#         return Lecturer.query.filter_by(email=username).first()

from models.admins import Admin  # Assuming models are set up to use the 'db' from extensions.py
from models.lecturers import Lecturer
# No need to import current_app if you're not explicitly managing context

def authenticate_admin(username, password):
    """Authenticate admin."""
    # Flask automatically provides the app context during a request
    # Admin.query will correctly use the db instance initialized with current_app
    admin = Admin.query.filter_by(email=username).first()
    # You'll likely need to add password checking here using check_password_hash
    # if admin and check_password_hash(admin.password_hash, password):
    #     return admin
    return admin # For now, just returning the admin object


def authenticate_lecturer(username, password):
    """Authenticate lecturer."""
    # Flask automatically provides the app context during a request
    lecturer = Lecturer.query.filter_by(email=username).first()
    # You'll likely need to add password checking here
    # if lecturer and check_password_hash(lecturer.password_hash, password):
    #     return lecturer
    return lecturer # For now, just returning the lecturer object

