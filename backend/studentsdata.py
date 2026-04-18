import psycopg2
import pandas as pd
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL', 'dbname=edu_track user=postgres password=postgress123 host=localhost'))
cursor = conn.cursor()

BASE_DIR = Path(__file__).resolve().parent
df = pd.read_csv(BASE_DIR / 'studentsName.csv')

for _, row in df.iterrows():
    cursor.execute(
        "INSERT INTO students (matricule, name, level, department) VALUES (%s, %s, %s, %s) ON CONFLICT (matricule) DO NOTHING;",
        (row["matricule"], row["name"], row["level"], row["department"])
    )

conn.commit()
conn.close()
print("✅ CSV data imported successfully!")
