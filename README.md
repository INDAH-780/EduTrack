# EduTrack — Facial Recognition Attendance System

EduTrack is a full-stack web application that automates student attendance tracking using facial recognition. Instead of calling names or passing sheets, a lecturer startsor open the camera, an once it starts identifying faces as its been rotated, checks who is enrolled in that course, and marks them present — all in seconds.

---

## Table of Contents

1. [How the System Works](#1-how-the-system-works)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [The Real Dataset Used in This Project](#5-the-real-dataset-used-in-this-project)
6. [Phase 1 — Dataset Collection](#6-phase-1--dataset-collection)
7. [Phase 2 — Auto-Annotation with YOLOv8](#7-phase-2--auto-annotation-with-yolov8)
8. [Phase 3 — Training the YOLOv8 Face Detection Model](#8-phase-3--training-the-yolov8-face-detection-model)
9. [Phase 4 — Backend Setup](#9-phase-4--backend-setup)
10. [Phase 5 — Database Setup](#10-phase-5--database-setup)
11. [Phase 6 — Running the Backend](#11-phase-6--running-the-backend)
12. [Phase 7 — Frontend Setup](#12-phase-7--frontend-setup)
13. [Phase 8 — Using the System](#13-phase-8--using-the-system)
14. [API Reference](#14-api-reference)
15. [Roles and Permissions](#15-roles-and-permissions)
16. [Common Issues and Fixes](#16-common-issues-and-fixes)
17. [Future Work — Edge Deployment with TinyML](#17-future-work--edge-deployment-with-tinyml)

---

## 1. How the System Works

The system has two distinct AI components working together:

**Step 1 — Lecturer starts the camera**
The lecturer navigates to their course on the frontend, selects the active class schedule, and clicks "Start Capturing". The browser opens the laptop's webcam and begins a live video feed. No photo is taken manually — the system captures frames automatically every 3 seconds in the background.

**Step 2 — Face Detection (YOLOv8)**
Each captured frame is sent to the Flask backend as an image file. A custom-trained YOLOv8 model scans the frame and draws bounding boxes around every face it finds. This is purely detection — it does not know who anyone is yet.

**Step 3 — Face Recognition (dlib / face_recognition)**
For each detected face (bounding box), the system crops that region and passes it through the `face_recognition` library which generates a 128-number vector called a face embedding. This embedding is a mathematical fingerprint of that face. It is then compared against all stored embeddings in the database using Euclidean distance. If the distance is below 0.4, the student is considered a match.

**Step 4 — Attendance Marking (no duplicates)**
Once a student is identified, the system checks two things before saving a record:
1. Is the student enrolled in this course?
2. Have they already been marked present for this schedule today?

If both conditions pass, a new attendance record is saved with status `PRESENT`. If the same face appears in a later frame, the duplicate check prevents them from being marked twice. On the frontend, the live attendance sheet updates in real time showing each recognised student with a green tick.

**Step 5 — Visual feedback on screen**
While the camera is running, the lecturer sees the live video feed with bounding boxes drawn over detected faces. Recognised students get a green box with their name. Unrecognised faces get flagged as "Unknown". The attendance list on the right side of the screen grows as more students are identified.

---

## 2. Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| Python 3.12 | Programming language |
| Flask | Web framework / REST API |
| Flask-SQLAlchemy | ORM for database interaction |
| Flask-Migrate (Alembic) | Database migrations |
| Flask-JWT-Extended | Authentication via JSON Web Tokens |
| Flask-Bcrypt | Password hashing |
| PostgreSQL | Relational database |
| YOLOv8 (Ultralytics) | Face detection in classroom images |
| face_recognition (dlib) | Face embedding extraction and matching |
| OpenCV | Image processing |
| facenet-pytorch | Alternative face embedding model |
| scipy | Euclidean distance calculation |

### Frontend
| Tool | Purpose |
|---|---|
| Next.js 15 | React framework with App Router |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first styling |
| Radix UI | Accessible UI components |
| Axios | HTTP requests to the backend |
| Recharts | Charts and graphs for dashboards |
| jsPDF | PDF export for attendance reports |
| TanStack Table | Data tables |

---

## 3. Project Structure

```
EduTrack/
├── backend/
│   ├── dataset/              # Raw student face images (train/val/test splits)
│   ├── labels/               # YOLO-format annotation .txt files (auto-generated)
│   ├── models/               # SQLAlchemy database models
│   ├── routes/               # Flask API route handlers (blueprints)
│   ├── services/             # Face recognition business logic
│   ├── utils/                # Auth helpers
│   ├── migrations/           # Alembic database migration files
│   ├── yolov8_env/           # Python virtual environment
│   ├── annotate.py           # Script to auto-annotate dataset using YOLOv8
│   ├── app.py                # Flask application factory
│   ├── config.py             # App configuration (DB URL, JWT secret, etc.)
│   ├── create_admin.py       # Script to create the first admin account
│   ├── extensions.py         # Flask extension instances (db, migrate, jwt)
│   ├── model.pt              # Trained YOLOv8 face detection model weights
│   ├── requirements.txt      # Python dependencies
│   └── data.yaml             # YOLOv8 training configuration
│
└── facetrack/                # Next.js frontend
    ├── src/
    │   ├── app/              # Next.js App Router pages
    │   ├── components/       # Reusable UI components
    │   ├── context/          # React context providers (auth, etc.)
    │   ├── hooks/            # Custom React hooks
    │   ├── lib/              # Utility functions, API client
    │   └── types/            # TypeScript type definitions
    ├── package.json
    └── next.config.ts
```

---

## 4. Prerequisites

Before starting, make sure you have the following installed on your machine:

- **Python 3.10 or 3.12** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** and **npm** — [Download](https://nodejs.org/)
- **PostgreSQL** — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)
- **cmake** — Required to build dlib (the face recognition library)

Install cmake on Ubuntu/Debian:
```bash
sudo apt update
sudo apt install cmake build-essential libopenblas-dev liblapack-dev
```

Install cmake on macOS:
```bash
brew install cmake
```

---

## 5. The Real Dataset Used in This Project

This section explains exactly what was done in this specific project to build the dataset, register students, and generate face embeddings. If you are building your own version, follow the same steps with your own students.

### Who is in the dataset

The system was built and tested with **17 real students** from the Faculty of Engineering at the University of Buea, across two levels and two departments:

| Matricule | Name | Department | Level |
|---|---|---|---|
| FE21A001 | IJANG NOELA | Computer Engineering | Level 400 |
| FE21A002 | ESTELLA SHEMBOM | Computer Engineering | Level 400 |
| FE21A003 | ASONGANI ROUCLEC | Computer Engineering | Level 400 |
| FE21A004 | GILBERT TIMA | Computer Engineering | Level 400 |
| FE21A005 | KEDJU PRECIOUS | Computer Engineering | Level 400 |
| FE21A006 | NAMKAT CEDRIC | Electrical Engineering | Level 400 |
| FE21A007 | TAMAH JUSTENE | Electrical Engineering | Level 400 |
| FE21A008 | SAMBA CARLSON | Electrical Engineering | Level 400 |
| FE21A009 | EVARISTUS | Electrical Engineering | Level 400 |
| FE21A010 | KIMBOH LOVETTE | Electrical Engineering | Level 400 |
| FE20A011 | AMBANG NERIS | Computer Engineering | Level 500 |
| FE20A013 | NJI SANDRINE | Computer Engineering | Level 500 |
| FE20A014 | TETUH WIBINAH | Computer Engineering | Level 500 |
| FE20A015 | ASU GENEVIEVE | Computer Engineering | Level 500 |
| FE20A016 | ZELEFACK MARIE-NOELLE | Electrical Engineering | Level 500 |
| FE20A204 | INDAH RISCOBELLE MBAH | Electrical Engineering | Level 500 |
| FE21A011 | MBACHAM LOANA NING | Electrical Engineering | Level 500 |

### Step 1 — Photos were collected per student

For each student, multiple face photos were taken under different lighting conditions and angles. These were organised into the `backend/dataset/train/`, `val/`, and `test/` folders, each in a subfolder named after the student's matricule number.

For example:
```
backend/dataset/train/
├── FE21A001/
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── ...
├── FE21A002/
│   └── ...
```

### Step 2 — Student records were imported from a CSV

Rather than registering students one by one through the API, a CSV file (`studentsName.csv`) was prepared with all student details and imported directly into the database using the `studentsdata.py` script:

```bash
cd backend
source yolov8_env/bin/activate
python studentsdata.py
```

The CSV format is:
```csv
matricule,name,department,level
FE21A001,IJANG NOELA,Computer Engineering,Level 400
FE21A002,ESTELLA SHEMBOM,Computer Engineering,Level 400
...
```

This script reads the CSV and inserts each row into the `students` table using a direct PostgreSQL connection. It uses `ON CONFLICT DO NOTHING` so running it twice will not create duplicates.

> For your own project, prepare a similar CSV with your students' details and run the same script. Just update the file path inside `studentsdata.py` to point to your CSV.

### Step 3 — Face embeddings were generated in bulk

Once the photos were organised and students were in the database, the `students_embeddings.py` script was run to process every photo and store the face embeddings directly into the `face_records` table:

```bash
cd backend
source yolov8_env/bin/activate
python students_embeddings.py
```

This script:
1. Loops through every student folder in `backend/dataset/train/images/`
2. For each photo, uses `face_recognition.face_locations()` to find the face in the image
3. Uses `face_recognition.face_encodings()` to generate a 128-number vector (the face embedding)
4. Converts the embedding to raw bytes and inserts it into the `face_records` table linked to the student's matricule

This is the most important step — without embeddings in the database, the system cannot recognise anyone.

> This bulk script is the offline/setup approach. The system also supports uploading face photos one at a time through the API (`POST /api/faces/upload`) which does the same thing for a single student. Use the bulk script when setting up for the first time with many students, and the API for adding new students later.

### How recognition works at attendance time

When a lecturer starts the camera for a class session:
1. The frontend opens the laptop webcam and displays a live video feed
2. Every 3 seconds, a frame is automatically captured from the video and sent to the backend
3. YOLOv8 detects all faces in the frame and draws bounding boxes
4. For each detected face, `face_recognition` generates a new 128-number embedding
5. That embedding is compared against **every stored embedding** in `face_records` using Euclidean distance
6. If the closest match has a distance below **0.4**, the student is identified
7. A **green box** with the student's name is drawn on the live feed
8. If no match is close enough, a **red box** labeled `Unknown` is drawn
9. Before saving an attendance record, the system checks if the student is enrolled in the course **and** has not already been marked present for that schedule today — so even if the same face appears across 10 frames, they are only marked **PRESENT once**
10. The attendance sheet on the frontend updates in real time as students are identified

The threshold of `0.4` was chosen through testing. You can adjust it in `services/face_recognition_service.py`:
- Lower (e.g. `0.35`) = stricter, fewer false positives but may miss some students
- Higher (e.g. `0.5`) = more lenient, recognises more but risks wrong matches

---

## 6. Phase 1 — Dataset Collection

This is the most important phase. The quality of your dataset directly determines how well the system recognises faces.

### What you need
For each student you want the system to recognise, collect **10–30 clear photos** of their face. More photos = better accuracy.

### Guidelines for good photos
- Use photos taken in different lighting conditions (bright, dim, natural light)
- Include different angles (slightly left, right, straight on)
- Include photos with and without glasses if applicable
- Avoid heavily blurred or very dark images
- Portrait-style photos (face clearly visible and centred) work best

### How to organise the dataset
Organise photos by student matricule number into three folders: `train` (70%), `val` (20%), and `test` (10%).

```
backend/dataset/
├── train/
│   ├── FE21A001/
│   │   ├── photo1.jpg
│   │   ├── photo2.jpg
│   │   └── ...
│   └── FE21A002/
│       └── ...
├── val/
│   └── (same structure)
└── test/
    └── (same structure)
```

> The folder name (e.g. `FE21A001`) does not need to match the student's matricule for YOLO training — YOLO only learns to detect faces, not identify them. The identification is done separately by the face_recognition library using embeddings stored in the database.

---

## 7. Phase 2 — Auto-Annotation with YOLOv8

YOLOv8 needs to know where the faces are in each image. This is done through annotation — creating a `.txt` file for each image that contains the bounding box coordinates of every face.

Instead of annotating thousands of images by hand, the project uses a pre-trained face detection model (`model.pt`) to automatically generate these annotations.

### Download a base YOLOv8 face detection model

You can use any pre-trained YOLOv8 face detection model. A good starting point is the `yolov8n-face` model. Place it in the `backend/` folder and name it `model.pt`.

You can find pre-trained YOLOv8 face models on:
- [Ultralytics Hub](https://hub.ultralytics.com/)
- [Hugging Face](https://huggingface.co/)
- Search for `yolov8n-face.pt` on GitHub

### Run the annotation script

```bash
cd backend
source yolov8_env/bin/activate
python annotate.py
```

This script:
1. Loops through every `.jpg` image in `backend/dataset/`
2. Runs the base YOLOv8 model on each image to detect faces
3. Converts the bounding boxes to YOLO format (normalised x_center, y_center, width, height)
4. Saves a `.txt` annotation file for each image in `backend/labels/` with the same folder structure

After running, you will have:
```
backend/labels/
├── train/
│   ├── FE21A001/
│   │   ├── photo1.txt   ← contains: "0 0.512 0.423 0.234 0.312"
│   │   └── ...
│   └── ...
├── val/
└── test/
```

Each line in a `.txt` file means: `class_id x_center y_center width height` (all values between 0 and 1).

---

## 8. Phase 3 — Training the YOLOv8 Face Detection Model

Now you train a new YOLOv8 model specifically on your student dataset. This makes the model better at detecting faces in your specific environment (your classroom, your camera, your lighting).

### Configure data.yaml

Edit `backend/dataset/data.yaml` to point to your dataset:

```yaml
path: /absolute/path/to/EduTrack/backend/dataset
train: train/images
val: val/images
test: test/images
nc: 1
names: ["face"]
```

> Note: YOLO expects images in an `images/` subfolder and labels in a `labels/` subfolder at the same level. Make sure your folder structure matches or update the paths accordingly.

### Run training

```bash
cd backend
source yolov8_env/bin/activate

python -c "
from ultralytics import YOLO
model = YOLO('yolov8n.pt')  # Start from a base YOLOv8 nano model
model.train(data='dataset/data.yaml', epochs=50, imgsz=640, batch=16)
"
```

Training will save the best model weights to `runs/detect/train/weights/best.pt`. Copy this file to `backend/model.pt` or update `YOLO_MODEL_PATH` in `config.py` to point to it.

```bash
cp runs/detect/train/weights/best.pt model.pt
```

> Training time depends on your hardware. With a GPU it takes minutes. On CPU it can take hours. For a small dataset (a few hundred images), 50 epochs is usually enough.

---

## 9. Phase 4 — Backend Setup

### Clone the repository

```bash
git clone <your-repo-url>
cd EduTrack/backend
```

### Create and activate a virtual environment

```bash
python3 -m venv yolov8_env
source yolov8_env/bin/activate  # On Windows: yolov8_env\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

> Installing `dlib` can take a long time (10–20 minutes) because it compiles from source. Make sure `cmake` and build tools are installed first (see Prerequisites).

### Configure environment variables

Create a `.env` file inside `backend/`:

```env
SECRET_KEY=your_random_secret_key_here
JWT_SECRET_KEY=another_random_secret_key_here
DATABASE_URL=postgresql://your_db_user:your_db_password@localhost/edu_track
YOLO_MODEL_PATH=/absolute/path/to/EduTrack/backend/model.pt
```

To generate secure random keys:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 10. Phase 5 — Database Setup

### Create the PostgreSQL database

```bash
psql -U postgres
```

Inside the psql shell:
```sql
CREATE DATABASE edu_track;
\q
```

### Run database migrations

```bash
cd backend
source yolov8_env/bin/activate

flask db upgrade
```

This creates all the tables: `admins`, `lecturers`, `students`, `courses`, `class_schedules`, `enrollments`, `face_records`, `attendance_records`, `attendance_exceptions`.

### Create the first admin account

The system has no signup page for admins — the first admin must be created via script:

```bash
python create_admin.py
```

Follow the prompts to enter the admin's name, email, and password. This admin can then log in and create lecturers through the API or frontend.

---

## 11. Phase 6 — Running the Backend

```bash
cd backend
source yolov8_env/bin/activate
python app.py
```

The backend starts on `http://localhost:5000`.

You should see:
```
--- app.py: Starting Flask app. ---
 * Running on http://0.0.0.0:5000
```

---

## 12. Phase 7 — Frontend Setup

```bash
cd facetrack
npm install
npm run dev
```

The frontend starts on `http://localhost:3000`.

### Environment variables for the frontend

Create a `.env.local` file inside `facetrack/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 13. Phase 8 — Using the System

Follow these steps in order when setting up the system for the first time.

### Step 1 — Log in as Admin
Go to `http://localhost:3000` and log in with the admin credentials you created in Phase 5.

### Step 2 — Register Lecturers
Navigate to the Lecturers section and create lecturer accounts. Each lecturer gets an email and password they will use to log in.

### Step 3 — Create Courses
Create courses with their course code, name, department, level, semester, and assign a lecturer.

### Step 4 — Create Class Schedules
For each course, create one or more class schedules specifying the day of the week, start time, end time, and classroom location.

### Step 5 — Register Students
Add students with their matricule number, full name, department, and level.

### Step 6 — Enroll Students in Courses
Enroll students into courses. You can do this one by one or use the bulk enrollment feature to enroll all students of a specific department and level into a course at once.

### Step 7 — Register Student Faces
For each student, upload a clear face photo via the Face Records section. The system extracts and stores the face embedding. This only needs to be done once per student.

> If you are setting up for the first time with many students, use the bulk script instead of uploading one by one. See [Section 5 — The Real Dataset Used in This Project](#5-the-real-dataset-used-in-this-project) for how this was done in this project using `students_embeddings.py`.

### Step 8 — Taking Attendance (Lecturer)
1. The lecturer logs in with their credentials
2. They navigate to their course and select the active class schedule
3. They click **"Start Capturing"** — the browser opens the laptop webcam and the live feed appears on screen
4. The system automatically captures a frame every 3 seconds and sends it to the backend for processing
5. As faces are detected and recognised, bounding boxes appear on the live feed — green with the student's name for recognised students, red labeled "Unknown" for unrecognised faces
6. The attendance sheet on the right updates in real time as students are identified
7. If the same student appears in multiple frames, the duplicate check ensures they are only marked **PRESENT once** per session
8. The lecturer clicks **"Stop Capturing"** when done

### Step 9 — Viewing Reports
Admins and lecturers can view attendance reports per course, showing each student's total sessions, sessions present, and sessions absent.

### Step 10 — Handling Exceptions
If a student was wrongly marked absent (e.g., they were present but the camera missed them, or they have a valid excuse), an admin can create an attendance exception to override the status with a reason.

---

## 14. API Reference

All API endpoints are prefixed with `/api`. Protected endpoints require a `Bearer <token>` header.

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login (admin or lecturer) | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |

**Login request body:**
```json
{
  "username": "admin@example.com",
  "password": "yourpassword"
}
```

**Login response:**
```json
{
  "access_token": "eyJ...",
  "user_type": "admin",
  "user": { "admin_id": "...", "name": "...", "email": "..." }
}
```

### Students
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/students/` | List all students | Yes |
| POST | `/api/students/` | Create a student | Yes |
| GET | `/api/students/<matricule>` | Get a student | Yes |
| PUT | `/api/students/<matricule>` | Update a student | Yes |
| DELETE | `/api/students/<matricule>` | Delete a student | Yes |

### Lecturers
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/lecturers/` | List all lecturers | Yes |
| POST | `/api/lecturers/` | Create a lecturer | Admin only |
| GET | `/api/lecturers/<lecturer_id>` | Get a lecturer | Yes |

### Courses
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/courses/` | List all courses | Yes |
| POST | `/api/courses/` | Create a course | Admin only |
| GET | `/api/courses/<course_code>` | Get a course | Yes |
| PUT | `/api/courses/<course_code>` | Update a course | Admin only |
| DELETE | `/api/courses/<course_code>` | Delete a course | Admin only |

### Class Schedules
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/schedules/` | List all schedules | Yes |
| POST | `/api/schedules/` | Create a schedule | Admin/Lecturer |
| GET | `/api/schedules/<schedule_id>` | Get a schedule | Yes |

### Enrollments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/enrollments/` | Enroll a student | Admin only |
| POST | `/api/enrollments/bulk` | Bulk enroll students | Admin only |
| GET | `/api/enrollments/student/<matricule>` | Get student's enrollments | Yes |
| GET | `/api/enrollments/course/<course_code>` | Get course's enrollments | Yes |

### Face Records
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/faces/upload` | Upload a face photo for a student | Yes |
| GET | `/api/faces/student/<matricule>` | Get face records for a student | Yes |

### Attendance
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/attendance/mark` | Mark attendance from a classroom photo | Admin/Lecturer |
| GET | `/api/attendance/report` | Get attendance report for a course | Admin/Lecturer |
| POST | `/api/attendance/exceptions` | Create an attendance exception | Admin only |

**Mark attendance request (multipart/form-data):**
```
image_data: <image file>
course_code: "CSC301"
schedule_id: 1
```

---

## 15. Roles and Permissions

| Action | Admin | Lecturer |
|---|---|---|
| Login | ✅ | ✅ |
| Create lecturers | ✅ | ❌ |
| Create courses | ✅ | ❌ |
| Create schedules | ✅ | ✅ |
| Register students | ✅ | ❌ |
| Enroll students | ✅ | ❌ |
| Upload face records | ✅ | ❌ |
| Mark attendance | ✅ | ✅ |
| View reports | ✅ | ✅ |
| Create exceptions | ✅ | ❌ |

---

## 16. Common Issues and Fixes

**`dlib` fails to install**
Make sure `cmake` and C++ build tools are installed. On Ubuntu: `sudo apt install cmake build-essential`. On macOS: `brew install cmake`.

**`No faces detected` when uploading a face photo**
The image may be too dark, blurry, or the face is too small. Use a clear, well-lit portrait photo where the face takes up most of the frame.

**Face recognition is inaccurate (wrong students identified)**
- The face embeddings in the database may have been generated from low-quality photos. Re-upload better photos.
- The Euclidean distance threshold is set to `0.4` in `face_recognition_service.py`. You can lower it (e.g. `0.35`) for stricter matching or raise it (e.g. `0.5`) for more lenient matching.

**`flask db upgrade` fails**
Make sure your `DATABASE_URL` in `.env` is correct and PostgreSQL is running. Also ensure the `edu_track` database exists.

**`FACE_SERVICE` not found error**
The face recognition service is initialised at startup in `app.py`. Make sure `YOLO_MODEL_PATH` in your `.env` points to a valid `.pt` model file.

**3000+ file changes in git**
The virtual environment and Next.js build folders should be ignored. Run:
```bash
git rm -r --cached .
git add .
git commit -m "fix: apply .gitignore"
```

**Virtual environment is corrupted**
```bash
deactivate
rm -rf backend/yolov8_env
python3 -m venv backend/yolov8_env
source backend/yolov8_env/bin/activate
pip install -r backend/requirements.txt
```

---

## 17. Future Work — Edge Deployment with TinyML

### The Problem with the Current Architecture

EduTrack currently runs on a laptop or a cloud server. A lecturer takes a photo, it gets sent to the backend, processed, and the result comes back. This works well for a small class of 20–50 students in a single room.

But consider a university like the University of Buea, or any large institution, where you might have:
- **20,000+ students** spread across dozens of buildings and lecture halls
- Multiple classes running simultaneously at the same time
- Lecture halls with no reliable internet connection
- No budget for a powerful server per classroom

In that reality, you cannot have a lecturer carrying a laptop to every class. You cannot rely on a cloud server when the network is unstable. And you cannot afford to have a high-end machine in every room. This is where **TinyML and edge deployment** become the natural next step for EduTrack.

---

### What is TinyML?

TinyML is the practice of running machine learning models directly on small, low-power hardware devices — without needing a server, a cloud connection, or even a laptop. The model lives on the device itself and does all its processing locally.

Think of it like this: instead of taking a photo and sending it to a powerful computer somewhere to be analysed, the tiny device in the classroom does the analysis itself, right there, in real time.

Examples of hardware that TinyML targets:

| Device | What it is | Why it matters for EduTrack |
|---|---|---|
| Raspberry Pi 4 / 5 | Small single-board computer (~$35–$80) | Can run YOLOv8n and face recognition with a camera module attached |
| NVIDIA Jetson Nano | Low-power GPU board (~$100–$150) | Has a real GPU, can run inference much faster than Raspberry Pi |
| Google Coral Dev Board | Edge TPU accelerator (~$100) | Designed specifically for fast, efficient ML inference on-device |
| ESP32-S3 with camera | Microcontroller with built-in camera (~$5–$15) | Extremely cheap, ultra-low power, suitable for simple face detection only |
| Orange Pi / Rock Pi | Raspberry Pi alternatives (~$30–$60) | Similar capability, often cheaper |

---

### How EduTrack Would Work on Edge Hardware

The idea is to mount a small device with a camera in each classroom — fixed to the wall or the lectern — that runs the face detection and recognition pipeline entirely on-device. Here is how the flow would change:

**Current flow (cloud/laptop):**
```
Lecturer takes photo → sends to backend server → server runs YOLO + face_recognition → returns result → attendance saved
```

**Edge flow (TinyML device in classroom):**
```
Device camera captures frame → YOLO detects faces on-device → face_recognition matches embeddings on-device → attendance synced to central database when internet is available
```

The device would:
1. Continuously capture frames from the classroom camera
2. Run the YOLOv8 face detection model locally
3. Extract face embeddings locally
4. Compare against a locally stored copy of the enrolled students' embeddings for that classroom
5. Mark attendance locally
6. Sync the attendance records to the central PostgreSQL database whenever a network connection is available (online or offline-first)

This means attendance can be taken even with **zero internet connectivity**. The sync happens later.

---

### Model Optimisation for Edge Devices

The current `model.pt` (YOLOv8) and `dlib` face recognition pipeline are designed for a full computer. To run on a tiny device, the models need to be made smaller and faster through a process called **model optimisation**. The main techniques are:

**1. Quantisation**
Reduces the precision of the model's numbers from 32-bit floats to 8-bit integers. This makes the model 4x smaller and 2–4x faster with minimal loss in accuracy. YOLOv8 supports this natively:
```python
from ultralytics import YOLO
model = YOLO('model.pt')
model.export(format='tflite', int8=True)  # Export as quantised TFLite model
```

**2. Export to TFLite or ONNX**
TensorFlow Lite (TFLite) is the standard format for running models on edge devices. ONNX is another portable format supported by many runtimes. YOLOv8 can export to both:
```python
model.export(format='tflite')   # For Raspberry Pi, Coral, mobile
model.export(format='onnx')     # For Jetson Nano, general edge runtimes
```

**3. Use YOLOv8n (nano) — already done in this project**
The `n` in `yolov8n` stands for nano — it is the smallest and fastest variant of YOLOv8. This project already uses it, which means the detection model is already well-suited for edge deployment with minimal changes.

**4. Replace dlib with a lighter embedding model**
`dlib` is heavy and slow on low-power hardware. For edge deployment, it should be replaced with a lighter alternative:
- **MobileFaceNet** — designed specifically for mobile and edge devices, very fast
- **FaceNet (MobileNetV2 backbone)** — smaller than dlib, runs well on Raspberry Pi
- **InsightFace (buffalo_sc model)** — has a small variant optimised for edge

---

### Recommended Hardware Path

If you want to build the edge version of EduTrack, here is the recommended progression:

**Stage 1 — Proof of concept (~$80)**
Use a **Raspberry Pi 4 (4GB RAM)** with the official Camera Module v2. Install the TFLite runtime, export the YOLOv8 model to TFLite, and replace dlib with MobileFaceNet. This will give you a working prototype that runs entirely offline.

**Stage 2 — Production-ready (~$150)**
Use an **NVIDIA Jetson Nano** or **Jetson Orin Nano**. These have a real GPU that can run the full YOLOv8 + face recognition pipeline at 15–30 FPS, which is fast enough for a live classroom camera feed. The Jetson also supports ONNX and TensorRT for further acceleration.

**Stage 3 — Scale across campus**
Deploy one device per classroom. Each device holds the embeddings for students enrolled in courses scheduled in that room. A central server (the existing EduTrack backend) receives attendance syncs from all devices. The admin dashboard shows real-time attendance across the entire campus.

---

### What Needs to Change in the Codebase

To support edge deployment, the following changes would be needed:

- **Export pipeline** — add a script to export `model.pt` to TFLite/ONNX format
- **Lightweight embedding model** — replace `face_recognition` (dlib) with MobileFaceNet or similar
- **Offline-first attendance sync** — add a local SQLite store on the device that queues attendance records and syncs to the central PostgreSQL database when online
- **Device registration** — each classroom device registers itself with the backend so the server knows which room it belongs to and which students to load embeddings for
- **Embedding distribution** — the backend pushes the relevant face embeddings to each device when students are enrolled or updated, so the device always has an up-to-date local copy

---

### Why This Matters

The current EduTrack system proves the concept works — facial recognition can accurately identify students and automate attendance. The edge deployment path is what takes it from a university project to something that could realistically be deployed across an entire institution at scale, with low cost per classroom, no dependency on internet connectivity during class, and no need for a lecturer to do anything at all beyond walking into the room.
