from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import face_recognition
import numpy as np
import pickle
from models.face_records import FaceRecord
from models.students import Student
from app import db

face_records_bp = Blueprint('face_records', __name__)

@face_records_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_face():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    matricule = request.form.get('matricule')
    
    if not matricule:
        return jsonify({'error': 'Matricule is required'}), 400
    
    # Check if student exists
    student = Student.query.get(matricule)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Read image file
    img = face_recognition.load_image_file(file)
    
    # Get face encodings
    face_encodings = face_recognition.face_encodings(img)
    
    if len(face_encodings) == 0:
        return jsonify({'error': 'No faces detected in the image'}), 400
    
    # Use the first face found
    face_encoding = face_encodings[0]
    
    # Create and save face record
    face_record = FaceRecord(matricule=matricule)
    face_record.set_face_embedding(face_encoding)
    db.session.add(face_record)
    db.session.commit()
    
    return jsonify(face_record.to_dict()), 201

@face_records_bp.route('/student/<string:matricule>', methods=['GET'])
@jwt_required()
def get_face_records(matricule):
    face_records = FaceRecord.query.filter_by(matricule=matricule).all()
    return jsonify([record.to_dict() for record in face_records]), 200