# # from flask import Blueprint, request, jsonify, current_app # Added current_app for logging
# # from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims

# # from extensions import db
# # from models.courses import Course # Ensure this model is correctly defined
# # from models.lecturers import Lecturer # Needed to validate lecturer_id

# # courses_bp = Blueprint('courses', __name__)

# # # --- Helper to enforce Admin-only access ---
# # def admin_required():
# #     """Decorator-like helper to check if the current authenticated user is an admin."""
# #     claims = get_jwt()
# #     user_type = claims.get('user_type')
# #     if user_type != 'admin':
# #         return False, jsonify({"message": "Admin access required"}), 403
# #     return True, None, None

# # @courses_bp.route('/', methods=['GET'])
# # @jwt_required() # Assuming listing courses requires authentication
# # def get_courses():
# #     # Optional: If only admins can list all courses, uncomment this:
# #     # is_admin, error_response, status_code = admin_required()
# #     # if not is_admin:
# #     #     return error_response, status_code

# #     try:
# #         courses = Course.query.all()
# #         # Ensure to_dict() method on Course model correctly handles relationships
# #         courses_data = [course.to_dict() for course in courses]
# #         return jsonify(courses_data), 200
# #     except Exception as e:
# #         current_app.logger.error(f"Error fetching courses: {e}") # Uncomment for logging
# #         return jsonify({"message": f"An error occurred while fetching courses: {str(e)}"}), 500

# # @courses_bp.route('/', methods=['POST'])
# # @jwt_required() # Requires a valid JWT token
# # def create_course():
# #     # --- Enforce Admin-only access for creating courses ---
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code

# #     data = request.get_json()
# #     course_code = data.get('course_code')
# #     course_name = data.get('course_name')
# #     lecturer_id = data.get('lecturer_id')

# #     # Basic input validation
# #     if not course_code or not course_name or not lecturer_id:
# #         return jsonify({"message": "Course code, course name, and lecturer ID are required"}), 400

# #     # Validate course_code uniqueness
# #     if Course.query.filter_by(course_code=course_code).first():
# #         return jsonify({"message": "Course with this code already exists"}), 409 # Conflict

# #     # Validate lecturer_id exists
# #     lecturer = Lecturer.query.get(lecturer_id)
# #     if not lecturer:
# #         return jsonify({"message": "Lecturer not found with the provided ID"}), 404 # Not Found

# #     try:
# #         # Create new Course instance
# #         new_course = Course(
# #             course_code=course_code,
# #             course_name=course_name,
# #             lecturer_id=lecturer_id # Assign the foreign key
# #         )
        
# #         db.session.add(new_course)
# #         db.session.commit()

# #         course_data = new_course.to_dict()

# #         return jsonify({
# #             "message": "Course created successfully",
# #             "course": course_data
# #         }), 201 # Created
# #     except Exception as e:
# #         db.session.rollback() # Rollback in case of an error
# #         current_app.logger.error(f"Error creating course: {e}") # Uncomment for logging
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # @courses_bp.route('/<string:course_code>', methods=['GET'])
# # @jwt_required() # Assuming getting a specific course requires authentication
# # def get_course(course_code):
# #     try:
# #         course = Course.query.get_or_404(course_code)
# #         return jsonify(course.to_dict()), 200
# #     except Exception as e:
# #         current_app.logger.error(f"Error fetching course {course_code}: {e}") # Uncomment for logging
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # @courses_bp.route('/<string:course_code>', methods=['PUT'])
# # @jwt_required()
# # def update_course(course_code):
# #     # --- Enforce Admin-only access for updating courses ---
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code

# #     course = Course.query.get_or_404(course_code) # Corrected: use course_code here, not 'course'
# #     data = request.get_json()
    
# #     try:
# #         # It's usually not good practice to allow updating the primary key (course_code)
# #         # If it were allowed, you'd need careful validation for uniqueness.
# #         # Assuming only name and lecturer_id can be updated.
# #         if 'course_name' in data:
# #             course.course_name = data['course_name']
        
# #         if 'lecturer_id' in data:
# #             lecturer_id = data['lecturer_id']
# #             lecturer = Lecturer.query.get(lecturer_id)
# #             if not lecturer:
# #                 return jsonify({'message': 'Lecturer not found with the provided ID'}), 404
# #             course.lecturer_id = lecturer_id
        
# #         db.session.commit()
# #         return jsonify({"message": "Course updated successfully", "course": course.to_dict()}), 200
# #     except Exception as e:
# #         db.session.rollback()
# #         current_app.logger.error(f"Error updating course {course_code}: {e}") # Uncomment for logging
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # @courses_bp.route('/<string:course_code>', methods=['DELETE'])
# # @jwt_required()
# # def delete_course(course_code):
# #     # --- Enforce Admin-only access for deleting courses ---
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code

# #     course = Course.query.get_or_404(course_code)
    
# #     try:
# #         db.session.delete(course)
# #         db.session.commit()
# #         return jsonify({'message': 'Course deleted successfully'}), 200
# #     except Exception as e:
# #         db.session.rollback()
# #         current_app.logger.error(f"Error deleting course {course_code}: {e}") # Uncomment for logging
# #         # Consider specific error handling if there are dependent records (e.g., integrity error)
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500


# from flask import Blueprint, request, jsonify, current_app # Added current_app for logging
# from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims

# from extensions import db
# from models.courses import Course # Ensure this model is correctly defined
# from models.lecturers import Lecturer # Needed to validate lecturer_id

# courses_bp = Blueprint('courses', __name__)

# # --- Helper to enforce Admin-only access ---
# def admin_required():
#     """Decorator-like helper to check if the current authenticated user is an admin."""
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type != 'admin':
#         return False, jsonify({"message": "Admin access required"}), 403
#     return True, None, None

# @courses_bp.route('/', methods=['GET'])
# @jwt_required() # Assuming listing courses requires authentication
# def get_courses():
#     # Optional: If only admins can list all courses, uncomment this:
#     # is_admin, error_response, status_code = admin_required()
#     # if not is_admin:
#     #     return error_response, status_code

#     try:
#         courses = Course.query.all()
#         # Ensure to_dict() method on Course model correctly handles relationships
#         courses_data = [course.to_dict() for course in courses]
#         return jsonify(courses_data), 200
#     except Exception as e:
#         current_app.logger.error(f"Error fetching courses: {e}") # Uncomment for logging
#         return jsonify({"message": f"An error occurred while fetching courses: {str(e)}"}), 500

# @courses_bp.route('/', methods=['POST'])
# @jwt_required() # Requires a valid JWT token
# def create_course():
#     # --- Enforce Admin-only access for creating courses ---
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code

#     data = request.get_json()
#     course_code = data.get('course_code')
#     course_name = data.get('course_name')
#     lecturer_id = data.get('lecturer_id')
    
#     # --- NEW: Get department, level, semester from request ---
#     department = data.get('department')
#     level = data.get('level')
#     semester = data.get('semester')

#     # Basic input validation for all required fields
#     if not course_code or not course_name or not lecturer_id or \
#        not department or not level or not semester:
#         return jsonify({"message": "Course code, course name, lecturer ID, department, level, and semester are all required"}), 400

#     # Validate course_code uniqueness
#     if Course.query.filter_by(course_code=course_code).first():
#         return jsonify({"message": "Course with this code already exists"}), 409 # Conflict

#     # Validate lecturer_id exists
#     lecturer = Lecturer.query.get(lecturer_id)
#     if not lecturer:
#         return jsonify({"message": "Lecturer not found with the provided ID"}), 404 # Not Found

#     try:
#         # Create new Course instance with all fields
#         new_course = Course(
#             course_code=course_code,
#             course_name=course_name,
#             lecturer_id=lecturer_id, # Assign the foreign key
#             department=department,   # New field
#             level=level,             # New field
#             semester=semester        # New field
#         )
        
#         db.session.add(new_course)
#         db.session.commit()

#         course_data = new_course.to_dict()

#         return jsonify({
#             "message": "Course created successfully",
#             "course": course_data
#         }), 201 # Created
#     except Exception as e:
#         db.session.rollback() # Rollback in case of an error
#         current_app.logger.error(f"Error creating course: {e}") # Uncomment for logging
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @courses_bp.route('/<string:course_code>', methods=['GET'])
# @jwt_required() # Assuming getting a specific course requires authentication
# def get_course(course_code):
#     try:
#         course = Course.query.get_or_404(course_code)
#         return jsonify(course.to_dict()), 200
#     except Exception as e:
#         current_app.logger.error(f"Error fetching course {course_code}: {e}") # Uncomment for logging
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @courses_bp.route('/<string:course_code>', methods=['PUT'])
# @jwt_required()
# def update_course(course_code):
#     # --- Enforce Admin-only access for updating courses ---
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code

#     course = Course.query.get_or_404(course_code) # Corrected: use course_code here, not 'course'
#     data = request.get_json()
    
#     try:
#         if 'course_name' in data:
#             course.course_name = data['course_name']
        
#         if 'lecturer_id' in data:
#             lecturer_id = data['lecturer_id']
#             lecturer = Lecturer.query.get(lecturer_id)
#             if not lecturer:
#                 return jsonify({'message': 'Lecturer not found with the provided ID'}), 404
#             course.lecturer_id = lecturer_id
        
#         # --- NEW: Update department, level, semester ---
#         if 'department' in data:
#             course.department = data['department']
#         if 'level' in data:
#             course.level = data['level']
#         if 'semester' in data:
#             course.semester = data['semester']

#         db.session.commit()
#         return jsonify({"message": "Course updated successfully", "course": course.to_dict()}), 200
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Error updating course {course_code}: {e}") # Uncomment for logging
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @courses_bp.route('/<string:course_code>', methods=['DELETE'])
# @jwt_required()
# def delete_course(course_code):
#     # --- Enforce Admin-only access for deleting courses ---
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code

#     course = Course.query.get_or_404(course_code)
    
#     try:
#         db.session.delete(course)
#         db.session.commit()
#         return jsonify({'message': 'Course deleted successfully'}), 200
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Error deleting course {course_code}: {e}") # Uncomment for logging
#         # Consider specific error handling if there are dependent records (e.g., integrity error)
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims

from extensions import db
from models.courses import Course # Ensure this model is correctly defined
from models.lecturers import Lecturer # Needed to validate lecturer existence by name

courses_bp = Blueprint('courses', __name__)

# --- Helper to enforce Admin-only access ---
def admin_required():
    """Decorator-like helper to check if the current authenticated user is an admin."""
    claims = get_jwt()
    user_type = claims.get('user_type')
    if user_type != 'admin':
        return False, jsonify({"message": "Admin access required"}), 403
    return True, None, None

@courses_bp.route('/', methods=['GET'])
@jwt_required() # Assuming listing courses requires authentication
def get_courses():
    try:
        courses = Course.query.all()
        courses_data = [course.to_dict() for course in courses]
        return jsonify(courses_data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching courses: {e}")
        return jsonify({"message": f"An error occurred while fetching courses: {str(e)}"}), 500

@courses_bp.route('/', methods=['POST'])
@jwt_required() # Requires a valid JWT token
def create_course():
    # --- Enforce Admin-only access for creating courses ---
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code

    data = request.get_json()
    course_code = data.get('course_code')
    course_name = data.get('course_name')
    # CHANGED: Now expecting 'lecturer_name' instead of 'lecturer_id'
    lecturer_name = data.get('lecturer_name') 
    
    department = data.get('department')
    level = data.get('level')
    semester = data.get('semester')

    # Basic input validation for all required fields
    # CHANGED: 'lecturer_name' is now required in the input
    if not course_code or not course_name or not lecturer_name or \
       not department or not level or not semester:
        return jsonify({"message": "Course code, course name, lecturer name, department, level, and semester are all required"}), 400

    # Validate course_code uniqueness
    if Course.query.filter_by(course_code=course_code).first():
        return jsonify({"message": "Course with this code already exists"}), 409 # Conflict

    # NEW LOGIC: Find lecturer by name and get their ID
    lecturer = Lecturer.query.filter_by(name=lecturer_name).first()
    if not lecturer:
        return jsonify({"message": f"Lecturer with name '{lecturer_name}' not found"}), 404 # Not Found
    
    # Use the found lecturer's ID
    lecturer_id_from_name = lecturer.lecturer_id

    try:
        # Create new Course instance with all fields, using the looked-up lecturer_id
        new_course = Course(
            course_code=course_code,
            course_name=course_name,
            lecturer_id=lecturer_id_from_name, # Assign the looked-up foreign key
            department=department,
            level=level,
            semester=semester
        )
        
        db.session.add(new_course)
        db.session.commit()

        course_data = new_course.to_dict()

        return jsonify({
            "message": "Course created successfully",
            "course": course_data
        }), 201 # Created
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating course: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@courses_bp.route('/<string:course_code>', methods=['GET'])
@jwt_required() # Assuming getting a specific course requires authentication
def get_course(course_code):
    try:
        course = Course.query.get_or_404(course_code)
        return jsonify(course.to_dict()), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching course {course_code}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@courses_bp.route('/<string:course_code>', methods=['PUT'])
@jwt_required()
def update_course(course_code):
    # --- Enforce Admin-only access for updating courses ---
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code

    course = Course.query.get_or_404(course_code)
    data = request.get_json()
    
    try:
        if 'course_name' in data:
            course.course_name = data['course_name']
        
        # CHANGED: Allow updating lecturer by 'lecturer_name' or 'lecturer_id' (if both are provided, name takes precedence)
        if 'lecturer_name' in data:
            lecturer_name = data['lecturer_name']
            lecturer = Lecturer.query.filter_by(name=lecturer_name).first()
            if not lecturer:
                return jsonify({'message': f"Lecturer with name '{lecturer_name}' not found"}), 404
            course.lecturer_id = lecturer.lecturer_id # Update using found ID
        elif 'lecturer_id' in data: # Fallback to ID if name not provided
            lecturer_id = data['lecturer_id']
            lecturer = Lecturer.query.get(lecturer_id)
            if not lecturer:
                return jsonify({'message': 'Lecturer not found with the provided ID'}), 404
            course.lecturer_id = lecturer_id
        
        if 'department' in data:
            course.department = data['department']
        if 'level' in data:
            course.level = data['level']
        if 'semester' in data:
            course.semester = data['semester']

        db.session.commit()
        return jsonify({"message": "Course updated successfully", "course": course.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating course {course_code}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@courses_bp.route('/<string:course_code>', methods=['DELETE'])
@jwt_required()
def delete_course(course_code):
    # --- Enforce Admin-only access for deleting courses ---
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code

    course = Course.query.get_or_404(course_code)
    
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting course {course_code}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
