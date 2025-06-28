"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Computer Science",
    students: 1245,
    lecturers: 45,
    attendanceRate: 92,
  },
  {
    name: "Engineering",
    students: 1580,
    lecturers: 62,
    attendanceRate: 88,
  },
  {
    name: "Biology",
    students: 980,
    lecturers: 38,
    attendanceRate: 85,
  },
  {
    name: "Mathematics",
    students: 720,
    lecturers: 28,
    attendanceRate: 90,
  },
  {
    name: "Physics",
    students: 850,
    lecturers: 32,
    attendanceRate: 87,
  },
  {
    name: "English",
    students: 650,
    lecturers: 25,
    attendanceRate: 83,
  },
]

export function AdminAttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="students" name="Total Students" fill="#3b82f6" />
        <Bar dataKey="attendanceRate" name="Attendance Rate %" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  )
}
