"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface LecturerAttendanceTableProps {
  department: string
}

export function LecturerAttendanceTable({ department }: LecturerAttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const lecturers = [
    {
      name: "Dr. David Wilson",
      id: "LEC001",
      course: "CS401: Advanced Algorithms",
      department: "Computer Science",
      checkIn: "09:15 AM",
      status: "Present",
    },
    {
      name: "Prof. Jennifer Garcia",
      id: "LEC042",
      course: "PHY302: Quantum Mechanics",
      department: "Physics",
      checkIn: "09:45 AM",
      status: "Present",
    },
    {
      name: "Dr. Michael Brown",
      id: "LEC023",
      course: "MATH401: Advanced Calculus",
      department: "Mathematics",
      checkIn: "08:50 AM",
      status: "Present",
    },
    {
      name: "Prof. Emily Davis",
      id: "LEC067",
      course: "BIO201: Cell Biology",
      department: "Biology",
      checkIn: "N/A",
      status: "Absent",
    },
    {
      name: "Dr. Robert Martinez",
      id: "LEC089",
      course: "ENG205: Literature Analysis",
      department: "English",
      checkIn: "09:10 AM",
      status: "Present",
    },
    {
      name: "Prof. Sarah Williams",
      id: "LEC102",
      course: "CS305: Database Systems",
      department: "Computer Science",
      checkIn: "10:05 AM",
      status: "Late",
    },
  ]

  const filteredLecturers = lecturers.filter(
    (lecturer) =>
      (department === "all" || lecturer.department.toLowerCase().includes(department.toLowerCase())) &&
      (lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.course.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 w-full max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lecturers..."
          className="h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lecturer</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Course</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check In</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredLecturers.map((lecturer) => (
              <tr
                key={lecturer.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">{lecturer.name}</td>
                <td className="p-4 align-middle">{lecturer.id}</td>
                <td className="p-4 align-middle">{lecturer.course}</td>
                <td className="p-4 align-middle">{lecturer.department}</td>
                <td className="p-4 align-middle">{lecturer.checkIn}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      lecturer.status === "Present"
                        ? "bg-green-100 text-green-800"
                        : lecturer.status === "Late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {lecturer.status}
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
