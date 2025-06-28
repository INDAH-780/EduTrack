import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AdminSystemOverview() {
  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Department Status</h3>
          <div className="space-y-3">
            {[
              { name: "Computer Science", students: 1245, lecturers: 45, status: "active" },
              { name: "Engineering", students: 1580, lecturers: 62, status: "active" },
              { name: "Biology", students: 980, lecturers: 38, status: "active" },
              { name: "Mathematics", students: 720, lecturers: 28, status: "active" },
              { name: "Physics", students: 850, lecturers: 32, status: "maintenance" },
            ].map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {dept.students} students • {dept.lecturers} lecturers
                  </p>
                </div>
                <Badge variant={dept.status === "active" ? "default" : "secondary"}>{dept.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-2">
            <Button variant="outline" className="justify-start">
              Add New Student
            </Button>
            <Button variant="outline" className="justify-start">
              Add New Lecturer
            </Button>
            <Button variant="outline" className="justify-start">
              Create Course
            </Button>
            <Button variant="outline" className="justify-start">
              Generate Report
            </Button>
            <Button variant="outline" className="justify-start">
              System Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
