"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface StudentAttendanceTableProps {
  department: string
}

export function StudentAttendanceTable({ department }: StudentAttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const students = [
    {
      name: "Alex Johnson",
      id: "STU1001",
      course: "CS401: Advanced Algorithms",
      department: "Computer Science",
      checkIn: "09:45 AM",
      status: "Present",
    },
    {
      name: "Sarah Williams",
      id: "STU1042",
      course: "PHY302: Quantum Mechanics",
      department: "Physics",
      checkIn: "10:15 AM",
      status: "Present",
    },
    {
      name: "Michael Brown",
      id: "STU1023",
      course: "MATH401: Advanced Calculus",
      department: "Mathematics",
      checkIn: "09:12 AM",
      status: "Late",
    },
    {
      name: "Emily Davis",
      id: "STU1067",
      course: "BIO201: Cell Biology",
      department: "Biology",
      checkIn: "08:55 AM",
      status: "Present",
    },
    {
      name: "David Wilson",
      id: "STU1089",
      course: "ENG205: Literature Analysis",
      department: "English",
      checkIn: "N/A",
      status: "Absent",
    },
    {
      name: "Jessica Taylor",
      id: "STU1102",
      course: "CS305: Database Systems",
      department: "Computer Science",
      checkIn: "09:05 AM",
      status: "Present",
    },
    {
      name: "Robert Martinez",
      id: "STU1054",
      course: "PHY201: Classical Mechanics",
      department: "Physics",
      checkIn: "10:10 AM",
      status: "Late",
    },
    {
      name: "Jennifer Garcia",
      id: "STU1076",
      course: "BIO305: Genetics",
      department: "Biology",
      checkIn: "08:50 AM",
      status: "Present",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      (department === "all" || student.department.toLowerCase().includes(department.toLowerCase())) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 w-full max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          className="h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Course</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check In</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">{student.name}</td>
                <td className="p-4 align-middle">{student.id}</td>
                <td className="p-4 align-middle">{student.course}</td>
                <td className="p-4 align-middle">{student.department}</td>
                <td className="p-4 align-middle">{student.checkIn}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      student.status === "Present"
                        ? "bg-green-100 text-green-800"
                        : student.status === "Late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.status}
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
