import os
from dotenv import load_dotenv

load_dotenv()

# Base directory of the backend folder — works on any machine
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'f28bc2117d774053389dca9dc2313ad671bcd43fdd6dfd16adaa775308cbe187')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:postgress123@localhost/edu_track')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'b54981db1f873efefe5d7fff5097a42d12b16fb690e68dbf36c77bdfc956f5d3')
    YOLO_MODEL_PATH = os.getenv('YOLO_MODEL_PATH', os.path.join(BASE_DIR, 'model.pt'))