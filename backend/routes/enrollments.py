from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims
from datetime import datetime, date # Import date specifically

from extensions import db # Import db instance for database operations
from models.enrollments import Enrollment # For saving records
from models.students import Student # Need to import Student to fetch students by criteria
from models.courses import Course # To verify course existence
from sqlalchemy import or_ # Import or_ for OR conditions in queries

enrollments_bp = Blueprint('enrollments', __name__)

# --- Helper to enforce Admin-only access ---
def admin_required():
    """Helper to check if the current authenticated user is an admin."""
    claims = get_jwt()
    user_type = claims.get('user_type')
    if user_type != 'admin':
        return False, jsonify({"message": "Admin access required"}), 403
    return True, None, None

@enrollments_bp.route('/', methods=['POST'])
@jwt_required() # Requires a valid JWT token
def create_enrollment():
    # --- Enforce Admin-only access for creating enrollments ---
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code

    data = request.get_json()
    matricule = data.get('matricule') # Use .get() for safe access
    course_code = data.get('course_code')
    enrollment_date_str = data.get('enrollment_date') # Optional, will default to today if not provided

    # Basic input validation
    if not matricule or not course_code:
        return jsonify({"message": "Student matricule and course code are required"}), 400
    
    try:
        # Verify student exists
        student = Student.query.filter_by(matricule=matricule).first() 
        if not student:
            return jsonify({'message': 'Student not found'}), 404
            
        # Verify course exists
        course = Course.query.get(course_code)
        if not course:
            return jsonify({'message': 'Course not found'}), 404

        # Check if enrollment already exists to prevent duplicates
        existing_enrollment = Enrollment.query.filter_by(
            matricule=matricule,
            course_code=course_code
        ).first()
        if existing_enrollment:
            return jsonify({"message": "Student is already enrolled in this course"}), 409 # Conflict

        # Parse enrollment_date, default to today's date if not provided
        if enrollment_date_str:
            enrollment_date = datetime.strptime(enrollment_date_str, '%Y-%m-%d').date()
        else:
            enrollment_date = datetime.now().date()
        
        new_enrollment = Enrollment(
            matricule=matricule,
            course_code=course_code,
            enrollment_date=enrollment_date
        )
        
        db.session.add(new_enrollment)
        db.session.commit()

        return jsonify({
            "message": "Enrollment created successfully",
            "enrollment": new_enrollment.to_dict()
        }), 201 # Created

    except ValueError as e:
        current_app.logger.error(f"Date parsing error: {e}")
        return jsonify({"message": f"Invalid date format for enrollment_date. ExpectedAPAC-MM-DD. Error: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating enrollment: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@enrollments_bp.route('/bulk', methods=['POST'])
@jwt_required()
def bulk_enroll_students():
    # --- Enforce Admin-only access for bulk enrollment ---
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code

    data = request.get_json()
    course_code = data.get('course_code')
    
    # Optional filters:
    matricules_filter = data.get('matricules') # List of specific matricules (reintroduced)
    departments_filter = data.get('departments') # List of departments
    # Handle both 'level' (singular) and 'levels' (plural)
    levels_filter = data.get('levels')
    level_singular_filter = data.get('level') 

    if not course_code:
        return jsonify({"message": "Course code is required for enrollment"}), 400

    # Verify course exists
    course = Course.query.get(course_code)
    if not course:
        return jsonify({'message': 'Course not found'}), 404

    students_to_process = []
    
    # Process levels filter: if singular 'level' is provided, convert to a list for consistency
    if level_singular_filter is not None and levels_filter is None:
        if not isinstance(level_singular_filter, str):
            return jsonify({"message": "'level' must be a string if provided"}), 400
        levels_filter = [level_singular_filter]
    elif levels_filter is not None and not isinstance(levels_filter, list):
        return jsonify({"message": "'levels' must be a list if provided"}), 400
    # If both provided, 'levels' (plural) takes precedence. No explicit handling needed, as levels_filter would be set if present.


    # --- Logic Priority: Specific matricules > Department/Level filters > All Students ---
    if matricules_filter is not None: # If 'matricules' key is explicitly provided (even if empty list)
        if not isinstance(matricules_filter, list):
            return jsonify({"message": "'matricules' must be a list if provided"}), 400
        
        if not matricules_filter: # Empty matricules list means enroll ALL students
            students_to_process = Student.query.all()
        else:
            # Fetch specific students by their matricules
            students_to_process = Student.query.filter(Student.matricule.in_(matricules_filter)).all()
            
            # Check for invalid matricules provided
            found_matricules = {s.matricule for s in students_to_process}
            invalid_matricules = [m for m in matricules_filter if m not in found_matricules]
            if invalid_matricules:
                return jsonify({
                    "message": "One or more provided student matricules were not found",
                    "invalid_matricules": invalid_matricules
                }), 404
    else: # 'matricules' key was NOT provided, so apply department/level filters or get all
        student_query = Student.query
        filters_applied = False

        if departments_filter:
            if not isinstance(departments_filter, list):
                return jsonify({"message": "'departments' must be a list if provided"}), 400
            student_query = student_query.filter(Student.department.in_(departments_filter))
            filters_applied = True
        
        if levels_filter:
            student_query = student_query.filter(Student.level.in_(levels_filter))
            filters_applied = True
        
        if not filters_applied: # If no department/level filters were provided either, enroll all students
            students_to_process = Student.query.all()
        else:
            students_to_process = student_query.all()

    if not students_to_process:
        return jsonify({
            "message": "No students found matching the provided criteria."
        }), 404


    enrollment_date = datetime.now().date() # Default bulk enrollment date to today
    
    success_count = 0
    skipped_count = 0
    failed_count = 0
    enrollment_results = []

    for student in students_to_process:
        try:
            # Check if student is already enrolled in this course
            existing_enrollment = Enrollment.query.filter_by(
                matricule=student.matricule,
                course_code=course_code
            ).first()

            if existing_enrollment:
                skipped_count += 1
                enrollment_results.append({
                    "matricule": student.matricule,
                    "status": "skipped",
                    "reason": "Already enrolled"
                })
                continue # Skip to the next student

            new_enrollment = Enrollment(
                matricule=student.matricule,
                course_code=course_code,
                enrollment_date=enrollment_date
            )
            db.session.add(new_enrollment)
            success_count += 1
            enrollment_results.append({
                "matricule": student.matricule,
                "status": "success",
                "enrollment_id": None # Placeholder, ID is generated on commit
            })
        except Exception as e:
            failed_count += 1
            current_app.logger.error(f"Failed to enroll student {student.matricule} in {course_code}: {e}")
            enrollment_results.append({
                "matricule": student.matricule,
                "status": "failed",
                "reason": str(e)
            })

    try:
        db.session.commit() # Commit all new enrollments at once
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Final commit failed for bulk enrollment: {e}")
        return jsonify({"message": f"Bulk enrollment process failed during final commit: {str(e)}", "results": enrollment_results}), 500


    return jsonify({
        "message": "Bulk enrollment process completed",
        "total_students_selected_for_processing": len(students_to_process), # Total students considered
        "successfully_enrolled": success_count,
        "skipped_already_enrolled": skipped_count,
        "failed_to_enroll": failed_count,
        "results": enrollment_results # Detailed results for each student
    }), 200

@enrollments_bp.route('/student/<string:matricule>', methods=['GET'])
@jwt_required() # Requires authentication to view student enrollments
def get_student_enrollments(matricule):
    # Optional: You might want to restrict this to admin or the specific student themselves
    try:
        enrollments = Enrollment.query.filter_by(matricule=matricule).all()
        return jsonify([enrollment.to_dict() for enrollment in enrollments]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching enrollments for student {matricule}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@enrollments_bp.route('/course/<string:course_code>', methods=['GET'])
@jwt_required() # Requires authentication to view course enrollments
def get_course_enrollments(course_code):
    # Optional: Restrict to admin or lecturer teaching the course
    try:
        enrollments = Enrollment.query.filter_by(course_code=course_code).all()
        return jsonify([enrollment.to_dict() for enrollment in enrollments]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching enrollments for course {course_code}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# You might also want PUT/DELETE endpoints for enrollments
# @enrollments_bp.route('/<int:enrollment_id>', methods=['DELETE'])
# @jwt_required()
# def delete_enrollment(enrollment_id):
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code
#     
#     enrollment = Enrollment.query.get_or_404(enrollment_id)
#     try:
#         db.session.delete(enrollment)
#         db.session.commit()
#         return jsonify({"message": "Enrollment deleted successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Error deleting enrollment {enrollment_id}: {e}")
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500




# # from flask import Blueprint, request, jsonify, current_app
# # from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims
# # from models.enrollments import Enrollment
# # from models.students import Student # Need to import Student to fetch all students
# # from models.courses import Course
# # from extensions import db
# # from datetime import datetime

# # enrollments_bp = Blueprint('enrollments', __name__)

# # # --- Helper to enforce Admin-only access ---
# # def admin_required():
# #     """Helper to check if the current authenticated user is an admin."""
# #     claims = get_jwt()
# #     user_type = claims.get('user_type')
# #     if user_type != 'admin':
# #         return False, jsonify({"message": "Admin access required"}), 403
# #     return True, None, None

# # @enrollments_bp.route('/', methods=['POST'])
# # @jwt_required() # Requires a valid JWT token
# # def create_enrollment():
# #     # --- Enforce Admin-only access for creating enrollments ---
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code

# #     data = request.get_json()
# #     matricule = data.get('matricule') # Use .get() for safe access
# #     course_code = data.get('course_code')
# #     enrollment_date_str = data.get('enrollment_date') # Optional, will default to today if not provided

# #     # Basic input validation
# #     if not matricule or not course_code:
# #         return jsonify({"message": "Student matricule and course code are required"}), 400
    
# #     try:
# #         # Verify student exists
# #         # FIX: Use 'matricule' to query, matching the Student model's primary key
# #         student = Student.query.filter_by(matricule=matricule).first() 
# #         if not student:
# #             return jsonify({'message': 'Student not found'}), 404
            
# #         # Verify course exists
# #         course = Course.query.get(course_code)
# #         if not course:
# #             return jsonify({'message': 'Course not found'}), 404

# #         # Check if enrollment already exists to prevent duplicates
# #         existing_enrollment = Enrollment.query.filter_by(
# #             matricule=matricule,
# #             course_code=course_code
# #         ).first()
# #         if existing_enrollment:
# #             return jsonify({"message": "Student is already enrolled in this course"}), 409 # Conflict

# #         # Parse enrollment_date, default to today's date if not provided
# #         if enrollment_date_str:
# #             enrollment_date = datetime.strptime(enrollment_date_str, '%Y-%m-%d').date()
# #         else:
# #             enrollment_date = datetime.now().date()
        
# #         new_enrollment = Enrollment(
# #             matricule=matricule,
# #             course_code=course_code,
# #             enrollment_date=enrollment_date
# #         )
        
# #         db.session.add(new_enrollment)
# #         db.session.commit()

# #         return jsonify({
# #             "message": "Enrollment created successfully",
# #             "enrollment": new_enrollment.to_dict()
# #         }), 201 # Created

# #     except ValueError as e:
# #         current_app.logger.error(f"Date parsing error: {e}")
# #         return jsonify({"message": f"Invalid date format for enrollment_date. ExpectedAPAC-MM-DD. Error: {str(e)}"}), 400
# #     except Exception as e:
# #         db.session.rollback()
# #         current_app.logger.error(f"Error creating enrollment: {e}")
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # @enrollments_bp.route('/bulk', methods=['POST'])
# # @jwt_required()
# # def bulk_enroll_students():
# #     # --- Enforce Admin-only access for bulk enrollment ---
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code

# #     data = request.get_json()
# #     course_code = data.get('course_code')
# #     # NEW: Optional list of specific student matricules to enroll
# #     student_matricules_to_enroll = data.get('student_matricules')

# #     if not course_code:
# #         return jsonify({"message": "Course code is required for enrollment"}), 400

# #     # Verify course exists
# #     course = Course.query.get(course_code)
# #     if not course:
# #         return jsonify({'message': 'Course not found'}), 404

# #     students_to_process = []
# #     if student_matricules_to_enroll is not None: # User provided the key
# #         if not isinstance(student_matricules_to_enroll, list):
# #             return jsonify({"message": "If provided, 'student_matricules' must be a list"}), 400
        
# #         if not student_matricules_to_enroll: # Empty list provided, means enroll all
# #             students_to_process = Student.query.all()
# #             total_students_selected = len(students_to_process)
# #         else:
# #             # Fetch specific students by their matricules
# #             # FIX: Use 'matricule' for filtering, matching the Student model's primary key
# #             students_to_process = Student.query.filter(Student.matricule.in_(student_matricules_to_enroll)).all()
# #             total_students_selected = len(student_matricules_to_enroll)
            
# #             # Check for invalid matricules provided
# #             # FIX: Use 'matricule' for found matricules set
# #             found_matricules = {s.matricule for s in students_to_process}
# #             invalid_matricules = [m for m in student_matricules_to_enroll if m not in found_matricules]
# #             if invalid_matricules:
# #                 return jsonify({
# #                     "message": "One or more provided student matricules were not found",
# #                     "invalid_matricules": invalid_matricules
# #                 }), 404
# #     else: # 'student_matricules' key was not provided, so enroll all
# #         students_to_process = Student.query.all()
# #         total_students_selected = len(students_to_process)
    
# #     enrollment_date = datetime.now().date() # Default bulk enrollment date to today
    
# #     success_count = 0
# #     skipped_count = 0
# #     failed_count = 0
# #     enrollment_results = []

# #     for student in students_to_process:
# #         try:
# #             # Check if student is already enrolled in this course
# #             # FIX: Use 'student.matricule' here
# #             existing_enrollment = Enrollment.query.filter_by(
# #                 matricule=student.matricule,
# #                 course_code=course_code
# #             ).first()

# #             if existing_enrollment:
# #                 skipped_count += 1
# #                 enrollment_results.append({
# #                     "matricule": student.matricule, # FIX: Use student.matricule in result
# #                     "status": "skipped",
# #                     "reason": "Already enrolled"
# #                 })
# #                 continue # Skip to the next student

# #             new_enrollment = Enrollment(
# #                 matricule=student.matricule, # FIX: Use student.matricule here
# #                 course_code=course_code,
# #                 enrollment_date=enrollment_date
# #             )
# #             db.session.add(new_enrollment)
# #             success_count += 1
# #             # Note: enrollment_id will only be available after commit, so we update it later
# #             enrollment_results.append({
# #                 "matricule": student.matricule, # FIX: Use student.matricule in result
# #                 "status": "success",
# #                 "enrollment_id": None # Placeholder, will be updated after commit
# #             })
# #         except Exception as e:
# #             failed_count += 1
# #             current_app.logger.error(f"Failed to enroll student {student.matricule} in {course_code}: {e}") # FIX: Use student.matricule in log
# #             enrollment_results.append({
# #                 "matricule": student.matricule, # FIX: Use student.matricule in result
# #                 "status": "failed",
# #                 "reason": str(e)
# #             })
# #             # No rollback here for individual, will rely on outer try/except for full transaction
# #             # However, ensure a session rollback happens if the final commit fails.

# #     try:
# #         db.session.commit() # Commit all new enrollments at once
# #         # After commit, update the enrollment_id for successful enrollments
# #         for result in enrollment_results:
# #             if result['status'] == 'success' and result['enrollment_id'] is None:
# #                 # Re-fetch the enrollment to get its ID, or assume sequential IDs if using SERIAL PK
# #                 # A more robust way might be to store the object and then extract ID after commit
# #                 # For simplicity here, if it was successful, we trust it was committed
# #                 # You might need to query for it if enrollment_id is not guaranteed to be sequential or available immediately.
# #                 # E.g., enrolled_obj = Enrollment.query.filter_by(matricule=result['matricule'], course_code=course_code).first()
# #                 # if enrolled_obj: result['enrollment_id'] = enrolled_obj.enrollment_id
# #                 pass # This part is tricky as ID is generated on commit.
# #                      # For now, keep it None or re-query if truly needed in the response.
# #                      # The main success/fail status is often sufficient for bulk results.

# #     except Exception as e:
# #         db.session.rollback()
# #         current_app.logger.error(f"Final commit failed for bulk enrollment: {e}")
# #         return jsonify({"message": f"Bulk enrollment process failed during final commit: {str(e)}", "results": enrollment_results}), 500


# #     return jsonify({
# #         "message": "Bulk enrollment process completed",
# #         "total_students_processed": len(students_to_process), # Total students in the selection/all
# #         "successfully_enrolled": success_count,
# #         "skipped_already_enrolled": skipped_count,
# #         "failed_to_enroll": failed_count,
# #         "results": enrollment_results # Detailed results for each student
# #     }), 200

# # @enrollments_bp.route('/student/<string:matricule>', methods=['GET'])
# # @jwt_required() # Requires authentication to view student enrollments
# # def get_student_enrollments(matricule):
# #     # Optional: You might want to restrict this to admin or the specific student themselves
# #     # claims = get_jwt()
# #     # if claims.get('user_type') == 'student' and claims.get('id') != matricule:
# #     #     return jsonify({"message": "Access denied to other student's enrollments"}), 403
    
# #     try:
# #         # FIX: Query using 'matricule' directly
# #         enrollments = Enrollment.query.filter_by(matricule=matricule).all()
# #         return jsonify([enrollment.to_dict() for enrollment in enrollments]), 200
# #     except Exception as e:
# #         current_app.logger.error(f"Error fetching enrollments for student {matricule}: {e}")
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # @enrollments_bp.route('/course/<string:course_code>', methods=['GET'])
# # @jwt_required() # Requires authentication to view course enrollments
# # def get_course_enrollments(course_code):
# #     # Optional: Restrict to admin or lecturer teaching the course
# #     try:
# #         enrollments = Enrollment.query.filter_by(course_code=course_code).all()
# #         return jsonify([enrollment.to_dict() for enrollment in enrollments]), 200
# #     except Exception as e:
# #         current_app.logger.error(f"Error fetching enrollments for course {course_code}: {e}")
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # # You might also want PUT/DELETE endpoints for enrollments
# # # @enrollments_bp.route('/<int:enrollment_id>', methods=['DELETE'])
# # # @jwt_required()
# # # def delete_enrollment(enrollment_id):
# # #     is_admin, error_response, status_code = admin_required()
# # #     if not is_admin:
# # #         return error_response, status_code
# # #     
# # #     enrollment = Enrollment.query.get_or_404(enrollment_id)
# # #     try:
# # #         db.session.delete(enrollment)
# # #         db.session.commit()
# # #         return jsonify({"message": "Enrollment deleted successfully"}), 200
# # #     except Exception as e:
# # #         db.session.rollback()
# # #         current_app.logger.error(f"Error deleting enrollment {enrollment_id}: {e}")
# # #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500


# from flask import Blueprint, request, jsonify, current_app
# from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims
# from datetime import datetime, date # Import date specifically

# from extensions import db # Import db instance for database operations
# from models.enrollments import Enrollment # For saving records
# from models.students import Student # Need to import Student to fetch students by criteria
# from models.courses import Course # To verify course existence
# from sqlalchemy import or_ # Import or_ for OR conditions in queries

# enrollments_bp = Blueprint('enrollments', __name__)

# # --- Helper to enforce Admin-only access ---
# def admin_required():
#     """Helper to check if the current authenticated user is an admin."""
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type != 'admin':
#         return False, jsonify({"message": "Admin access required"}), 403
#     return True, None, None

# @enrollments_bp.route('/', methods=['POST'])
# @jwt_required() # Requires a valid JWT token
# def create_enrollment():
#     # --- Enforce Admin-only access for creating enrollments ---
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code

#     data = request.get_json()
#     matricule = data.get('matricule') # Use .get() for safe access
#     course_code = data.get('course_code')
#     enrollment_date_str = data.get('enrollment_date') # Optional, will default to today if not provided

#     # Basic input validation
#     if not matricule or not course_code:
#         return jsonify({"message": "Student matricule and course code are required"}), 400
    
#     try:
#         # Verify student exists
#         student = Student.query.filter_by(matricule=matricule).first() 
#         if not student:
#             return jsonify({'message': 'Student not found'}), 404
            
#         # Verify course exists
#         course = Course.query.get(course_code)
#         if not course:
#             return jsonify({'message': 'Course not found'}), 404

#         # Check if enrollment already exists to prevent duplicates
#         existing_enrollment = Enrollment.query.filter_by(
#             matricule=matricule,
#             course_code=course_code
#         ).first()
#         if existing_enrollment:
#             return jsonify({"message": "Student is already enrolled in this course"}), 409 # Conflict

#         # Parse enrollment_date, default to today's date if not provided
#         if enrollment_date_str:
#             enrollment_date = datetime.strptime(enrollment_date_str, '%Y-%m-%d').date()
#         else:
#             enrollment_date = datetime.now().date()
        
#         new_enrollment = Enrollment(
#             matricule=matricule,
#             course_code=course_code,
#             enrollment_date=enrollment_date
#         )
        
#         db.session.add(new_enrollment)
#         db.session.commit()

#         return jsonify({
#             "message": "Enrollment created successfully",
#             "enrollment": new_enrollment.to_dict()
#         }), 201 # Created

#     except ValueError as e:
#         current_app.logger.error(f"Date parsing error: {e}")
#         return jsonify({"message": f"Invalid date format for enrollment_date. Expected YYYY-MM-DD. Error: {str(e)}"}), 400
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Error creating enrollment: {e}")
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @enrollments_bp.route('/bulk', methods=['POST'])
# @jwt_required()
# def bulk_enroll_students():
#     # --- Enforce Admin-only access for bulk enrollment ---
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code

#     data = request.get_json()
#     course_code = data.get('course_code')
    
#     # NEW: Optional filters for bulk enrollment - now expecting lists
#     departments_filter = data.get('departments') # List of departments
#     levels_filter = data.get('levels')           # List of levels

#     if not course_code:
#         return jsonify({"message": "Course code is required for enrollment"}), 400

#     # Verify course exists
#     course = Course.query.get(course_code)
#     if not course:
#         return jsonify({'message': 'Course not found'}), 404

#     students_to_process = []
    
#     # Validate filter types if provided
#     if departments_filter is not None and not isinstance(departments_filter, list):
#         return jsonify({"message": "'departments' must be a list if provided"}), 400
#     if levels_filter is not None and not isinstance(levels_filter, list):
#         return jsonify({"message": "'levels' must be a list if provided"}), 400

#     # Build student query based on provided filters
#     student_query = Student.query
#     filters_applied = False

#     if departments_filter:
#         student_query = student_query.filter(Student.department.in_(departments_filter))
#         filters_applied = True
    
#     if levels_filter:
#         student_query = student_query.filter(Student.level.in_(levels_filter))
#         filters_applied = True
    
#     if not filters_applied: # If no filters were provided, enroll all students
#         students_to_process = Student.query.all()
#     else:
#         students_to_process = student_query.all()

#     if not students_to_process:
#         return jsonify({
#             "message": "No students found matching the provided criteria."
#         }), 404


#     enrollment_date = datetime.now().date() # Default bulk enrollment date to today
    
#     success_count = 0
#     skipped_count = 0
#     failed_count = 0
#     enrollment_results = []

#     for student in students_to_process:
#         try:
#             # Check if student is already enrolled in this course
#             existing_enrollment = Enrollment.query.filter_by(
#                 matricule=student.matricule,
#                 course_code=course_code
#             ).first()

#             if existing_enrollment:
#                 skipped_count += 1
#                 enrollment_results.append({
#                     "matricule": student.matricule,
#                     "status": "skipped",
#                     "reason": "Already enrolled"
#                 })
#                 continue # Skip to the next student

#             new_enrollment = Enrollment(
#                 matricule=student.matricule,
#                 course_code=course_code,
#                 enrollment_date=enrollment_date
#             )
#             db.session.add(new_enrollment)
#             success_count += 1
#             enrollment_results.append({
#                 "matricule": student.matricule,
#                 "status": "success",
#                 "enrollment_id": None # Placeholder, ID is generated on commit
#             })
#         except Exception as e:
#             failed_count += 1
#             current_app.logger.error(f"Failed to enroll student {student.matricule} in {course_code}: {e}")
#             enrollment_results.append({
#                 "matricule": student.matricule,
#                 "status": "failed",
#                 "reason": str(e)
#             })

#     try:
#         db.session.commit() # Commit all new enrollments at once
        
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Final commit failed for bulk enrollment: {e}")
#         return jsonify({"message": f"Bulk enrollment process failed during final commit: {str(e)}", "results": enrollment_results}), 500


#     return jsonify({
#         "message": "Bulk enrollment process completed",
#         "total_students_selected_for_processing": len(students_to_process), # Total students considered
#         "successfully_enrolled": success_count,
#         "skipped_already_enrolled": skipped_count,
#         "failed_to_enroll": failed_count,
#         "results": enrollment_results # Detailed results for each student
#     }), 200

# @enrollments_bp.route('/student/<string:matricule>', methods=['GET'])
# @jwt_required() # Requires authentication to view student enrollments
# def get_student_enrollments(matricule):
#     # Optional: You might want to restrict this to admin or the specific student themselves
#     try:
#         enrollments = Enrollment.query.filter_by(matricule=matricule).all()
#         return jsonify([enrollment.to_dict() for enrollment in enrollments]), 200
#     except Exception as e:
#         current_app.logger.error(f"Error fetching enrollments for student {matricule}: {e}")
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @enrollments_bp.route('/course/<string:course_code>', methods=['GET'])
# @jwt_required() # Requires authentication to view course enrollments
# def get_course_enrollments(course_code):
#     # Optional: Restrict to admin or lecturer teaching the course
#     try:
#         enrollments = Enrollment.query.filter_by(course_code=course_code).all()
#         return jsonify([enrollment.to_dict() for enrollment in enrollments]), 200
#     except Exception as e:
#         current_app.logger.error(f"Error fetching enrollments for course {course_code}: {e}")
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # You might also want PUT/DELETE endpoints for enrollments
# # @enrollments_bp.route('/<int:enrollment_id>', methods=['DELETE'])
# # @jwt_required()
# # def delete_enrollment(enrollment_id):
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code
# #     
# #     enrollment = Enrollment.query.get_or_404(enrollment_id)
# #     try:
# #         db.session.delete(enrollment)
# #         db.session.commit()
# #         return jsonify({"message": "Enrollment deleted successfully"}), 200
# #     except Exception as e:
# #         db.session.rollback()
# #         current_app.logger.error(f"Error deleting enrollment {enrollment_id}: {e}")
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500
