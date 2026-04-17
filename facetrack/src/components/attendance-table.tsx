"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function AttendanceTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const employees = [
    {
      name: "Alex Johnson",
      id: "EMP001",
      department: "Engineering",
      checkIn: "08:32 AM",
      checkOut: "05:15 PM",
      status: "Present",
    },
    {
      name: "Sarah Williams",
      id: "EMP042",
      department: "Marketing",
      checkIn: "08:45 AM",
      checkOut: "05:30 PM",
      status: "Present",
    },
    {
      name: "Michael Brown",
      id: "EMP023",
      department: "Finance",
      checkIn: "09:12 AM",
      checkOut: "05:45 PM",
      status: "Late",
    },
    {
      name: "Emily Davis",
      id: "EMP067",
      department: "HR",
      checkIn: "08:30 AM",
      checkOut: "04:45 PM",
      status: "Present",
    },
    {
      name: "David Wilson",
      id: "EMP089",
      department: "Engineering",
      checkIn: "08:55 AM",
      checkOut: "05:20 PM",
      status: "Present",
    },
  ]

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 w-full max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check In</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check Out</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">{employee.name}</td>
                <td className="p-4 align-middle">{employee.id}</td>
                <td className="p-4 align-middle">{employee.department}</td>
                <td className="p-4 align-middle">{employee.checkIn}</td>
                <td className="p-4 align-middle">{employee.checkOut}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      employee.status === "Present" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {employee.status}
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
