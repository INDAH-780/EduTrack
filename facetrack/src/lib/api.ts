import { AddLecturerPayload, Lecturer } from '@/types/lecturers';
import { authFetch } from './auth';

import { Student } from "@/types/student";
import { AddCoursePayload, Course } from '@/types/courses';
import { AddSchedulePayload, Schedule } from '@/types/schedules';

export const fetchStudents = async (): Promise<Student[]> => {
  const endpoint = 'http://127.0.0.1:5000/api/students';
  
  try {
    const response = await authFetch(endpoint);
    const data = await response.json();
    console.log('[fetchStudents] Successful response:', data);
    return data;
  } catch (error) {
    console.error('[fetchStudents] Error:', error);
    throw error;
  }
};

export const fetchLecturers = async (): Promise<Lecturer[]> => {
  const endpoint = 'http://127.0.0.1:5000/api/lecturers';
  const response = await authFetch(endpoint);
  return response.json();
};

export const addLecturer = async (lecturer: AddLecturerPayload): Promise<Lecturer> => {
  const endpoint = 'http://127.0.0.1:5000/api/lecturers';
  const response = await authFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(lecturer)
  });
  return response.json();
};



export const fetchCourses = async (): Promise<Course[]> => {
  const response = await authFetch('http://127.0.0.1:5000/api/courses');
  return response.json();
};

export const addCourse = async (course: AddCoursePayload): Promise<Course> => {
  const response = await authFetch('http://127.0.0.1:5000/api/courses', {
    method: 'POST',
    body: JSON.stringify(course)
  });
  return response.json();
};



export const fetchSchedules = async (): Promise<Schedule[]> => {
  const response = await authFetch('http://127.0.0.1:5000/api/schedules');
  return response.json();
};

export const addSchedule = async (schedule: AddSchedulePayload): Promise<Schedule> => {
  const response = await authFetch('http://127.0.0.1:5000/api/schedules', {
    method: 'POST',
    body: JSON.stringify(schedule)
  });
  return response.json();
};

// Add these to your existing API functions
export const enrollStudent = async (data: {
  matricule: string;
  course_code: string;
}): Promise<any> => {
  const endpoint = 'http://127.0.0.1:5000/api/enrollments';
  const response = await authFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const endpoint = 'http://127.0.0.1:5000/api/enrollments/bulk';
  const response = await authFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  return response.json();
};


