"use client";

import { useAuth } from "@/context/authContext";
import { BookOpen, GraduationCap, User, TrendingUp, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function AdminDashboard() {
  const { user, userType, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ total_students: 0, total_lecturers: 0, total_courses: 0, attendance_rate: 0, loading: true });
  const [byCourse, setByCourse] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (userType !== "admin") { logout(); router.push("/login"); }
  }, [isAuthenticated, userType, router, logout]);

  useEffect(() => {
    if (!isAuthenticated || userType !== "admin") return;
    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_URL}/api/reports/stats`, { headers }).then(r => r.json())
      .then(data => setStats({ ...data, loading: false })).catch(() => setStats(p => ({ ...p, loading: false })));

    fetch(`${API_URL}/api/reports/chart/by-course`, { headers }).then(r => r.json())
      .then(setByCourse).catch(console.error);

    fetch(`${API_URL}/api/reports/chart/daily-trend`, { headers }).then(r => r.json())
      .then(setDailyTrend).catch(console.error);
  }, [isAuthenticated, userType]);

  if (!isAuthenticated || userType !== "admin") return <div className="flex items-center justify-center h-screen"><p>Redirecting...</p></div>;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome, {user?.name || 'Administrator'}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats.loading ? "—" : stats.total_students.toString()} description="Registered in the system" icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Total Lecturers" value={stats.loading ? "—" : stats.total_lecturers.toString()} description="Active accounts" icon={<User className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Total Courses" value={stats.loading ? "—" : stats.total_courses.toString()} description="Across all departments" icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Overall Attendance Rate" value={stats.loading ? "—" : `${stats.attendance_rate}%`} description="All time" icon={<TrendingUp className="h-4 w-4 text-green-600" />} valueClassName={stats.attendance_rate >= 75 ? "text-green-600" : "text-red-600"} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily trend line chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
              <CardDescription>Present vs Absent over the last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyTrend.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No attendance data yet</div>
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

          {/* By course bar chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Course</CardTitle>
              <CardDescription>Present vs Absent per course</CardDescription>
            </CardHeader>
            <CardContent>
              {byCourse.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No attendance data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={byCourse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value, name, props) => [value, name === 'present' ? 'Present' : 'Absent']} labelFormatter={label => {
                      const item = byCourse.find(c => c.course === label);
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

        {/* Quick links */}
        <div className="grid gap-4 md:grid-cols-3">
          <QuickLinkCard title="Manage Students" description="View, add or update student records" href="/students" />
          <QuickLinkCard title="Manage Lecturers" description="View and create lecturer accounts" href="/lecturers" />
          <QuickLinkCard title="Manage Courses" description="Create courses and assign lecturers" href="/courses" />
          <QuickLinkCard title="Class Schedules" description="Set up timetables for courses" href="/schedules" />
          <QuickLinkCard title="Enrollments" description="Enroll students into courses" href="/students" />
          <QuickLinkCard title="Attendance Reports" description="View attendance across all courses" href="/reports" />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, description, icon, valueClassName = "" }: { title: string; value: string; description: string; icon: React.ReactNode; valueClassName?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({ title, description, href }: { title: string; description: string; href: string }) {
  const router = useRouter();
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(href)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
