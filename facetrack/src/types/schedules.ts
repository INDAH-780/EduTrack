export interface Schedule {
  schedule_id: number;
  course_code: string;
  course_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface AddSchedulePayload {
  course_code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
}