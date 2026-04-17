export interface Course {
  attendance_rate: number;
  pending_attendance: unknown;
  course_code: string;
  course_name: string;
  department: string;
  lecturer_id: string;
  lecturer_name: string;
  level: string;
  semester: string;
  total_enrolled_students: number;
}

export interface AddCoursePayload {
  course_code: string;
  course_name: string;
  department: string;
  lecturer_id: string;
  level: string;
  semester: string;
}