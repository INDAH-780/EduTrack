'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Loader2, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

type Course = { course_code: string; course_name: string; department: string; level: string; lecturer_id: string };
type StudentRow = {
  matricule: string;
  student_name: string;
  total_sessions: number;
  present_sessions: number;
  absent_sessions: number;
  attendance_rate: number;
};

export default function MyReportsPage() {
  const { user, isAuthenticated, userType, logout } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (userType !== 'lecturer') { logout(); router.push('/login'); }
  }, [isAuthenticated, userType]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'lecturer') return;
    const token = getAuthToken();
    const lecturerId = (user as any)?.lecturer_id;
    fetch(`${API_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((res: any) => {
        const all: Course[] = Array.isArray(res) ? res : (res.courses ?? []);
        const mine = all.filter(c => c.lecturer_id === lecturerId);
        setCourses(mine);
      })
      .catch(console.error);
  }, [isAuthenticated, userType, user]);

  const loadReport = async (courseCode: string) => {
    setSelectedCourse(courseCode);
    const found = courses.find(c => c.course_code === courseCode) || null;
    setCourseInfo(found);
    setLoading(true);
    setRows([]);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/reports/course/${courseCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const records: any[] = data.records || [];

      const map = new Map<string, StudentRow>();
      for (const r of records) {
        if (!map.has(r.matricule)) {
          map.set(r.matricule, {
            matricule: r.matricule,
            student_name: r.student_name || r.matricule,
            total_sessions: 0,
            present_sessions: 0,
            absent_sessions: 0,
            attendance_rate: 0,
          });
        }
        const s = map.get(r.matricule)!;
        s.total_sessions++;
        if (r.status === 'PRESENT') s.present_sessions++;
        else s.absent_sessions++;
      }
      const result = Array.from(map.values()).map(s => ({
        ...s,
        attendance_rate: s.total_sessions > 0
          ? Math.round((s.present_sessions / s.total_sessions) * 100)
          : 0,
      }));
      setRows(result.sort((a, b) => a.matricule.localeCompare(b.matricule)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!courseInfo || rows.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Attendance Report — ${courseInfo.course_name} (${courseInfo.course_code})`, 14, 18);
    doc.setFontSize(10);
    doc.text(`${courseInfo.department} | ${courseInfo.level}`, 14, 26);
    doc.text(`Lecturer: ${user?.name || 'N/A'}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

    autoTable(doc, {
      startY: 44,
      head: [['Matricule', 'Name', 'Total Sessions', 'Present', 'Absent', 'Rate']],
      body: rows.map(r => [
        r.matricule, r.student_name, r.total_sessions,
        r.present_sessions, r.absent_sessions, `${r.attendance_rate}%`
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`attendance_${courseInfo.course_code}.pdf`);
  };

  if (!isAuthenticated || userType !== 'lecturer') {
    return <div className="flex items-center justify-center h-screen"><p>Redirecting...</p></div>;
  }

  const avgRate = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.attendance_rate, 0) / rows.length)
    : 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <h1 className="text-xl font-semibold">My Reports</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-medium">{user?.name || 'Lecturer'}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Course selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Course</CardTitle>
            <CardDescription>View attendance reports for courses you teach</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCourse} onValueChange={loadReport}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0 ? (
                  <SelectItem value="none" disabled>No courses assigned</SelectItem>
                ) : (
                  courses.map(c => (
                    <SelectItem key={c.course_code} value={c.course_code}>
                      {c.course_code} — {c.course_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {rows.length > 0 && (
              <Button onClick={exportPDF} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Summary stats */}
        {courseInfo && rows.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Course" value={courseInfo.course_code} sub={courseInfo.course_name} />
            <StatCard label="Students" value={rows.length.toString()} sub="Enrolled" />
            <StatCard label="Avg Attendance" value={`${avgRate}%`} sub="All students" color={avgRate >= 75 ? 'text-green-600' : 'text-red-600'} />
            <StatCard label="Total Records" value={rows.reduce((s, r) => s + r.total_sessions, 0).toString()} sub="Attendance entries" />
          </div>
        )}

        {/* Report table */}
        {selectedCourse && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>
                  {courseInfo ? `${courseInfo.course_name} (${courseInfo.course_code})` : selectedCourse}
                </CardTitle>
                {courseInfo && (
                  <CardDescription>{courseInfo.department} · {courseInfo.level}</CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading report...
                </div>
              ) : rows.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No attendance records found for this course.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Total Sessions</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.matricule}>
                        <TableCell className="font-mono text-xs">{row.matricule}</TableCell>
                        <TableCell className="font-medium">{row.student_name}</TableCell>
                        <TableCell className="text-center">{row.total_sessions}</TableCell>
                        <TableCell className="text-center text-green-600 font-medium">{row.present_sessions}</TableCell>
                        <TableCell className="text-center text-red-600 font-medium">{row.absent_sessions}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={row.attendance_rate >= 75 ? 'default' : 'destructive'}>
                            {row.attendance_rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, color = '' }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
