'use client';

import { useAuth } from "@/context/authContext";
import { BookOpen, Users, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

type Course = {
  course_code: string;
  course_name: string;
  department: string;
  level: string;
  semester: string;
  total_enrolled_students: number;
  lecturer_id: string;
};

export default function LecturerDashboard() {
  const { user, userType, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ courses: 0, totalStudents: 0, attendanceRate: 0, totalRecords: 0, loading: true });
  const [byCourse, setByCourse] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (userType !== "lecturer") { logout(); router.push("/login"); }
  }, [isAuthenticated, userType, router, logout]);

  useEffect(() => {
    if (!isAuthenticated || userType !== "lecturer") return;
    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };
    const lecturerId = (user as any)?.lecturer_id;

    fetch(`${API_URL}/api/courses`, { headers }).then(r => r.json())
      .then((all: Course[]) => {
        const mine = all.filter(c => c.lecturer_id === lecturerId);
        setCourses(mine);
        const totalStudents = mine.reduce((s, c) => s + (c.total_enrolled_students || 0), 0);
        setStats(p => ({ ...p, courses: mine.length, totalStudents }));
      }).catch(console.error);

    fetch(`${API_URL}/api/reports/stats`, { headers }).then(r => r.json())
      .then(data => setStats(p => ({ ...p, attendanceRate: data.attendance_rate || 0, totalRecords: data.total_attendance_records || 0, loading: false })))
      .catch(() => setStats(p => ({ ...p, loading: false })));

    fetch(`${API_URL}/api/reports/chart/by-course`, { headers }).then(r => r.json())
      .then(setByCourse).catch(console.error);

    fetch(`${API_URL}/api/reports/chart/daily-trend`, { headers }).then(r => r.json())
      .then(setDailyTrend).catch(console.error);
  }, [isAuthenticated, userType, user]);

  if (!isAuthenticated || userType !== "lecturer") return <div className="flex items-center justify-center h-screen"><p>Redirecting...</p></div>;

  // Filter charts to only show lecturer's own courses
  const myCodes = new Set(courses.map(c => c.course_code));
  const myByCourse = byCourse.filter(d => myCodes.has(d.course));

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <h1 className="text-xl font-semibold">Lecturer Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, <span className="font-medium">{user?.name || 'Lecturer'}</span></span>
          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Your Courses" value={stats.loading ? "—" : stats.courses.toString()} icon={<BookOpen className="h-5 w-5 text-blue-500" />} description="Current semester" />
          <StatCard title="Total Students" value={stats.loading ? "—" : stats.totalStudents.toString()} icon={<Users className="h-5 w-5 text-green-500" />} description="Across all your courses" />
          <StatCard title="Attendance Rate" value={stats.loading ? "—" : `${stats.attendanceRate}%`} icon={<CheckCircle className="h-5 w-5 text-purple-500" />} description="All time" valueClassName={stats.attendanceRate >= 75 ? "text-green-600" : "text-red-600"} />
          <StatCard title="Attendance Records" value={stats.loading ? "—" : stats.totalRecords.toString()} icon={<AlertCircle className="h-5 w-5 text-orange-500" />} description="Total sessions recorded" />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
              <CardDescription>Last 14 days — all courses</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyTrend.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No attendance data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} dot={false} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={false} name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance by Your Courses</CardTitle>
              <CardDescription>Present vs Absent per course</CardDescription>
            </CardHeader>
            <CardContent>
              {myByCourse.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No attendance data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={myByCourse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={label => {
                      const item = myByCourse.find(c => c.course === label);
                      return item ? `${item.course_name} (${label})` : label;
                    }} />
                    <Legend />
                    <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Courses table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" /> Your Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 && !stats.loading ? (
              <p className="text-sm text-gray-500 text-center py-6">No courses assigned to you yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course.course_code}>
                      <TableCell className="font-mono text-xs">{course.course_code}</TableCell>
                      <TableCell className="font-medium">{course.course_name}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell className="text-center">{course.total_enrolled_students}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" onClick={() => router.push(`/take-attendance/${course.course_code}`)}>
                          Take Attendance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ title, value, description, icon, valueClassName = "" }: { title: string; value: string; description: string; icon: React.ReactNode; valueClassName?: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
