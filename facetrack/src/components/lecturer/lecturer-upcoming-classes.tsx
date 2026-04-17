import { Clock, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LecturerUpcomingClassesProps {
  filter?: "today" | "week" | "all"
}

export function LecturerUpcomingClasses({ filter = "all" }: LecturerUpcomingClassesProps) {
  const classes = [
    {
      course: "Advanced Algorithms",
      code: "CS401",
      time: "10:00 AM - 11:30 AM",
      date: "Today",
      location: "Science Building, Room 302",
      students: 45,
      attendanceStatus: "pending",
    },
    {
      course: "Database Systems",
      code: "CS305",
      time: "2:00 PM - 3:30 PM",
      date: "Today",
      location: "Computer Lab 1",
      students: 38,
      attendanceStatus: "pending",
    },
    {
      course: "Software Engineering",
      code: "CS350",
      time: "9:00 AM - 10:30 AM",
      date: "Tomorrow",
      location: "Science Building, Room 205",
      students: 42,
      attendanceStatus: "scheduled",
    },
    {
      course: "Data Structures",
      code: "CS201",
      time: "11:00 AM - 12:30 PM",
      date: "Tomorrow",
      location: "Computer Lab 2",
      students: 50,
      attendanceStatus: "scheduled",
    },
  ]

  const filteredClasses = classes.filter((cls) => {
    if (filter === "today") return cls.date === "Today"
    if (filter === "week") return cls.date === "Today" || cls.date === "Tomorrow"
    return true
  })

  return (
    <div className="p-6">
      <div className="space-y-4">
        {filteredClasses.map((cls, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">{cls.course}</h3>
                  <p className="text-sm text-muted-foreground">{cls.code}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{cls.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{cls.students} students</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{cls.date}</span>
              {cls.attendanceStatus === "pending" && (
                <Button size="sm" asChild>
                  <Link href={`/lecturer/take-attendance/${cls.code.toLowerCase()}`}>Take Attendance</Link>
                </Button>
              )}
              {cls.attendanceStatus === "scheduled" && (
                <Button variant="outline" size="sm" disabled>
                  Scheduled
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
