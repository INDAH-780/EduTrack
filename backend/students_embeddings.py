import cv2
import face_recognition
import psycopg2
import os
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL', 'dbname=edu_track user=postgres password=postgress123 host=localhost'))
cursor = conn.cursor()

BASE_DIR = Path(__file__).resolve().parent
image_folder = str(BASE_DIR / 'dataset' / 'train' / 'images')

for student_folder in os.listdir(image_folder):
    student_path = os.path.join(image_folder, student_folder)
    matricule = student_folder  # Folder name matches matricule

    if os.path.isdir(student_path):
        for image_file in os.listdir(student_path):
            image_path = os.path.join(student_path, image_file)
            image = cv2.imread(image_path)
            face_locations = face_recognition.face_locations(image)
            face_encodings = face_recognition.face_encodings(image, face_locations)

            if face_encodings:
                encoding_array = np.array(face_encodings[0])
                
                # 🔹 Print the embeddings for verification
                print(f"Matricule: {matricule}, Image: {image_file}, Embeddings:\n{encoding_array}\n")

                encoding_bytes = encoding_array.tobytes()
                cursor.execute(
                    "INSERT INTO face_records (matricule, face_embedding) VALUES (%s, %s)",
                    (matricule, encoding_bytes)
                )

conn.commit()
conn.close()
print("✅ Face embeddings saved successfully!")
