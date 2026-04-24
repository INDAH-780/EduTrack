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
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

type Course = { course_code: string; course_name: string; department: string; level: string };

type EnrolledStudent = { matricule: string; name: string };

type RawRecord = {
  attendance_id: number;
  matricule: string;
  student_name: string;
  status: string;
  date: string;
  schedule_id: number;
  schedule_info: { day_of_week: string; start_time: string; end_time: string; location: string } | null;
};

type SessionRow = { matricule: string; name: string; status: 'PRESENT' | 'ABSENT' };

type SessionGroup = {
  key: string;
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  rows: SessionRow[];
  present_count: number;
  absent_count: number;
};

export default function AdminReportsPage() {
  const { isAuthenticated, userType, logout } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (userType !== 'admin') { logout(); router.push('/login'); }
  }, [isAuthenticated, userType]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') return;
    const token = getAuthToken();
    fetch(`${API_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((res: any) => setCourses(Array.isArray(res) ? res : (res.courses ?? [])))
      .catch(console.error);
  }, [isAuthenticated, userType]);

  const loadReport = async (courseCode: string) => {
    setSelectedCourse(courseCode);
    setCourseInfo(courses.find(c => c.course_code === courseCode) || null);
    setLoading(true);
    setSessions([]);
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [reportRes, enrollRes] = await Promise.all([
        fetch(`${API_URL}/api/reports/course/${courseCode}`, { headers }),
        fetch(`${API_URL}/api/enrollments/course/${courseCode}`, { headers }),
      ]);

      const reportData = await reportRes.json();
      const enrollData = await enrollRes.json();

      const records: RawRecord[] = reportData.records || [];
      const enrolled: EnrolledStudent[] = (Array.isArray(enrollData) ? enrollData : [])
        .map((e: any) => ({
          matricule: e.student_info?.matricule ?? e.matricule,
          name: e.student_info?.name ?? '',
        }));

      // Build a lookup: matricule -> name from enrolled list
      const enrolledMap = new Map(enrolled.map(s => [s.matricule, s.name]));

      // Group records by (schedule_id, date)
      const sessionMap = new Map<string, { meta: RawRecord; presentSet: Map<string, string> }>();
      for (const r of records) {
        const key = `${r.schedule_id}__${r.date}`;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, { meta: r, presentSet: new Map() });
        }
        if (r.status === 'PRESENT') {
          sessionMap.get(key)!.presentSet.set(r.matricule, r.student_name);
        }
      }

      // For each session, build full rows from enrolled list
      const result: SessionGroup[] = Array.from(sessionMap.entries()).map(([key, { meta, presentSet }]) => {
        const rows: SessionRow[] = enrolled.map(s => ({
          matricule: s.matricule,
          name: s.name || presentSet.get(s.matricule) || s.matricule,
          status: presentSet.has(s.matricule) ? 'PRESENT' : 'ABSENT',
        }));
        rows.sort((a, b) => a.matricule.localeCompare(b.matricule));
        return {
          key,
          date: meta.date,
          day_of_week: meta.schedule_info?.day_of_week ?? '',
          start_time: meta.schedule_info?.start_time ?? '',
          end_time: meta.schedule_info?.end_time ?? '',
          location: meta.schedule_info?.location ?? '',
          rows,
          present_count: rows.filter(r => r.status === 'PRESENT').length,
          absent_count: rows.filter(r => r.status === 'ABSENT').length,
        };
      });

      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!courseInfo || sessions.length === 0) return;
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF() as any;

    doc.setFontSize(16);
    doc.text('Attendance Report', 14, 16);
    doc.setFontSize(11);
    doc.text(`${courseInfo.course_name} (${courseInfo.course_code})`, 14, 24);
    doc.text(`${courseInfo.department} · ${courseInfo.level}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    let y = 44;
    for (const session of sessions) {
      if (y > 240) { doc.addPage(); y = 16; }
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(
        `${session.day_of_week} ${session.date} · ${session.start_time}–${session.end_time}${session.location ? ' · ' + session.location : ''}`,
        14, y
      );
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Present: ${session.present_count}  Absent: ${session.absent_count}`, 14, y + 5);
      autoTable(doc, {
        startY: y + 9,
        head: [['Matricule', 'Name', 'Status']],
        body: session.rows.map(r => [r.matricule, r.name, r.status]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 12;
    }
    doc.save(`attendance_${courseInfo.course_code}.pdf`);
  };

  if (!isAuthenticated || userType !== 'admin') {
    return <div className="flex items-center justify-center h-screen"><p>Redirecting...</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <h1 className="text-xl font-semibold">Attendance Reports</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>Choose a course to view its session-by-session attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCourse} onValueChange={loadReport}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.course_code} value={c.course_code}>
                    {c.course_code} — {c.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sessions.length > 0 && (
              <Button onClick={exportPDF} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            )}
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading sessions...
          </div>
        )}

        {!loading && selectedCourse && sessions.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No attendance records found for this course.</p>
        )}

        {!loading && sessions.length > 0 && courseInfo && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Course</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{courseInfo.course_code}</div><p className="text-xs text-muted-foreground">{courseInfo.course_name}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{sessions.length}</div><p className="text-xs text-muted-foreground">Recorded class sessions</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Students Enrolled</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{sessions[0]?.rows.length ?? 0}</div><p className="text-xs text-muted-foreground">Per session</p></CardContent>
            </Card>
          </div>
        )}

        {!loading && sessions.map(session => (
          <Card key={session.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">
                    {session.day_of_week}, {new Date(session.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <CardDescription>
                    {session.start_time} – {session.end_time}
                    {session.location ? ` · ${session.location}` : ''}
                  </CardDescription>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> {session.present_count} Present
                  </span>
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <XCircle className="h-4 w-4" /> {session.absent_count} Absent
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session.rows.map(r => (
                    <TableRow key={r.matricule}>
                      <TableCell className="font-mono text-xs">{r.matricule}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={r.status === 'PRESENT' ? 'default' : 'destructive'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
