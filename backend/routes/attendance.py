# # from flask import Blueprint, request, jsonify, current_app
# # from flask_jwt_extended import jwt_required, get_jwt
# # from datetime import datetime, date, time # Import date and time specifically
# # import os
# # import tempfile
# # # No longer import FaceRecognitionService directly here, as it's fetched from app.config
# # # from services.face_recognition_service import FaceRecognitionService
# # from config import Config # Assuming Config is needed for YOLO_MODEL_PATH in the service init

# # from extensions import db # Import db instance for database operations
# # from models.attendance_records import AttendanceRecord # For saving records
# # from models.class_schedules import ClassSchedule # For linking to schedules
# # from models.courses import Course # For linking to courses
# # from models.enrollments import Enrollment # To check if student is enrolled
# # from models.attendance_exceptions import AttendanceException # NEW: Import AttendanceException model

# # attendance_bp = Blueprint('attendance', __name__)

# # # --- Helper to enforce Admin/Lecturer access (adjust as needed for your app's roles) ---
# # def admin_or_lecturer_required():
# #     """Helper to check if the current authenticated user is an admin or lecturer."""
# #     claims = get_jwt()
# #     user_type = claims.get('user_type')
# #     if user_type not in ['admin', 'lecturer']:
# #         return False, jsonify({"message": "Admin or Lecturer access required"}), 403
# #     return True, None, None

# # # --- Helper to enforce Admin-only access ---
# # def admin_required():
# #     """Helper to check if the current authenticated user is an admin."""
# #     claims = get_jwt()
# #     user_type = claims.get('user_type')
# #     if user_type != 'admin':
# #         return False, jsonify({"message": "Admin access required"}), 403
# #     return True, None, None

# # @attendance_bp.route('/mark', methods=[' '])
# # @jwt_required()
# # def mark_attendance():
# #     # --- Enforce Admin/Lecturer access for marking attendance ---
# #     is_authorized, error_response, status_code = admin_or_lecturer_required()
# #     if not is_authorized:
# #         return error_response, status_code

# #     if 'file' not in request.files:
# #         return jsonify({'error': 'No image provided'}), 400
    
# #     image_file = request.files['file']
# #     course_code = request.form.get('course_code')
# #     schedule_id = request.form.get('schedule_id') # New: Expect schedule_id for specific class instance
    
# #     # Basic input validation for required fields
# #     if not course_code or not schedule_id:
# #         return jsonify({'error': 'Course code and Schedule ID are required'}), 400
    
# #     temp_path = None # Initialize temp_path
# #     try:
# #         # Validate schedule_id and course_code
# #         schedule = ClassSchedule.query.get(schedule_id)
# #         if not schedule:
# #             return jsonify({'message': f'Class schedule with ID {schedule_id} not found'}), 404
        
# #         if schedule.course_code != course_code:
# #             return jsonify({'message': 'Schedule ID does not match the provided course code'}), 400

# #         # Optional: Check if the current time is within the schedule's time range
# #         # current_time = datetime.now().time()
# #         # if not (schedule.start_time <= current_time <= schedule.end_time):
# #         #     return jsonify({'message': 'Attendance can only be marked during scheduled class time'}), 400

# #         # Save temporary image file
# #         with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
# #             image_file.save(temp_file.name)
# #             temp_path = temp_file.name
        
# #         # Get the initialized face recognition service from app.config
# #         face_service = current_app.config['FACE_SERVICE']
        
# #         # Perform face recognition
# #         result = face_service.recognize_from_image(temp_path)
        
# #         # Process attendance for each detected student
# #         recorded_attendance_data = []
        
# #         # Fetch all enrollments for this course to easily check if detected students are enrolled
# #         # This reduces repeated DB queries inside the loop.
# #         course_enrollments = Enrollment.query.filter_by(course_code=course_code).all()
# #         enrolled_matricules_in_course = {e.matricule for e in course_enrollments}

# #         for matricule in result['detected_students']:
# #             # Only mark attendance if the student is actually enrolled in this course
# #             if matricule in enrolled_matricules_in_course:
# #                 # Create attendance record
# #                 new_record = AttendanceRecord(
# #                     matricule=matricule,
# #                     course_code=course_code,
# #                     schedule_id=schedule_id, # Link to the specific schedule
# #                     date=date.today(),       # Record today's date
# #                     status='PRESENT',
# #                     timestamp=datetime.now(),
# #                     verified_by_face=True
# #                 )
# #                 db.session.add(new_record)
# #                 recorded_attendance_data.append(new_record.to_dict()) # Add to_dict representation
# #             else:
# #                 current_app.logger.warning(f"Detected student {matricule} is not enrolled in {course_code}. Skipping attendance.")
# #                 result['unrecognized_faces'].append(f"Detected but not enrolled: {matricule}") # Add to unrecognized for feedback
        
# #         db.session.commit() # Commit all new attendance records in one go

# #         return jsonify({
# #             'success': True,
# #             'message': 'Attendance marked successfully',
# #             'total_detected_students': len(result['detected_students']),
# #             'recognized_and_enrolled_students': len(recorded_attendance_data),
# #             'unrecognized_faces': result['unrecognized_faces'],
# #             'attendance_records_created': recorded_attendance_data,
# #             'annotated_image': result.get('frame_with_annotations', None) # If your service returns this
# #         }), 200
    
# #     except Exception as e:
# #         db.session.rollback() # Rollback changes if any error occurs
# #         current_app.logger.error(f"Error marking attendance: {e}", exc_info=True) # Log the full traceback
# #         return jsonify({'error': str(e)}), 500
# #     finally:
# #         # Clean up the temporary file
# #         if temp_path and os.path.exists(temp_path):
# #             os.remove(temp_path)

# # @attendance_bp.route('/report', methods=['GET'])
# # @jwt_required()
# # def get_attendance_report():
# #     # --- Enforce Admin/Lecturer access for attendance reports ---
# #     is_authorized, error_response, status_code = admin_or_lecturer_required()
# #     if not is_authorized:
# #         return error_response, status_code

# #     course_code = request.args.get('course_code')
# #     schedule_id = request.args.get('schedule_id', type=int) # Optional: filter by specific schedule

# #     if not course_code:
# #         return jsonify({'error': 'Course code is required'}), 400
    
# #     try:
# #         # Build query for attendance records
# #         query = AttendanceRecord.query.filter_by(course_code=course_code)
# #         if schedule_id:
# #             query = query.filter_by(schedule_id=schedule_id)
        
# #         records = query.all()
        
# #         # Fetch all enrolled students for this course
# #         enrolled_students = Enrollment.query.filter_by(course_code=course_code).all()
# #         enrolled_matricules = {e.matricule for e in enrolled_students}

# #         # Determine attendance status for each enrolled student
# #         attendance_summary = {}
# #         for matricule in enrolled_matricules:
# #             attendance_summary[matricule] = {
# #                 'total_sessions': 0,
# #                 'present_sessions': 0,
# #                 'absent_sessions': 0,
# #                 'latest_status': 'N/A'
# #             }
        
# #         # Populate attendance data from records
# #         for record in records:
# #             if record.matricule in attendance_summary:
# #                 attendance_summary[record.matricule]['total_sessions'] += 1
# #                 if record.status == 'PRESENT':
# #                     attendance_summary[record.matricule]['present_sessions'] += 1
# #                 else:
# #                     attendance_summary[record.matricule]['absent_sessions'] += 1 # 'ABSENT' or 'LATE'
# #                 attendance_summary[record.matricule]['latest_status'] = record.status

# #         # You can add more complex reporting here, e.g., linking to student names
# #         # from models.students import Student
# #         # for matricule, data in attendance_summary.items():
# #         #     student = Student.query.get(matricule)
# #         #     data['student_name'] = student.name if student else 'Unknown'

# #         # This simple report returns a dictionary of matricule -> summary
# #         return jsonify(attendance_summary), 200
    
# #     except Exception as e:
# #         current_app.logger.error(f"Error generating attendance report for course {course_code}: {e}", exc_info=True)
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# # @attendance_bp.route('/video-feed', methods=['POST'])
# # @jwt_required()
# # def video_feed():
# #     """
# #     Endpoint for processing video stream frames.
# #     This endpoint would typically receive frames one by one from a client.
# #     The client would continuously send image data (e.g., JPEG snapshots)
# #     which this endpoint processes similarly to `/mark`.
# #     """
# #     # This example assumes you send a single image frame per POST request.
# #     # For a true "live stream", the client would send a continuous stream of images.

# #     # This is similar to mark_attendance, but optimized for continuous frames
# #     # You would typically add logic here to:
# #     # 1. Receive a frame (e.g., base64 encoded image or multipart form data).
# #     # 2. Process it with face_service.recognize_from_image.
# #     # 3. Mark attendance if student is recognized and enrolled.
# #     # 4. Return results (e.g., detected students, unrecognized faces) to the client.

# #     # To make this truly "live", the client would send frames in a loop,
# #     # and the server would ideally stream responses back (e.g., Server-Sent Events or WebSockets)
# #     # This current Flask setup typically handles one request/response at a time.

# #     # Re-using mark_attendance logic would be a starting point for per-frame processing
# #     # For simplicity, returning a placeholder message for now.
# #     return jsonify({'message': 'Video stream processing endpoint is active. Implement frame processing here.'}), 200

# # # --- NEW: Route for creating attendance exceptions ---
# # @attendance_bp.route('/exceptions', methods=['POST'])
# # @jwt_required() # Requires authentication
# # def create_attendance_exception():
# #     # Only Admin users can create/log attendance exceptions
# #     is_admin, error_response, status_code = admin_required()
# #     if not is_admin:
# #         return error_response, status_code
    
# #     data = request.get_json()
# #     attendance_id = data.get('attendance_id')
# #     reason = data.get('reason')
# #     updated_status = data.get('updated_status') # The new status for the attendance record (e.g., 'PRESENT' from 'ABSENT')

# #     # Basic input validation
# #     if not attendance_id or not reason or not updated_status:
# #         return jsonify({"message": "Attendance ID, reason, and updated status are required"}), 400

# #     # Validate updated_status
# #     valid_statuses = ['PRESENT', 'ABSENT', 'LATE']
# #     if updated_status not in valid_statuses:
# #         return jsonify({"message": f"Invalid updated status. Must be one of: {', '.join(valid_statuses)}"}), 400

# #     try:
# #         # Check if the attendance record exists
# #         attendance_record = AttendanceRecord.query.get(attendance_id)
# #         if not attendance_record:
# #             return jsonify({"message": f"Attendance record with ID {attendance_id} not found"}), 404

# #         # Get the admin's ID from the JWT claims to record who created/approved the exception
# #         claims = get_jwt()
# #         approved_by_admin_id = claims.get('sub') # 'sub' claim usually holds the identity (admin_id in this case)

# #         # Create the new AttendanceException record
# #         new_exception = AttendanceException(
# #             attendance_id=attendance_id,
# #             reason=reason,
# #             updated_status=updated_status,
# #             approved_by=approved_by_admin_id, # Link to the admin who initiated this exception
# #             approval_date=datetime.now() # Record the date/time of exception creation
# #         )
# #         db.session.add(new_exception)

# #         # Optional: Update the actual attendance record's status immediately
# #         # This makes the attendance record reflect the exception right away.
# #         attendance_record.status = updated_status
# #         db.session.add(attendance_record) # Mark the record as modified

# #         db.session.commit()

# #         return jsonify({
# #             "message": "Attendance exception recorded successfully",
# #             "exception": {
# #                 "exception_id": new_exception.exception_id,
# #                 "attendance_id": new_exception.attendance_id,
# #                 "reason": new_exception.reason,
# #                 "updated_status": new_exception.updated_status,
# #                 "approved_by": new_exception.approved_by,
# #                 "approval_date": new_exception.approval_date.isoformat()
# #             }
# #         }), 201 # Created
    
# #     except Exception as e:
# #         db.session.rollback()
# #         current_app.logger.error(f"Error creating attendance exception: {e}", exc_info=True)
# #         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# from flask import Blueprint, request, jsonify, current_app
# from flask_jwt_extended import jwt_required, get_jwt
# from datetime import datetime, date # Import date specifically
# import os
# import tempfile
# import base64 # NEW: Import base64 for decoding image data
# import cv2 # NEW: Import cv2 for image operations (saving from raw bytes if needed)
# import numpy as np # NEW: Import numpy for array manipulation if using cv2.imdecode

# from extensions import db # Import db instance for database operations
# from models.attendance_records import AttendanceRecord # For saving records
# from models.class_schedules import ClassSchedule # For linking to schedules
# from models.courses import Course # For linking to courses
# from models.enrollments import Enrollment # To check if student is enrolled
# from models.attendance_exceptions import AttendanceException # Import AttendanceException model

# attendance_bp = Blueprint('attendance', __name__)

# # --- Helper to enforce Admin/Lecturer access (adjust as needed for your app's roles) ---
# def admin_or_lecturer_required():
#     """Helper to check if the current authenticated user is an admin or lecturer."""
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type not in ['admin', 'lecturer']:
#         return False, jsonify({"message": "Admin or Lecturer access required"}), 403
#     return True, None, None

# # --- Helper to enforce Admin-only access ---
# def admin_required():
#     """Helper to check if the current authenticated user is an admin."""
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type != 'admin':
#         return False, jsonify({"message": "Admin access required"}), 403
#     return True, None, None

# @attendance_bp.route('/mark', methods=['POST'])
# @jwt_required()
# def mark_attendance():
#     # --- Enforce Admin/Lecturer access for marking attendance ---
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code

#     data = request.get_json() # Expecting JSON body
#     image_data_base64 = data.get('image_data') # Base64 encoded image string
#     course_code = data.get('course_code')
#     schedule_id = data.get('schedule_id') # Expect schedule_id for specific class instance
    
#     # Basic input validation for required fields
#     if not image_data_base64 or not course_code or not schedule_id:
#         return jsonify({'error': 'Image data (base64), course code, and Schedule ID are required'}), 400
    
#     temp_path = None # Initialize temp_path
#     try:
#         # Validate schedule_id and course_code
#         schedule = ClassSchedule.query.get(schedule_id)
#         if not schedule:
#             return jsonify({'message': f'Class schedule with ID {schedule_id} not found'}), 404
        
#         if schedule.course_code != course_code:
#             return jsonify({'message': 'Schedule ID does not match the provided course code'}), 400

#         # Optional: Check if the current time is within the schedule's time range
#         # current_time = datetime.now().time()
#         # if not (schedule.start_time <= current_time <= schedule.end_time):
#         #     return jsonify({'message': 'Attendance can only be marked during scheduled class time'}), 400

#         # Decode the base64 image data and save to a temporary file
#         img_bytes = base64.b64decode(image_data_base64)
        
#         # Using tempfile to create a secure temporary file
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
#             temp_file.write(img_bytes)
#             temp_path = temp_file.name
        
#         # Get the initialized face recognition service from app.config
#         face_service = current_app.config['FACE_SERVICE']
        
#         # Perform face recognition
#         result = face_service.recognize_from_image(temp_path)
        
#         # Process attendance for each detected student
#         recorded_attendance_data = []
        
#         # Fetch all enrollments for this course to easily check if detected students are enrolled
#         course_enrollments = Enrollment.query.filter_by(course_code=course_code).all()
#         enrolled_matricules_in_course = {e.matricule for e in course_enrollments}

#         for matricule in result['detected_students']:
#             # Only mark attendance if the student is actually enrolled in this course
#             if matricule in enrolled_matricules_in_course:
#                 # Create attendance record
#                 new_record = AttendanceRecord(
#                     matricule=matricule,
#                     course_code=course_code,
#                     schedule_id=schedule_id, # Link to the specific schedule
#                     date=date.today(),       # Record today's date
#                     status='PRESENT',
#                     timestamp=datetime.now(),
#                     verified_by_face=True
#                 )
#                 db.session.add(new_record)
#                 recorded_attendance_data.append(new_record.to_dict()) # Add to_dict representation
#             else:
#                 current_app.logger.warning(f"Detected student {matricule} is not enrolled in {course_code}. Skipping attendance.")
#                 result['unrecognized_faces'].append(f"Detected but not enrolled: {matricule}") # Add to unrecognized for feedback
        
#         db.session.commit() # Commit all new attendance records in one go

#         return jsonify({
#             'success': True,
#             'message': 'Attendance marked successfully',
#             'total_detected_students': len(result['detected_students']),
#             'recognized_and_enrolled_students': len(recorded_attendance_data),
#             'unrecognized_faces': result['unrecognized_faces'],
#             'attendance_records_created': recorded_attendance_data,
#             'annotated_image': result.get('frame_with_annotations', None) # If your service returns this
#         }), 200
    
#     except Exception as e:
#         db.session.rollback() # Rollback changes if any error occurs
#         current_app.logger.error(f"Error marking attendance: {e}", exc_info=True) # Log the full traceback
#         return jsonify({'error': str(e)}), 500
#     finally:
#         # Clean up the temporary file
#         if temp_path and os.path.exists(temp_path):
#             os.remove(temp_path)

# @attendance_bp.route('/report', methods=['GET'])
# @jwt_required()
# def get_attendance_report():
#     # --- Enforce Admin/Lecturer access for attendance reports ---
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code

#     course_code = request.args.get('course_code')
#     schedule_id = request.args.get('schedule_id', type=int) # Optional: filter by specific schedule

#     if not course_code:
#         return jsonify({'error': 'Course code is required'}), 400
    
#     try:
#         # Build query for attendance records
#         query = AttendanceRecord.query.filter_by(course_code=course_code)
#         if schedule_id:
#             query = query.filter_by(schedule_id=schedule_id)
        
#         records = query.all()
        
#         # Fetch all enrolled students for this course
#         enrolled_students = Enrollment.query.filter_by(course_code=course_code).all()
#         enrolled_matricules = {e.matricule for e in enrolled_students}

#         # Determine attendance status for each enrolled student
#         attendance_summary = {}
#         for matricule in enrolled_matricules:
#             attendance_summary[matricule] = {
#                 'total_sessions': 0,
#                 'present_sessions': 0,
#                 'absent_sessions': 0,
#                 'latest_status': 'N/A'
#             }
        
#         # Populate attendance data from records
#         for record in records:
#             if record.matricule in attendance_summary:
#                 attendance_summary[record.matricule]['total_sessions'] += 1
#                 if record.status == 'PRESENT':
#                     attendance_summary[record.matricule]['present_sessions'] += 1
#                 else:
#                     attendance_summary[record.matricule]['absent_sessions'] += 1 # 'ABSENT' or 'LATE'
#                 attendance_summary[record.matricule]['latest_status'] = record.status

#         return jsonify(attendance_summary), 200
    
#     except Exception as e:
#         current_app.logger.error(f"Error generating attendance report for course {course_code}: {e}", exc_info=True)
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @attendance_bp.route('/video-feed', methods=['POST'])
# @jwt_required()
# def video_feed():
#     """
#     Placeholder for processing video stream frames.
#     This endpoint would typically receive frames one by one from a client.
#     The client would continuously send image data (e.g., JPEG snapshots)
#     which this endpoint processes similarly to `/mark`.
#     """
#     # For simplicity, returning a placeholder message for now.
#     return jsonify({'message': 'Video stream processing endpoint is active. Implement frame processing here.'}), 200

# # --- NEW: Route for creating attendance exceptions ---
# @attendance_bp.route('/exceptions', methods=['POST'])
# @jwt_required() # Requires authentication
# def create_attendance_exception():
#     # Only Admin users can create/log attendance exceptions
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code
    
#     data = request.get_json()
#     attendance_id = data.get('attendance_id')
#     reason = data.get('reason')
#     updated_status = data.get('updated_status') # The new status for the attendance record (e.g., 'PRESENT' from 'ABSENT')

#     # Basic input validation
#     if not attendance_id or not reason or not updated_status:
#         return jsonify({"message": "Attendance ID, reason, and updated status are required"}), 400

#     # Validate updated_status
#     valid_statuses = ['PRESENT', 'ABSENT', 'LATE']
#     if updated_status not in valid_statuses:
#         return jsonify({"message": f"Invalid updated status. Must be one of: {', '.join(valid_statuses)}"}), 400

#     try:
#         # Check if the attendance record exists
#         attendance_record = AttendanceRecord.query.get(attendance_id)
#         if not attendance_record:
#             return jsonify({"message": f"Attendance record with ID {attendance_id} not found"}), 404

#         # Get the admin's ID from the JWT claims to record who created/approved the exception
#         claims = get_jwt()
#         approved_by_admin_id = claims.get('sub') # 'sub' claim usually holds the identity (admin_id in this case)

#         # Create the new AttendanceException record
#         new_exception = AttendanceException(
#             attendance_id=attendance_id,
#             reason=reason,
#             updated_status=updated_status,
#             approved_by=approved_by_admin_id, # Link to the admin who initiated this exception
#             approval_date=datetime.now() # Record the date/time of exception creation
#         )
#         db.session.add(new_exception)

#         # Optional: Update the actual attendance record's status immediately
#         # This makes the attendance record reflect the exception right away.
#         attendance_record.status = updated_status
#         db.session.add(attendance_record) # Mark the record as modified

#         db.session.commit()

#         return jsonify({
#             "message": "Attendance exception recorded successfully",
#             "exception": {
#                 "exception_id": new_exception.exception_id,
#                 "attendance_id": new_exception.attendance_id,
#                 "reason": new_exception.reason,
#                 "updated_status": new_exception.updated_status,
#                 "approved_by": new_exception.approved_by,
#                 "approval_date": new_exception.approval_date.isoformat()
#             }
#         }), 201 # Created
    
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Error creating attendance exception: {e}", exc_info=True)
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# from flask import Blueprint, request, jsonify, current_app
# from flask_jwt_extended import jwt_required, get_jwt
# from datetime import datetime, date
# import os
# import tempfile
# import base64
# import cv2
# import numpy as np
# import re
# import json # Import json for explicit JSONDecodeError

# from extensions import db
# from models.attendance_records import AttendanceRecord
# from models.class_schedules import ClassSchedule
# from models.courses import Course
# from models.enrollments import Enrollment
# from models.attendance_exceptions import AttendanceException

# attendance_bp = Blueprint('attendance', __name__)

# # --- Helper functions (remain unchanged) ---
# def admin_or_lecturer_required():
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type not in ['admin', 'lecturer']:
#         return False, jsonify({"message": "Admin or Lecturer access required"}), 403
#     return True, None, None

# def admin_required():
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type != 'admin':
#         return False, jsonify({"message": "Admin access required"}), 403
#     return True, None, None

# @attendance_bp.route('/mark', methods=['POST'])
# @jwt_required()
# def mark_attendance():
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code

#     data = None # Initialize data to None
#     try:
#         data = request.get_json(force=True) # Use force=True to try parsing even with wrong Content-Type, though 'application/json' is expected
#         if data is None:
#             # This can happen if Content-Type is correct but body is empty or unparsable JSON
#             raise ValueError("Request body is not valid JSON or is empty.")
#     except json.JSONDecodeError as e: # Catch specific JSON decoding errors
#         current_app.logger.error(f"ATTENDANCE MARK ERROR: JSON decoding failed: {e}", exc_info=True)
#         return jsonify({"message": f"Invalid JSON format or truncated body: {str(e)}"}), 400
#     except Exception as e:
#         current_app.logger.error(f"ATTENDANCE MARK ERROR: Error parsing JSON in route: {e}", exc_info=True)
#         return jsonify({"message": f"Unexpected error during JSON parsing: {str(e)}"}), 400

#     image_data_uri = data.get('image_data') if data else None
#     course_code = data.get('course_code') if data else None
#     schedule_id = data.get('schedule_id') if data else None
    
#     if not image_data_uri or not course_code or not schedule_id:
#         current_app.logger.error("ATTENDANCE MARK ERROR: Missing required fields (image_data, course_code, or schedule_id) after JSON parse.")
#         return jsonify({'error': 'Image data (base64), course code, and Schedule ID are required'}), 400
    
#     temp_path = None
#     image_data_base64 = "" # Initialize for error logging
#     try:
#         schedule = ClassSchedule.query.get(schedule_id)
#         if not schedule:
#             current_app.logger.error(f"ATTENDANCE MARK ERROR: Class schedule with ID {schedule_id} not found.")
#             return jsonify({'message': f'Class schedule with ID {schedule_id} not found'}), 404
        
#         if schedule.course_code != course_code:
#             current_app.logger.error(f"ATTENDANCE MARK ERROR: Schedule ID {schedule_id} does not match provided course code {course_code}.")
#             return jsonify({'message': 'Schedule ID does not match the provided course code'}), 400

#         # --- Debugging: Log length of Base64 string AFTER extraction ---
#         current_app.logger.info(f"ATTENDANCE MARK DEBUG: Received Base64 data URI length: {len(image_data_uri)}")
        
#         # --- Backend Regex for robust prefix removal ---
#         # This regex handles various image formats (jpeg, png, etc.)
#         match = re.match(r'data:image/[a-zA-Z0-9\-\+\.]+;base64,(.*)', image_data_uri)
#         if match:
#             image_data_base64 = match.group(1)
#         else:
#             current_app.logger.warning("ATTENDANCE MARK WARNING: Image data URI format not recognized. Attempting direct base64 decode (assuming no prefix).")
#             image_data_base64 = image_data_uri # Fallback if prefix is somehow missing

#         current_app.logger.info(f"ATTENDANCE MARK DEBUG: Base64 string length AFTER prefix removal: {len(image_data_base64)}")
#         current_app.logger.info(f"ATTENDANCE MARK DEBUG: Base64 prefix after extraction (first 50 chars): {image_data_base64[:50]}...")
#         current_app.logger.info(f"ATTENDANCE MARK DEBUG: Base64 suffix after extraction (last 50 chars): ...{image_data_base64[-50:]}")
#         # --- End Debugging ---

#         img_bytes = base64.b64decode(image_data_base64)
#         current_app.logger.info(f"ATTENDANCE MARK DEBUG: Decoded image bytes length: {len(img_bytes)}")
        
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
#             temp_file.write(img_bytes)
#             temp_path = temp_file.name
        
#         face_service = current_app.config['FACE_SERVICE']
        
#         result = face_service.recognize_from_image(temp_path)
        
#         recorded_attendance_data = []
        
#         course_enrollments = Enrollment.query.filter_by(course_code=course_code).all()
#         enrolled_matricules_in_course = {e.matricule for e in course_enrollments}

#         for matricule in result['detected_students']:
#             if matricule in enrolled_matricules_in_course:
#                 new_record = AttendanceRecord(
#                     matricule=matricule,
#                     course_code=course_code,
#                     schedule_id=schedule_id,
#                     date=date.today(),
#                     status='PRESENT',
#                     timestamp=datetime.now(),
#                     verified_by_face=True
#                 )
#                 db.session.add(new_record)
#                 recorded_attendance_data.append(new_record.to_dict())
#             else:
#                 current_app.logger.warning(f"ATTENDANCE MARK WARNING: Detected student {matricule} not enrolled in {course_code}. Skipping attendance.")
#                 result['unrecognized_faces'].append(f"Detected but not enrolled: {matricule}")
        
#         db.session.commit()

#         return jsonify({
#             'success': True,
#             'message': 'Attendance marked successfully',
#             'total_detected_students': len(result['detected_students']),
#             'recognized_and_enrolled_students': len(recorded_attendance_data),
#             'unrecognized_faces': result['unrecognized_faces'],
#             'attendance_records_created': recorded_attendance_data,
#             'annotated_image': result.get('frame_with_annotations', None)
#         }), 200
    
#     except base64.binascii.Error as e:
#         db.session.rollback()
#         error_message = f"Base64 decoding error: {e}. Raw Base64 length: {len(image_data_base64) if image_data_base64 else 0}. This often means the image data was truncated during transfer or is invalid."
#         current_app.logger.error(f"ATTENDANCE MARK ERROR: {error_message}", exc_info=True)
#         return jsonify({'error': f"Image decoding failed: {e}. Data might be incomplete or corrupted."}), 400
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"ATTENDANCE MARK ERROR: Unhandled exception: {e}", exc_info=True)
#         return jsonify({'error': str(e)}), 500
#     finally:
#         if temp_path and os.path.exists(temp_path):
#             os.remove(temp_path)

# @attendance_bp.route('/report', methods=['GET'])
# @jwt_required()
# def get_attendance_report():
#     # --- Enforce Admin/Lecturer access for attendance reports ---
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code

#     course_code = request.args.get('course_code')
#     schedule_id = request.args.get('schedule_id', type=int) # Optional: filter by specific schedule

#     if not course_code:
#         return jsonify({'error': 'Course code is required'}), 400
    
#     try:
#         # Build query for attendance records
#         query = AttendanceRecord.query.filter_by(course_code=course_code)
#         if schedule_id:
#             query = query.filter_by(schedule_id=schedule_id)
        
#         records = query.all()
        
#         # Fetch all enrolled students for this course
#         enrolled_students = Enrollment.query.filter_by(course_code=course_code).all()
#         enrolled_matricules = {e.matricule for e in enrolled_students}

#         # Determine attendance status for each enrolled student
#         attendance_summary = {}
#         for matricule in enrolled_matricules:
#             attendance_summary[matricule] = {
#                 'total_sessions': 0,
#                 'present_sessions': 0,
#                 'absent_sessions': 0,
#                 'latest_status': 'N/A'
#             }
        
#         # Populate attendance data from records
#         for record in records:
#             if record.matricule in attendance_summary:
#                 attendance_summary[record.matricule]['total_sessions'] += 1
#                 if record.status == 'PRESENT':
#                     attendance_summary[record.matricule]['present_sessions'] += 1
#                 else:
#                     attendance_summary[record.matricule]['absent_sessions'] += 1 # 'ABSENT' or 'LATE'
#                 attendance_summary[record.matricule]['latest_status'] = record.status

#         return jsonify(attendance_summary), 200
    
#     except Exception as e:
#         current_app.logger.error(f"Error generating attendance report for course {course_code}: {e}", exc_info=True)
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @attendance_bp.route('/video-feed', methods=['POST'])
# @jwt_required()
# def video_feed():
#     """
#     Placeholder for processing video stream frames.
#     This endpoint would typically receive frames one by one from a client.
#     The client would continuously send image data (e.g., JPEG snapshots)
#     which this endpoint processes similarly to `/mark`.
#     """
#     # For simplicity, returning a placeholder message for now.
#     return jsonify({'message': 'Video stream processing endpoint is active. Implement frame processing here.'}), 200

# # --- NEW: Route for creating attendance exceptions ---
# @attendance_bp.route('/exceptions', methods=['POST'])
# @jwt_required() # Requires authentication
# def create_attendance_exception():
#     # Only Admin users can create/log attendance exceptions
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code
    
#     data = request.get_json()
#     attendance_id = data.get('attendance_id')
#     reason = data.get('reason')
#     updated_status = data.get('updated_status') # The new status for the attendance record (e.g., 'PRESENT' from 'ABSENT')

#     # Basic input validation
#     if not attendance_id or not reason or not updated_status:
#         return jsonify({"message": "Attendance ID, reason, and updated status are required"}), 400

#     # Validate updated_status
#     valid_statuses = ['PRESENT', 'ABSENT', 'LATE']
#     if updated_status not in valid_statuses:
#         return jsonify({"message": f"Invalid updated status. Must be one of: {', '.join(valid_statuses)}"}), 400

#     try:
#         # Check if the attendance record exists
#         attendance_record = AttendanceRecord.query.get(attendance_id)
#         if not attendance_record:
#             return jsonify({"message": f"Attendance record with ID {attendance_id} not found"}), 404

#         # Get the admin's ID from the JWT claims to record who created/approved the exception
#         claims = get_jwt()
#         approved_by_admin_id = claims.get('sub') # 'sub' claim usually holds the identity (admin_id in this case)

#         # Create the new AttendanceException record
#         new_exception = AttendanceException(
#             attendance_id=attendance_id,
#             reason=reason,
#             updated_status=updated_status,
#             approved_by=approved_by_admin_id, # Link to the admin who initiated this exception
#             approval_date=datetime.now() # Record the date/time of exception creation
#         )
#         db.session.add(new_exception)

#         # Optional: Update the actual attendance record's status immediately
#         # This makes the attendance record reflect the exception right away.
#         attendance_record.status = updated_status
#         db.session.add(attendance_record) # Mark the record as modified

#         db.session.commit()

#         return jsonify({
#             "message": "Attendance exception recorded successfully",
#             "exception": {
#                 "exception_id": new_exception.exception_id,
#                 "attendance_id": new_exception.attendance_id,
#                 "reason": new_exception.reason,
#                 "updated_status": new_exception.updated_status,
#                 "approved_by": new_exception.approved_by,
#                 "approval_date": new_exception.approval_date.isoformat()
#             }
#         }), 201 # Created
    
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Error creating attendance exception: {e}", exc_info=True)
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500





from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt # Keep import for other routes, but will temporarily remove from /mark
from datetime import datetime, date
import os
import tempfile
import base64 
import cv2 
import numpy as np 
import re
import logging 

from extensions import db
from models.attendance_records import AttendanceRecord
from models.class_schedules import ClassSchedule
from models.courses import Course
from models.enrollments import Enrollment
from models.attendance_exceptions import AttendanceException

attendance_bp = Blueprint('attendance', __name__)


# --- Helper functions (remain unchanged) ---
def admin_or_lecturer_required():
    claims = get_jwt()
    user_type = claims.get('user_type')
    if user_type not in ['admin', 'lecturer']:
        return False, jsonify({"message": "Admin or Lecturer access required"}), 403
    return True, None, None

def admin_required():
    claims = get_jwt()
    user_type = claims.get('user_type')
    if user_type != 'admin':
        return False, jsonify({"message": "Admin access required"}), 403
    return True, None, None

@attendance_bp.route('/mark', methods=['POST'])
# @jwt_required() # <--- TEMPORARILY COMMENTED OUT FOR DEBUGGING
def mark_attendance():
    # --- NEW: Print statement to confirm entry into the function ---
    print("--- ATTENDANCE MARK DEBUG: Entering mark_attendance function. ---")
    
    # --- NEW: Early try-except block to catch parsing errors ---
    try:
        # Authorization check moved inside if @jwt_required is commented out,
        # but for now, we'll assume the problem is before this.
        # If @jwt_required() is re-enabled, this check might not be needed inside.
        # is_authorized, error_response, status_code = admin_or_lecturer_required()
        # if not is_authorized:
        #     current_app.logger.error(f"ATTENDANCE MARK ERROR: Authorization failed before processing form data. Status: {status_code}")
        #     print(f"--- ATTENDANCE MARK DEBUG: Authorization failed: {status_code} ---") 
        #     return error_response, status_code

        # --- Access data from request.form and request.files for multipart/form-data ---
        course_code = request.form.get('course_code')
        schedule_id_str = request.form.get('schedule_id') 
        image_file = request.files.get('image_data') 

        # --- DEBUGGING & VALIDATION ---
        current_app.logger.info(f"ATTENDANCE MARK INFO: Received request for course_code={course_code}, schedule_id_str={schedule_id_str}")
        if image_file:
            current_app.logger.info(f"ATTENDANCE MARK INFO: Image file received. Filename: {image_file.filename}, Content-Type: {image_file.mimetype}")
        else:
            current_app.logger.error("ATTENDANCE MARK ERROR: 'image_data' file is missing in the request. Check frontend FormData.")
            return jsonify({'error': 'Image file (image_data), course code, and Schedule ID are required'}), 400

        if not course_code or not schedule_id_str:
            current_app.logger.error("ATTENDANCE MARK ERROR: Missing required form fields (course_code or schedule_id).")
            return jsonify({'error': 'Image file, course code, and Schedule ID are required'}), 400
        
        try:
            schedule_id = int(schedule_id_str) 
        except ValueError:
            current_app.logger.error(f"ATTENDANCE MARK ERROR: Invalid schedule_id format: '{schedule_id_str}'. Must be an integer.")
            return jsonify({'error': 'Invalid schedule_id format. Must be an integer.'}), 400

        temp_path = None
        try:
            schedule = ClassSchedule.query.get(schedule_id)
            if not schedule:
                current_app.logger.error(f"ATTENDANCE MARK ERROR: Class schedule with ID {schedule_id} not found.")
                return jsonify({'message': f'Class schedule with ID {schedule_id} not found'}), 404
            
            if schedule.course_code != course_code:
                current_app.logger.error(f"ATTENDANCE MARK ERROR: Schedule ID {schedule_id} does not match provided course code {course_code}.")
                return jsonify({'message': 'Schedule ID does not match the provided course code'}), 400

            # Read image bytes directly from the FileStorage object
            img_bytes = image_file.read()
            
            current_app.logger.info(f"ATTENDANCE MARK DEBUG: Received image bytes length: {len(img_bytes)}.")

            # Check if the image bytes are empty
            if not img_bytes:
                current_app.logger.error("ATTENDANCE MARK ERROR: Received image file is empty after reading.")
                return jsonify({'error': 'Received image file is empty.'}), 400

            # Check for valid image mimetype before saving/processing
            if not image_file.mimetype or not image_file.mimetype.startswith('image/'):
                current_app.logger.error(f"ATTENDANCE MARK ERROR: Invalid file type received. Expected image, got {image_file.mimetype}.")
                return jsonify({'error': 'Invalid file type. Only image files are accepted.'}), 422 
            
            # Determine suffix based on mimetype
            suffix = '.' + image_file.mimetype.split('/')[-1] if image_file.mimetype else '.jpg'

            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(img_bytes)
                temp_path = temp_file.name
            
            current_app.logger.info(f"ATTENDANCE MARK DEBUG: Image saved to temporary path: {temp_path}")

            face_service = current_app.config['FACE_SERVICE']
            
            # Specific try-except for image processing errors
            try:
                result = face_service.recognize_from_image(temp_path)
            except Exception as face_service_error:
                current_app.logger.error(f"ATTENDANCE MARK ERROR: Face recognition service failed to process image: {face_service_error}", exc_info=True)
                return jsonify({'error': 'Image processing failed. The image might be corrupted or invalid.', 'details': str(face_service_error)}), 422
            
            recorded_attendance_data = []
            
            course_enrollments = Enrollment.query.filter_by(course_code=course_code).all()
            enrolled_matricules_in_course = {e.matricule for e in course_enrollments}

            for matricule in result.get('detected_students', []): 
                if matricule in enrolled_matricules_in_course:
                    # Add check for existing record for the same schedule and date
                    existing_record = AttendanceRecord.query.filter_by(
                        matricule=matricule,
                        course_code=course_code,
                        schedule_id=schedule_id,
                        date=date.today()
                    ).first()

                    if existing_record:
                        current_app.logger.info(f"ATTENDANCE MARK INFO: Attendance for {matricule} already marked for schedule {schedule_id} today. Status: {existing_record.status}")
                        recorded_attendance_data.append(existing_record.to_dict())
                    else:
                        new_record = AttendanceRecord(
                            matricule=matricule,
                            course_code=course_code,
                            schedule_id=schedule_id,
                            date=date.today(),
                            status='PRESENT',
                            timestamp=datetime.now(),
                            verified_by_face=True
                        )
                        db.session.add(new_record)
                        recorded_attendance_data.append(new_record.to_dict())
                else:
                    current_app.logger.warning(f"ATTENDANCE MARK WARNING: Detected student {matricule} not enrolled in {course_code}. Skipping attendance.")
                    if 'unrecognized_faces' not in result: 
                        result['unrecognized_faces'] = []
                    result['unrecognized_faces'].append(f"Detected but not enrolled: {matricule}")
            
            db.session.commit()

            # --- CRITICAL FIX: Base64 encode the annotated_image before jsonify ---
            annotated_image_base64 = None
            if result.get('frame_with_annotations') is not None:
                # Ensure it's bytes before encoding
                if isinstance(result['frame_with_annotations'], bytes):
                    annotated_image_base64 = base64.b64encode(result['frame_with_annotations']).decode('utf-8')
                    # Prepend data URI scheme for direct use in HTML <img> tags
                    annotated_image_base64 = f"data:image/jpeg;base64,{annotated_image_base64}"
                else:
                    current_app.logger.warning("ATTENDANCE MARK WARNING: frame_with_annotations is not bytes, cannot Base64 encode.")
                    # If it's not bytes, it might be None or already a string, keep as is or set to None
                    annotated_image_base64 = result['frame_with_annotations'] # Or set to None
            
            return jsonify({
                'success': True,
                'message': 'Attendance marked successfully',
                'total_detected_students': len(result.get('detected_students', [])), 
                'recognized_and_enrolled_students': len(recorded_attendance_data),
                'unrecognized_faces': result.get('unrecognized_faces', []), 
                'detected_faces': result.get('detected_faces', []),
                'attendance_records_created': recorded_attendance_data,
                'annotated_image': annotated_image_base64
            }), 200
        
        except Exception as e: # This inner try-except catches errors within the processing logic
            db.session.rollback()
            current_app.logger.error(f"ATTENDANCE MARK ERROR: An unhandled exception occurred during attendance marking process (not Flask parsing specific): {e}", exc_info=True)
            print(f"--- ATTENDANCE MARK DEBUG: Caught inner exception: {e} ---")
            return jsonify({'error': str(e), 'message': 'An internal server error occurred during attendance marking.'}), 500
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e: # This outer try-except catches errors during Flask's request parsing or authorization check
        current_app.logger.error(f"ATTENDANCE MARK ERROR: An early error occurred during request parsing or authorization check: {e}", exc_info=True)
        print(f"--- ATTENDANCE MARK DEBUG: Caught outer exception: {e} ---")
        return jsonify({'error': 'Failed to process request data. It might be malformed or invalid.', 'details': str(e)}), 422


@attendance_bp.route('/report', methods=['GET'])
@jwt_required()
def get_attendance_report():
    # --- Enforce Admin/Lecturer access for attendance reports ---
    is_authorized, error_response, status_code = admin_or_lecturer_required()
    if not is_authorized:
        return error_response, status_code

    course_code = request.args.get('course_code')
    schedule_id = request.args.get('schedule_id', type=int) 

    if not course_code:
        return jsonify({'error': 'Course code is required'}), 400
    
    try:
        # Build query for attendance records
        query = AttendanceRecord.query.filter_by(course_code=course_code)
        if schedule_id:
            query = query.filter_by(schedule_id=schedule_id)
        
        records = query.all()
        
        # Fetch all enrolled students for this course
        enrolled_students = Enrollment.query.filter_by(course_code=course_code).all()
        enrolled_matricules = {e.matricule for e in enrolled_students}

        # Determine attendance status for each enrolled student
        attendance_summary = {}
        for matricule in enrolled_matricules:
            attendance_summary[matricule] = {
                'total_sessions': 0,
                'present_sessions': 0,
                'absent_sessions': 0,
                'latest_status': 'N/A'
            }
        
        # Populate attendance data from records
        for record in records:
            if record.matricule in attendance_summary:
                attendance_summary[record.matricule]['total_sessions'] += 1
                if record.status == 'PRESENT':
                    attendance_summary[record.matricule]['present_sessions'] += 1
                else:
                    attendance_summary[record.matricule]['absent_sessions'] += 1 
                attendance_summary[record.matricule]['latest_status'] = record.status

        return jsonify(attendance_summary), 200
    
    except Exception as e:
        current_app.logger.error(f"Error generating attendance report for course {course_code}: {e}", exc_info=True)
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@attendance_bp.route('/<int:attendance_id>', methods=['PUT'])
@jwt_required()
def update_attendance(attendance_id):
    """Lecturer can directly update a single attendance record's status."""
    is_authorized, error_response, status_code = admin_or_lecturer_required()
    if not is_authorized:
        return error_response, status_code

    data = request.get_json()
    new_status = data.get('status', '').upper()
    if new_status not in ('PRESENT', 'ABSENT', 'LATE'):
        return jsonify({'error': 'status must be PRESENT, ABSENT or LATE'}), 400

    record = AttendanceRecord.query.get(attendance_id)
    if not record:
        return jsonify({'error': 'Attendance record not found'}), 404

    record.status = new_status
    db.session.commit()
    return jsonify(record.to_dict()), 200


@attendance_bp.route('/finalise', methods=['POST'])
@jwt_required()
def finalise_session():
    """Called when lecturer stops capturing. Saves ABSENT for every enrolled
    student who has no PRESENT record for this schedule+date."""
    is_authorized, error_response, status_code = admin_or_lecturer_required()
    if not is_authorized:
        return error_response, status_code

    data = request.get_json()
    course_code = data.get('course_code')
    schedule_id = data.get('schedule_id')

    if not course_code or not schedule_id:
        return jsonify({'error': 'course_code and schedule_id are required'}), 400

    try:
        schedule_id = int(schedule_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'schedule_id must be an integer'}), 400

    try:
        today = date.today()
        enrollments = Enrollment.query.filter_by(course_code=course_code).all()
        enrolled_matricules = {e.matricule for e in enrollments}

        # Find who already has a record for this schedule today
        existing = AttendanceRecord.query.filter_by(
            course_code=course_code,
            schedule_id=schedule_id,
            date=today
        ).all()
        already_recorded = {r.matricule for r in existing}

        # Save ABSENT for everyone not yet recorded
        absent_records = []
        for matricule in enrolled_matricules:
            if matricule not in already_recorded:
                record = AttendanceRecord(
                    matricule=matricule,
                    course_code=course_code,
                    schedule_id=schedule_id,
                    date=today,
                    status='ABSENT',
                    timestamp=datetime.now(),
                    verified_by_face=False
                )
                db.session.add(record)
                absent_records.append(matricule)

        db.session.commit()
        return jsonify({
            'message': 'Session finalised',
            'absent_saved': len(absent_records),
            'absent_matricules': absent_records
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error finalising session: {e}', exc_info=True)
        return jsonify({'error': str(e)}), 500


@attendance_bp.route('/video-feed', methods=['POST'])
@jwt_required()
def video_feed():
    """
    Placeholder for processing video stream frames.
    This endpoint would typically receive frames one by one from a client.
    The client would continuously send image data (e.g., JPEG snapshots)
    which this endpoint processes similarly to `/mark`.
    """
    return jsonify({'message': 'Video stream processing endpoint is active. Implement frame processing here.'}), 200

# --- NEW: Route for creating attendance exceptions ---
@attendance_bp.route('/exceptions', methods=['POST'])
@jwt_required() 
def create_attendance_exception():
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code
    
    data = request.get_json()
    attendance_id = data.get('attendance_id')
    reason = data.get('reason')
    updated_status = data.get('updated_status') 

    if not attendance_id or not reason or not updated_status:
        return jsonify({"message": "Attendance ID, reason, and updated status are required"}), 400

    valid_statuses = ['PRESENT', 'ABSENT', 'LATE']
    if updated_status not in valid_statuses:
        return jsonify({"message": f"Invalid updated status. Must be one of: {', '.join(valid_statuses)}"}), 400

    try:
        attendance_record = AttendanceRecord.query.get(attendance_id)
        if not attendance_record:
            return jsonify({"message": f"Attendance record with ID {attendance_id} not found"}), 404

        claims = get_jwt()
        approved_by_admin_id = claims.get('sub') 

        new_exception = AttendanceException(
            attendance_id=attendance_id,
            reason=reason,
            updated_status=updated_status,
            approved_by=approved_by_admin_id, 
            approval_date=datetime.now() 
        )
        db.session.add(new_exception)

        attendance_record.status = updated_status
        db.session.add(attendance_record) 

        db.session.commit()

        return jsonify({
            "message": "Attendance exception recorded successfully",
            "exception": {
                "exception_id": new_exception.exception_id,
                "attendance_id": new_exception.attendance_id,
                "reason": new_exception.reason,
                "updated_status": new_exception.updated_status,
                "approved_by": new_exception.approved_by,
                "approval_date": new_exception.approval_date.isoformat()
            }
        }), 201 
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating attendance exception: {e}", exc_info=True)
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500



# from flask import Blueprint, request, jsonify, current_app
# from flask_jwt_extended import jwt_required, get_jwt
# from datetime import datetime, date
# import os
# import tempfile
# import base64

# from extensions import db
# from models.attendance_records import AttendanceRecord
# from models.class_schedules import ClassSchedule
# from models.courses import Course
# from models.enrollments import Enrollment
# from models.attendance_exceptions import AttendanceException

# attendance_bp = Blueprint('attendance', __name__)

# # --- Helper functions ---
# def admin_or_lecturer_required():
#     claims = get_jwt()
#     user_type = claims.get('user_type')
#     if user_type not in ['admin', 'lecturer']:
#         return False, jsonify({"message": "Admin or Lecturer access required"}), 403
#     return True, None, None

# # --- Updated /mark Route ---
# @attendance_bp.route('/mark', methods=['POST'])
# @jwt_required()
# def mark_attendance():
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code

#     try:
#         data = request.get_json()
#         image_data_base64 = data.get('image_data')
#         course_code = data.get('course_code')
#         schedule_id = data.get('schedule_id')

#         if not image_data_base64 or not course_code or not schedule_id:
#             current_app.logger.error("ATTENDANCE MARK ERROR: Missing required fields (image_data, course_code, schedule_id).")
#             return jsonify({'error': 'Image data, course code, and schedule ID are required'}), 400

#         try:
#             schedule_id = int(schedule_id)
#         except ValueError:
#             current_app.logger.error(f"ATTENDANCE MARK ERROR: Invalid schedule_id format: {schedule_id}. Must be an integer.")
#             return jsonify({'error': 'Invalid schedule_id format. Must be an integer.'}), 400

#         # Handle base64 image (remove prefix if present)
#         if image_data_base64.startswith('data:image'):
#             image_data_base64 = image_data_base64.split(',', 1)[1]

#         image_bytes = base64.b64decode(image_data_base64)
        
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
#             temp_file.write(image_bytes)
#             temp_path = temp_file.name

#         schedule = ClassSchedule.query.get(schedule_id)
#         if not schedule:
#             current_app.logger.error(f"ATTENDANCE MARK ERROR: Class schedule with ID {schedule_id} not found.")
#             os.remove(temp_path)
#             return jsonify({'message': f'Class schedule with ID {schedule_id} not found'}), 404

#         if schedule.course_code != course_code:
#             current_app.logger.error(f"ATTENDANCE MARK ERROR: Schedule ID {schedule_id} does not match provided course code {course_code}.")
#             os.remove(temp_path)
#             return jsonify({'message': 'Schedule ID does not match the provided course code'}), 400

#         face_service = current_app.config['FACE_SERVICE']
#         result = face_service.recognize_from_image(temp_path)

#         recorded_attendance_data = []
#         course_enrollments = Enrollment.query.filter_by(course_code=course_code).all()
#         enrolled_matricules_in_course = {e.matricule for e in course_enrollments}

#         for matricule in result['detected_students']:
#             if matricule in enrolled_matricules_in_course:
#                 new_record = AttendanceRecord(
#                     matricule=matricule,
#                     course_code=course_code,
#                     schedule_id=schedule_id,
#                     date=date.today(),
#                     status='PRESENT',
#                     timestamp=datetime.now(),
#                     verified_by_face=True
#                 )
#                 db.session.add(new_record)
#                 recorded_attendance_data.append(new_record.to_dict())
#             else:
#                 current_app.logger.warning(f"ATTENDANCE MARK WARNING: Detected student {matricule} not enrolled in {course_code}. Skipping attendance.")
#                 result['unrecognized_faces'].append(f"Detected but not enrolled: {matricule}")

#         db.session.commit()

#         os.remove(temp_path)

#         return jsonify({
#             'success': True,
#             'message': 'Attendance marked successfully',
#             'total_detected_students': len(result['detected_students']),
#             'recognized_and_enrolled_students': len(recorded_attendance_data),
#             'unrecognized_faces': result['unrecognized_faces'],
#             'attendance_records_created': recorded_attendance_data,
#             'annotated_image': result.get('frame_with_annotations', None)
#         }), 200

#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"ATTENDANCE MARK ERROR: Unhandled exception: {e}", exc_info=True)
#         return jsonify({'error': str(e)}), 500
