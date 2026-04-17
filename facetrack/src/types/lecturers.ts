export interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddLecturerPayload {
  name: string;
  email: string;
  password: string;
  department: string;
}