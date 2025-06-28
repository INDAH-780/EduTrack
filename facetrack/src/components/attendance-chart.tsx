"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Mon",
    students: 3245,
    lecturers: 210,
    absentStudents: 597,
    absentLecturers: 38,
  },
  {
    name: "Tue",
    students: 3420,
    lecturers: 225,
    absentStudents: 422,
    absentLecturers: 23,
  },
  {
    name: "Wed",
    students: 3380,
    lecturers: 218,
    absentStudents: 462,
    absentLecturers: 30,
  },
  {
    name: "Thu",
    students: 3290,
    lecturers: 205,
    absentStudents: 552,
    absentLecturers: 43,
  },
  {
    name: "Fri",
    students: 2980,
    lecturers: 190,
    absentStudents: 862,
    absentLecturers: 58,
  },
]

export function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="students" name="Students Present" fill="#22c55e" />
        <Bar dataKey="absentStudents" name="Students Absent" fill="#ef4444" />
        <Bar dataKey="lecturers" name="Lecturers Present" fill="#3b82f6" />
        <Bar dataKey="absentLecturers" name="Lecturers Absent" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  )
}
