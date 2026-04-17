import { GraduationCap, User, BookOpen, Settings } from "lucide-react"

export function AdminRecentActivity() {
  return (
    <div className="space-y-4">
      {[
        {
          action: "New lecturer added",
          details: "Dr. Sarah Johnson joined Computer Science",
          time: "5 minutes ago",
          type: "lecturer",
        },
        {
          action: "Course created",
          details: "Advanced Machine Learning (CS501)",
          time: "15 minutes ago",
          type: "course",
        },
        {
          action: "Student enrolled",
          details: "25 students enrolled in PHY302",
          time: "32 minutes ago",
          type: "student",
        },
        {
          action: "System update",
          details: "Facial recognition model updated",
          time: "1 hour ago",
          type: "system",
        },
        {
          action: "Report generated",
          details: "Monthly attendance report created",
          time: "2 hours ago",
          type: "system",
        },
      ].map((activity, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            {activity.type === "student" && <GraduationCap className="h-4 w-4 text-primary" />}
            {activity.type === "lecturer" && <User className="h-4 w-4 text-primary" />}
            {activity.type === "course" && <BookOpen className="h-4 w-4 text-primary" />}
            {activity.type === "system" && <Settings className="h-4 w-4 text-primary" />}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.details}</p>
          </div>
          <div className="text-xs text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}
