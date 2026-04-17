import { GraduationCap, User } from "lucide-react"

export function RecentAttendance() {
  return (
    <div className="space-y-4">
      {[
        {
          name: "Sarah Williams",
          time: "Just now",
          action: "Checked in",
          course: "CS401: Advanced Algorithms",
          type: "student",
        },
        {
          name: "Dr. David Wilson",
          time: "5 minutes ago",
          action: "Checked in",
          course: "PHY302: Quantum Mechanics",
          type: "lecturer",
        },
        {
          name: "Emily Davis",
          time: "12 minutes ago",
          action: "Checked in",
          course: "BIO201: Cell Biology",
          type: "student",
        },
        {
          name: "Prof. Michael Brown",
          time: "25 minutes ago",
          action: "Checked in",
          course: "MATH401: Advanced Calculus",
          type: "lecturer",
        },
        {
          name: "Alex Johnson",
          time: "32 minutes ago",
          action: "Checked in",
          course: "ENG205: Literature Analysis",
          type: "student",
        },
      ].map((activity, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            {activity.type === "student" ? (
              <GraduationCap className="h-4 w-4 text-primary" />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-xs text-muted-foreground">
              {activity.action} • {activity.time}
            </p>
          </div>
          <div className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">{activity.course}</div>
        </div>
      ))}
    </div>
  )
}
