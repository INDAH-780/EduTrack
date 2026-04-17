import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function UpcomingClasses() {
  return (
    <div className="overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Course</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Code</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lecturer</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Students</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {[
            {
              course: "Advanced Algorithms",
              code: "CS401",
              lecturer: "Dr. David Wilson",
              time: "10:00 AM - 11:30 AM",
              location: "Science Building, Room 302",
              students: 45,
            },
            {
              course: "Quantum Mechanics",
              code: "PHY302",
              lecturer: "Prof. Jennifer Garcia",
              time: "11:45 AM - 1:15 PM",
              location: "Physics Building, Room 105",
              students: 32,
            },
            {
              course: "Cell Biology",
              code: "BIO201",
              lecturer: "Dr. Michael Brown",
              time: "1:30 PM - 3:00 PM",
              location: "Life Sciences, Lab 4",
              students: 38,
            },
            {
              course: "Advanced Calculus",
              code: "MATH401",
              lecturer: "Prof. Sarah Williams",
              time: "3:15 PM - 4:45 PM",
              location: "Mathematics Building, Room 201",
              students: 42,
            },
            {
              course: "Literature Analysis",
              code: "ENG205",
              lecturer: "Dr. Emily Davis",
              time: "5:00 PM - 6:30 PM",
              location: "Humanities Building, Room 105",
              students: 35,
            },
          ].map((course, index) => (
            <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle font-medium">{course.course}</td>
              <td className="p-4 align-middle">{course.code}</td>
              <td className="p-4 align-middle">{course.lecturer}</td>
              <td className="p-4 align-middle">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {course.time}
                </div>
              </td>
              <td className="p-4 align-middle">{course.location}</td>
              <td className="p-4 align-middle">{course.students}</td>
              <td className="p-4 align-middle">
                <Button size="sm" asChild>
                  <Link href={`/take-attendance/${course.code.toLowerCase()}`}>Take Attendance</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
