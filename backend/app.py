
from flask import Flask, jsonify, request, g # Import 'g'
import logging
from logging.handlers import RotatingFileHandler
import os
import json
import traceback # Import traceback for full stack traces in logs

from flask_cors import CORS
from config import Config

from extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    # --- CRITICAL: Set MAX_CONTENT_LENGTH here, BEFORE any request processing ---
    # This limit applies to the total size of the request body (including image_data)
    # 20 * 1024 * 1024 bytes = 20 MB. This is crucial for large image uploads.
    app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
    # IMPORTANT: If using Gunicorn, Nginx, or Apache, you must also configure their limits!

    # --- CRITICAL: Configure logging aggressively for all output ---
    app.logger.setLevel(logging.DEBUG)

    if app.logger.hasHandlers():
        app.logger.handlers.clear()

    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)

    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.DEBUG)
    werkzeug_logger.addHandler(handler)
    # --- END logging config ---

    # Initialize extensions
    app.logger.info("--- app.py: Inside create_app(), ABOUT TO CALL db.init_app(app) ---")
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    app.logger.info("--- app.py: db.init_app(app) CALLED. Now importing all models. ---")

    app.logger.info("--- app.py: About to import 'models' package. ---")
    import models
    app.logger.info("--- app.py: 'models' package IMPORTED. ---")

    # Register blueprints
    app.logger.info("--- app.py: About to import routes... ---")
    from routes.auth import auth_bp
    from routes.admins import admins_bp
    from routes.students import students_bp
    from routes.face_records import face_records_bp
    from routes.lecturers import lecturers_bp
    from routes.courses import courses_bp
    from routes.enrollments import enrollments_bp
    from routes.class_schedules import class_schedules_bp
    from routes.attendance import attendance_bp
    from routes.reports import reports_bp
    from routes.exceptions import exceptions_bp
    app.logger.info("--- app.py: All blueprints imported. ---")


    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admins_bp, url_prefix='/api/admins')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(face_records_bp, url_prefix='/api/faces')
    app.register_blueprint(lecturers_bp, url_prefix='/api/lecturers')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(enrollments_bp, url_prefix='/api/enrollments')
    app.register_blueprint(class_schedules_bp, url_prefix='/api/schedules')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(exceptions_bp, url_prefix='/api/attendance/exceptions')

    @app.route('/')
    def index():
        return {'message': 'Facial Recognition Attendance System API'}

    # --- Global error handler for RequestEntityTooLarge (413) ---
    @app.errorhandler(413)
    def request_entity_too_large(error):
        app.logger.error(f"Request Entity Too Large: {error}")
        return jsonify({"message": f"Request payload too large. Max allowed is {app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024)}MB."}), 413

    # --- Global error handler for generic HTTP errors (e.g., if JSON parsing fails early) ---
    @app.errorhandler(400) # Catch Bad Request (e.g., from request.get_json() if body is malformed)
    @app.errorhandler(405) # Catch Method Not Allowed
    @app.errorhandler(Exception) # Catch all other unhandled exceptions
    def handle_error(error):
        code = getattr(error, 'code', 500)
        description = getattr(error, 'description', str(error))
        
        # Log the raw request data for 400 errors for debugging JSON issues
        if code == 400:
            raw_data = request.get_data()
            app.logger.error(f"GLOBAL ERROR HANDLER (400 Bad Request): Raw Incoming Data Length: {len(raw_data)} bytes")
            app.logger.error(f"GLOBAL ERROR HANDLER (400 Bad Request): Raw Incoming Data Snippet:\n{raw_data.decode('utf-8', errors='ignore')[:500]}...")
            
            # Try to log as JSON if possible for more context
            try:
                parsed_json_error = json.loads(raw_data)
                app.logger.error(f"GLOBAL ERROR HANDLER (400 Bad Request): Raw Incoming Data (attempted JSON parse):\n{json.dumps(parsed_json_error, indent=2)[:500]}...")
            except (json.JSONDecodeError, UnicodeDecodeError):
                app.logger.error("GLOBAL ERROR HANDLER (400 Bad Request): Raw data could not be parsed as JSON in error handler.")

        app.logger.exception(f"An unexpected error occurred (Code: {code}): {description}") # Use exception to get full traceback
        
        # For 400 specifically, try to provide more detail if possible
        if code == 400 and 'Failed to decode JSON' in description: # Specific Flask error for bad JSON
            return jsonify({"message": "Invalid JSON format in request body or body is truncated. See backend logs for details."}), 400
        return jsonify({"message": f"An unexpected server error occurred: {description}. See backend logs for details."}), code


    # --- CRITICAL FIX: Global before_request handler for logging raw data ---
    # Only attempt JSON parsing if the Content-Type is application/json.
    # Otherwise, just log that it's not JSON.
    @app.before_request
    def log_request_data():
        # Only log for POST requests to /api/attendance/mark to keep logs focused
        if request.method == 'POST' and request.path == '/api/attendance/mark':
            raw_data = request.get_data()
            app.logger.info(f"--- GLOBAL BEFORE REQUEST: Raw Incoming Data Length: {len(raw_data)} bytes ---")
            
            if request.is_json: # Check if Content-Type is application/json
                try:
                    parsed_json = json.loads(raw_data)
                    json_snippet = json.dumps(parsed_json, indent=2)
                    if len(json_snippet) > 500:
                        app.logger.info(f"--- GLOBAL BEFORE REQUEST: Raw Incoming Data (JSON snippet):\n{json_snippet[:500]}... ---")
                    else:
                        app.logger.info(f"--- GLOBAL BEFORE REQUEST: Raw Incoming Data (JSON):\n{json_snippet} ---")
                except (json.JSONDecodeError, UnicodeDecodeError):
                    app.logger.info("--- GLOBAL BEFORE REQUEST: Raw data is JSON but failed to decode. ---")
            else:
                # This branch will be executed for multipart/form-data requests
                app.logger.info(f"--- GLOBAL BEFORE REQUEST: Request is NOT JSON (Content-Type: {request.content_type}). ---")

    # Initialize FACE_SERVICE here so it works both locally and on Railway/gunicorn
    with app.app_context():
        from services.face_recognition_service import FaceRecognitionService
        app.config['FACE_SERVICE'] = FaceRecognitionService(Config.YOLO_MODEL_PATH, app, db)
    app.logger.info("--- app.py: FaceRecognitionService initialized. ---")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
