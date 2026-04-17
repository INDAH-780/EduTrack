import psycopg2
import pandas as pd

conn = psycopg2.connect("dbname=edu_track user=postgres password=postgress123 host=localhost")
cursor = conn.cursor()

df = pd.read_csv("/home/indah-mbah/Desktop/EduTrack/backend/studentsName.csv")

for _, row in df.iterrows():
    cursor.execute(
        "INSERT INTO students (matricule, name, level, department) VALUES (%s, %s, %s, %s) ON CONFLICT (matricule) DO NOTHING;",
        (row["matricule"], row["name"], row["level"], row["department"])
    )

conn.commit()
conn.close()
print("✅ CSV data imported successfully!")
