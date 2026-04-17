from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.students import Student
from app import db

students_bp = Blueprint('students', __name__)

@students_bp.route('/', methods=['GET'])
@jwt_required()
def get_students():
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students]), 200

@students_bp.route('/', methods=['POST'])
@jwt_required()
def create_student():
    data = request.get_json()
    student = Student(
        matricule=data['matricule'],
        name=data['name'],
        department=data.get('department'),
        level=data.get('level')
    )
    db.session.add(student)
    db.session.commit()
    return jsonify(student.to_dict()), 201

@students_bp.route('/<string:matricule>', methods=['GET'])
@jwt_required()
def get_student(matricule):
    student = Student.query.get_or_404(matricule)
    return jsonify(student.to_dict()), 200

@students_bp.route('/<string:matricule>', methods=['PUT'])
@jwt_required()
def update_student(matricule):
    student = Student.query.get_or_404(matricule)
    data = request.get_json()
    student.name = data.get('name', student.name)
    student.department = data.get('department', student.department)
    student.level = data.get('level', student.level)
    db.session.commit()
    return jsonify(student.to_dict()), 200

@students_bp.route('/<string:matricule>', methods=['DELETE'])
@jwt_required()
def delete_student(matricule):
    student = Student.query.get_or_404(matricule)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200