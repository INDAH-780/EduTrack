"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface CourseAttendanceTableProps {
  department: string
}

export function CourseAttendanceTable({ department }: CourseAttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const courses = [
    {
      name: "Advanced Algorithms",
      code: "CS401",
      lecturer: "Dr. David Wilson",
      department: "Computer Science",
      time: "10:00 AM - 11:30 AM",
      attendance: "42/45 (93%)",
      status: "In Progress",
    },
    {
      name: "Quantum Mechanics",
      code: "PHY302",
      lecturer: "Prof. Jennifer Garcia",
      department: "Physics",
      time: "11:45 AM - 1:15 PM",
      attendance: "28/32 (88%)",
      status: "Upcoming",
    },
    {
      name: "Cell Biology",
      code: "BIO201",
      lecturer: "Dr. Michael Brown",
      department: "Biology",
      time: "1:30 PM - 3:00 PM",
      attendance: "35/38 (92%)",
      status: "Upcoming",
    },
    {
      name: "Advanced Calculus",
      code: "MATH401",
      lecturer: "Prof. Sarah Williams",
      department: "Mathematics",
      time: "3:15 PM - 4:45 PM",
      attendance: "38/42 (90%)",
      status: "Upcoming",
    },
    {
      name: "Literature Analysis",
      code: "ENG205",
      lecturer: "Dr. Emily Davis",
      department: "English",
      time: "5:00 PM - 6:30 PM",
      attendance: "30/35 (86%)",
      status: "Upcoming",
    },
    {
      name: "Database Systems",
      code: "CS305",
      lecturer: "Prof. Robert Martinez",
      department: "Computer Science",
      time: "8:30 AM - 10:00 AM",
      attendance: "48/50 (96%)",
      status: "Completed",
    },
  ]

  const filteredCourses = courses.filter(
    (course) =>
      (department === "all" || course.department.toLowerCase().includes(department.toLowerCase())) &&
      (course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.lecturer.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 w-full max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Course</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Code</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lecturer</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Attendance</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredCourses.map((course) => (
              <tr
                key={course.code}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle font-medium">{course.name}</td>
                <td className="p-4 align-middle">{course.code}</td>
                <td className="p-4 align-middle">{course.lecturer}</td>
                <td className="p-4 align-middle">{course.department}</td>
                <td className="p-4 align-middle">{course.time}</td>
                <td className="p-4 align-middle">{course.attendance}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      course.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : course.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
