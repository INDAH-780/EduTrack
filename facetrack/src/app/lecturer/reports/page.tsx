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
import { Download, Loader2, LogOut, CheckCircle2, XCircle, Pencil, Check, X, FileBarChart2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

type Course = { course_code: string; course_name: string; department: string; level: string; lecturer_id: string };
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

type SessionRow = {
  attendance_id: number;
  matricule: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
};

type SessionGroup = {
  key: string;
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  rows: SessionRow[];
};

export default function LecturerReportsPage() {
  const { user, isAuthenticated, userType, logout } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // editing state: key = `${sessionKey}__${matricule}`, value = new status being selected
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [saving, setSaving] = useState(false);

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
        setCourses(all.filter(c => c.lecturer_id === lecturerId));
      })
      .catch(console.error);
  }, [isAuthenticated, userType, user]);

  const loadReport = async (courseCode: string) => {
    setSelectedCourse(courseCode);
    setCourseInfo(courses.find(c => c.course_code === courseCode) || null);
    setLoading(true);
    setSessions([]);
    setEditingKey(null);
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

      // Group records by (schedule_id, date)
      const sessionMap = new Map<string, { meta: RawRecord; recordMap: Map<string, RawRecord> }>();
      for (const r of records) {
        const key = `${r.schedule_id}__${r.date}`;
        if (!sessionMap.has(key)) sessionMap.set(key, { meta: r, recordMap: new Map() });
        if (r.status === 'PRESENT' || !sessionMap.get(key)!.recordMap.has(r.matricule)) {
          sessionMap.get(key)!.recordMap.set(r.matricule, r);
        }
      }

      const result: SessionGroup[] = Array.from(sessionMap.entries()).map(([key, { meta, recordMap }]) => {
        const rows: SessionRow[] = enrolled.map(s => {
          const rec = recordMap.get(s.matricule);
          return {
            attendance_id: rec?.attendance_id ?? -1,
            matricule: s.matricule,
            name: s.name || rec?.student_name || s.matricule,
            status: (rec?.status as 'PRESENT' | 'ABSENT' | 'LATE') ?? 'ABSENT',
          };
        });
        rows.sort((a, b) => a.matricule.localeCompare(b.matricule));
        return {
          key,
          date: meta.date,
          day_of_week: meta.schedule_info?.day_of_week ?? '',
          start_time: meta.schedule_info?.start_time ?? '',
          end_time: meta.schedule_info?.end_time ?? '',
          location: meta.schedule_info?.location ?? '',
          rows,
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

  const startEdit = (sessionKey: string, row: SessionRow) => {
    setEditingKey(`${sessionKey}__${row.matricule}`);
    setEditingStatus(row.status);
  };

  const cancelEdit = () => setEditingKey(null);

  const saveEdit = async (sessionKey: string, row: SessionRow) => {
    if (row.attendance_id === -1) {
      toast({ title: 'Cannot edit', description: 'No attendance record exists for this student in this session.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/attendance/${row.attendance_id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editingStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');

      // Update local state
      setSessions(prev => prev.map(s => {
        if (s.key !== sessionKey) return s;
        return {
          ...s,
          rows: s.rows.map(r =>
            r.matricule === row.matricule ? { ...r, status: editingStatus } : r
          ),
        };
      }));
      setEditingKey(null);
      toast({ title: 'Updated', description: `${row.name} marked as ${editingStatus}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update attendance', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const generateFinalReport = async () => {
    if (!courseInfo || sessions.length === 0) return;
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF() as any;

    const totalSessions = sessions.length;

    // Collect all unique students from the first session's rows (all sessions have same enrolled list)
    const studentMap = new Map<string, { matricule: string; name: string; present: number; late: number }>();
    for (const session of sessions) {
      for (const row of session.rows) {
        if (!studentMap.has(row.matricule)) {
          studentMap.set(row.matricule, { matricule: row.matricule, name: row.name, present: 0, late: 0 });
        }
        if (row.status === 'PRESENT') studentMap.get(row.matricule)!.present++;
        else if (row.status === 'LATE') studentMap.get(row.matricule)!.late++;
      }
    }

    const students = Array.from(studentMap.values()).sort((a, b) => a.matricule.localeCompare(b.matricule));

    // --- Header ---
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Final Attendance Report', 14, 14);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`${courseInfo.course_name} (${courseInfo.course_code})  ·  ${courseInfo.department}  ·  ${courseInfo.level}`, 14, 22);
    doc.text(`Lecturer: ${user?.name || 'N/A'}  ·  Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    // --- Summary boxes ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const boxY = 38;
    const boxes = [
      { label: 'Total Sessions Held', value: String(totalSessions) },
      { label: 'Students Enrolled', value: String(students.length) },
      { label: 'Avg Attendance Rate', value: `${totalSessions > 0 ? Math.round(students.reduce((s, st) => s + st.present, 0) / (students.length * totalSessions) * 100) : 0}%` },
    ];
    const boxW = 58;
    boxes.forEach((box, i) => {
      const x = 14 + i * (boxW + 5);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, boxY, boxW, 18, 2, 2, 'FD');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(box.value, x + boxW / 2, boxY + 10, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(box.label, x + boxW / 2, boxY + 15, { align: 'center' });
    });

    // --- Session list ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Sessions Held', 14, boxY + 26);
    autoTable(doc, {
      startY: boxY + 29,
      head: [['#', 'Date', 'Day', 'Time', 'Location', 'Present', 'Absent']],
      body: [...sessions]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((s, i) => [
          i + 1,
          s.date,
          s.day_of_week,
          `${s.start_time}–${s.end_time}`,
          s.location || '—',
          s.rows.filter(r => r.status === 'PRESENT').length,
          s.rows.filter(r => r.status !== 'PRESENT').length,
        ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
    });

    // --- Student summary table ---
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    const afterSessions = doc.lastAutoTable.finalY + 10;
    if (afterSessions > 250) doc.addPage();
    const summaryY = afterSessions > 250 ? 16 : afterSessions;
    doc.text('Student Attendance Summary', 14, summaryY);

    autoTable(doc, {
      startY: summaryY + 4,
      head: [['Matricule', 'Name', 'Sessions Attended', 'Sessions Absent', 'Attendance Rate']],
      body: students.map(s => {
        const attended = s.present + s.late;
        const absent = totalSessions - attended;
        const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
        return [
          s.matricule,
          s.name,
          attended,
          absent,
          `${rate}%`,
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 4: { halign: 'center' } },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          const rate = parseInt(data.cell.raw);
          data.cell.styles.textColor = rate >= 75 ? [22, 163, 74] : [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 14, right: 14 },
    });

    // --- Footer on every page ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `EduTrack  ·  Page ${i} of ${pageCount}  ·  ${courseInfo.course_code} Final Report`,
        105, doc.internal.pageSize.height - 8,
        { align: 'center' }
      );
    }

    doc.save(`final_report_${courseInfo.course_code}.pdf`);
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
    doc.text(`Lecturer: ${user?.name || 'N/A'}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

    let y = 50;
    for (const session of sessions) {
      if (y > 240) { doc.addPage(); y = 16; }
      const present = session.rows.filter(r => r.status === 'PRESENT').length;
      const absent = session.rows.filter(r => r.status !== 'PRESENT').length;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(
        `${session.day_of_week} ${session.date} · ${session.start_time}–${session.end_time}${session.location ? ' · ' + session.location : ''}`,
        14, y
      );
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Present: ${present}  Absent: ${absent}`, 14, y + 5);
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

  if (!isAuthenticated || userType !== 'lecturer') {
    return <div className="flex items-center justify-center h-screen"><p>Redirecting...</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <h1 className="text-xl font-semibold">My Reports</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome, <span className="font-medium">{user?.name}</span></span>
          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Your Course</CardTitle>
            <CardDescription>View and edit session-by-session attendance for courses you teach</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCourse} onValueChange={loadReport}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0
                  ? <SelectItem value="none" disabled>No courses assigned</SelectItem>
                  : courses.map(c => (
                    <SelectItem key={c.course_code} value={c.course_code}>
                      {c.course_code} — {c.course_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {sessions.length > 0 && (
              <>
                <Button onClick={exportPDF} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Session Details
                </Button>
                <Button onClick={generateFinalReport} className="flex items-center gap-2">
                  <FileBarChart2 className="h-4 w-4" /> Final Report
                </Button>
              </>
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

        {!loading && sessions.map(session => {
          const present = session.rows.filter(r => r.status === 'PRESENT').length;
          const absent = session.rows.filter(r => r.status !== 'PRESENT').length;
          return (
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
                      <CheckCircle2 className="h-4 w-4" /> {present} Present
                    </span>
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <XCircle className="h-4 w-4" /> {absent} Absent
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
                      <TableHead className="text-center w-20">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.rows.map(row => {
                      const rowKey = `${session.key}__${row.matricule}`;
                      const isEditing = editingKey === rowKey;
                      return (
                        <TableRow key={row.matricule}>
                          <TableCell className="font-mono text-xs">{row.matricule}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell className="text-center">
                            {isEditing ? (
                              <Select
                                value={editingStatus}
                                onValueChange={v => setEditingStatus(v as 'PRESENT' | 'ABSENT' | 'LATE')}
                              >
                                <SelectTrigger className="h-7 w-28 text-xs mx-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PRESENT">PRESENT</SelectItem>
                                  <SelectItem value="ABSENT">ABSENT</SelectItem>
                                  <SelectItem value="LATE">LATE</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={row.status === 'PRESENT' ? 'default' : row.status === 'LATE' ? 'secondary' : 'destructive'}>
                                {row.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-green-600 hover:text-green-700"
                                  disabled={saving}
                                  onClick={() => saveEdit(session.key, row)}
                                >
                                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-500 hover:text-red-600"
                                  onClick={cancelEdit}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-gray-400 hover:text-blue-600"
                                onClick={() => startEdit(session.key, row)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
