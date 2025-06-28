import { Camera, Edit, FileText, Clock } from "lucide-react"

export function LecturerRecentActivity() {
  return (
    <div className="space-y-4">
      {[
        {
          action: "Attendance taken",
          details: "CS401: Advanced Algorithms",
          time: "10 minutes ago",
          type: "attendance",
        },
        {
          action: "Attendance updated",
          details: "Marked 3 students present manually",
          time: "1 hour ago",
          type: "edit",
        },
        {
          action: "Report viewed",
          details: "Weekly attendance report for PHY302",
          time: "2 hours ago",
          type: "report",
        },
        {
          action: "Class scheduled",
          details: "BIO201 lab session added",
          time: "3 hours ago",
          type: "schedule",
        },
        {
          action: "Attendance taken",
          details: "MATH401: Advanced Calculus",
          time: "1 day ago",
          type: "attendance",
        },
      ].map((activity, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            {activity.type === "attendance" && <Camera className="h-4 w-4 text-primary" />}
            {activity.type === "edit" && <Edit className="h-4 w-4 text-primary" />}
            {activity.type === "report" && <FileText className="h-4 w-4 text-primary" />}
            {activity.type === "schedule" && <Clock className="h-4 w-4 text-primary" />}
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
