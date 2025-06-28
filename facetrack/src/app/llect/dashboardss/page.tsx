import ProtectedRoute from "@/components/auth/protected-route"
import { BookOpen, Clock, Users, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LecturerAttendanceChart } from "@/components/lecturer/lecturer-attendance-chart"
import { LecturerRecentActivity } from "@/components/lecturer/lecturer-recent-activity"
import { LecturerUpcomingClasses } from "@/components/lecturer/lecturer-upcoming-classes"

export default function LecturerDashboard() {
  return (
    <ProtectedRoute requiredRole="lecturer">
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <h1 className="text-xl font-semibold">Lecturer Dashboard</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Personal Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Active this semester</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">287</div>
                <p className="text-xs text-muted-foreground">Across all courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Next class at 10:00 AM</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">89.2%</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>My Courses Attendance</CardTitle>
                <CardDescription>Weekly attendance for your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <LecturerAttendanceChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <LecturerRecentActivity />
              </CardContent>
            </Card>
          </div>

          {/* Classes Management */}
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex items-center">
              <h2 className="text-xl font-bold tracking-tight mr-4">My Classes</h2>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upcoming" className="border rounded-lg">
              <LecturerUpcomingClasses />
            </TabsContent>
            <TabsContent value="today" className="border rounded-lg">
              <LecturerUpcomingClasses filter="today" />
            </TabsContent>
            <TabsContent value="week" className="border rounded-lg">
              <LecturerUpcomingClasses filter="week" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
