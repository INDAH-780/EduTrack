import { AddLecturerPayload, Lecturer } from '@/types/lecturers';
import { authFetch } from './auth';
import { Student } from "@/types/student";
import { AddCoursePayload, Course } from '@/types/courses';
import { AddSchedulePayload, Schedule } from '@/types/schedules';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export const fetchStudents = async (): Promise<Student[]> => {
  const response = await authFetch(`${API_URL}/api/students`);
  return response.json();
};

export const fetchLecturers = async (): Promise<Lecturer[]> => {
  const response = await authFetch(`${API_URL}/api/lecturers`);
  return response.json();
};

export const addLecturer = async (lecturer: AddLecturerPayload): Promise<Lecturer> => {
  const response = await authFetch(`${API_URL}/api/lecturers`, {
    method: 'POST',
    body: JSON.stringify(lecturer)
  });
  return response.json();
};

export const fetchCourses = async (): Promise<Course[]> => {
  const response = await authFetch(`${API_URL}/api/courses`);
  return response.json();
};

export const addCourse = async (course: AddCoursePayload): Promise<Course> => {
  const response = await authFetch(`${API_URL}/api/courses`, {
    method: 'POST',
    body: JSON.stringify(course)
  });
  return response.json();
};

export const fetchSchedules = async (): Promise<Schedule[]> => {
  const response = await authFetch(`${API_URL}/api/schedules`);
  return response.json();
};

export const addSchedule = async (schedule: AddSchedulePayload): Promise<Schedule> => {
  const response = await authFetch(`${API_URL}/api/schedules`, {
    method: 'POST',
    body: JSON.stringify(schedule)
  });
  return response.json();
};

export const enrollStudent = async (data: {
  matricule: string;
  course_code: string;
}): Promise<any> => {
  const response = await authFetch(`${API_URL}/api/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const bulkEnrollStudents = async (data: {
  course_code: string;
  departments?: string[];
  levels?: string[];
  matricules?: string[];
}): Promise<any> => {
  const response = await authFetch(`${API_URL}/api/enrollments/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
