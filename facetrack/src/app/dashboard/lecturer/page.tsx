// 'use client';

// import { useAuth } from "@/context/authContext";
// import { BookOpen, Users, Clock, CheckCircle, Camera, AlertCircle } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { LogOut } from "lucide-react";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { FacialRecognitionStatus } from "@/components/lecturer/facial-recognition-status";
// import { LecturerCoursesTable } from "@/components/lecturer/lecturer-courses-table";
// import { LecturerAttendanceChart } from "@/components/lecturer/lecturer-attendance-chart";
// import { RecentAttendanceSessions } from "@/components/lecturer/recent-attendance-session";


// export default function LecturerDashboard() {
//   const { user, userType, logout, isAuthenticated } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/login");
//     } else if (userType !== "lecturer") {
//       logout();
//       router.push("/login");
//     }
//   }, [isAuthenticated, userType, router, logout]);

//   if (!isAuthenticated || userType !== "lecturer") {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p>Redirecting to login...</p>
//       </div>
//     );
//   }
//   const lecturerId = user?.lecturer_id || '';

//   // Mock data - replace with API calls
//   const lecturerStats = {
//     courses: 4,
//     totalStudents: 142,
//     attendanceRate: 87.5,
//     pendingAttendance: 2,
//     recognitionAccuracy: 96.2
//   };

//   return (
//     <div className="flex min-h-screen w-full flex-col bg-gray-50">
//       {/* Header */}
//       <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm">
//         <h1 className="text-xl font-semibold">Lecturer Portal</h1>
//         <div className="flex items-center gap-4">
//           <span className="text-sm text-gray-600">
//             Welcome, <span className="font-medium">{user?.name || 'Lecturer'}</span>
//           </span>
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             onClick={logout}
//             className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
//           >
//             <LogOut className="h-4 w-4" />
//             Sign Out
//           </Button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 p-6 space-y-6">
//         {/* Quick Stats */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//           <StatCard 
//             title="Your Courses" 
//             value={lecturerStats.courses.toString()} 
//             icon={<BookOpen className="h-5 w-5 text-blue-500" />}
//             description="Current semester"
//           />
//           <StatCard 
//             title="Total Students" 
//             value={lecturerStats.totalStudents.toString()} 
//             icon={<Users className="h-5 w-5 text-green-500" />}
//             description="Across all courses"
//           />
//           <StatCard 
//             title="Attendance Rate" 
//             value={`${lecturerStats.attendanceRate}%`} 
//             icon={<CheckCircle className="h-5 w-5 text-purple-500" />}
//             description="Last 30 days"
//             valueClassName={lecturerStats.attendanceRate > 85 ? "text-green-600" : "text-yellow-600"}
//           />
//           <StatCard 
//             title="Pending Attendance" 
//             value={lecturerStats.pendingAttendance.toString()} 
//             icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
//             description="Requires your action"
//             valueClassName="text-orange-600"
//           />
//         </div>

//         {/* Facial Recognition Status */}
//         <FacialRecognitionStatus accuracy={lecturerStats.recognitionAccuracy} />

//         {/* Two Column Layout */}
//         <div className="grid gap-6 lg:grid-cols-3">
//           {/* Left Column - Courses and Attendance */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Courses Table */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <BookOpen className="h-5 w-5 text-blue-500" />
//                   Your Courses
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <LecturerCoursesTable lecturerId={lecturerId}/>
//               </CardContent>
//             </Card>

//             {/* Attendance Analytics */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CheckCircle className="h-5 w-5 text-purple-500" />
//                   Attendance Analytics
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <LecturerAttendanceChart />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Quick Actions and Recent Sessions */}
//           <div className="space-y-6">
//             {/* Quick Actions */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-orange-500" />
//                   Quick Actions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Button className="w-full" variant="default">
//                   <Camera className="mr-2 h-4 w-4" />
//                   Take Attendance Now
//                 </Button>
//                 <Button className="w-full" variant="outline">
//                   View Today's Schedule
//                 </Button>
//                 <Button className="w-full" variant="outline">
//                   Generate Attendance Report
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Recent Attendance Sessions */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CheckCircle className="h-5 w-5 text-green-500" />
//                   Recent Sessions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <RecentAttendanceSessions />
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// function StatCard({
//   title,
//   value,
//   description,
//   icon,
//   valueClassName = ""
// }: {
//   title: string;
//   value: string;
//   description: string;
//   icon: React.ReactNode;
//   valueClassName?: string;
// }) {
//   return (
//     <Card className="shadow-sm">
//       <CardHeader className="flex flex-row items-center justify-between pb-3">
//         <h3 className="text-sm font-medium text-gray-500">{title}</h3>
//         {icon}
//       </CardHeader>
//       <CardContent>
//         <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
//         <p className="text-xs text-gray-500 mt-1">{description}</p>
//       </CardContent>
//     </Card>
//   );
// }




'use client';

import { useAuth } from "@/context/authContext";
import { BookOpen, Users, Clock, CheckCircle, Camera, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FacialRecognitionStatus } from "@/components/lecturer/facial-recognition-status";
import { LecturerCoursesTable } from "@/components/lecturer/lecturer-courses-table";
import { LecturerAttendanceChart } from "@/components/lecturer/lecturer-attendance-chart";
import { RecentAttendanceSessions } from "@/components/lecturer/recent-attendance-session";
import { fetchCourses } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function LecturerDashboard() {
  const { user, userType, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    courses: 0,
    totalStudents: 0,
    attendanceRate: 0,
    pendingAttendance: 0,
    recognitionAccuracy: 0,
    loading: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (userType !== "lecturer") {
      logout();
      router.push("/login");
    }
  }, [isAuthenticated, userType, router, logout]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const courses = await fetchCourses();
        const lecturerCourses = courses.filter(course => course.lecturer_id === user?.lecturer_id);
        
        const totalStudents = lecturerCourses.reduce(
          (sum, course) => sum + course.total_enrolled_students, 0
        );
        
        // Calculate attendance rate (you'll need to implement this based on your API)
        const attendanceRate = lecturerCourses.length > 0 ? 
          lecturerCourses.reduce((sum, course) => sum + (course.attendance_rate || 0), 0) / lecturerCourses.length :
          0;

        setStats({
          courses: lecturerCourses.length,
          totalStudents,
          attendanceRate,
          pendingAttendance: lecturerCourses.filter(c => c.pending_attendance).length,
          recognitionAccuracy: 96.2, // You'll need to fetch this from your API
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (isAuthenticated && userType === "lecturer") {
      fetchStats();
    }
  }, [isAuthenticated, userType, user?.lecturer_id]);

  if (!isAuthenticated || userType !== "lecturer") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const lecturerId = user?.lecturer_id || '';

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm">
        <h1 className="text-xl font-semibold">Lecturer Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-medium">{user?.name || 'Lecturer'}</span>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Quick Stats */}
        {stats.loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Your Courses" 
              value={stats.courses.toString()} 
              icon={<BookOpen className="h-5 w-5 text-blue-500" />}
              description="Current semester"
            />
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents.toString()} 
              icon={<Users className="h-5 w-5 text-green-500" />}
              description="Across all courses"
            />
            <StatCard 
              title="Attendance Rate" 
              value={`${stats.attendanceRate.toFixed(1)}%`} 
              icon={<CheckCircle className="h-5 w-5 text-purple-500" />}
              description="Last 30 days"
              valueClassName={stats.attendanceRate > 85 ? "text-green-600" : "text-yellow-600"}
            />
            <StatCard 
              title="Pending Attendance" 
              value={stats.pendingAttendance.toString()} 
              icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
              description="Requires your action"
              valueClassName="text-orange-600"
            />
          </div>
        )}

        {/* Facial Recognition Status */}
        <FacialRecognitionStatus accuracy={stats.recognitionAccuracy} />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Courses and Attendance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Your Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LecturerCoursesTable lecturerId={lecturerId} />
              </CardContent>
            </Card>

            {/* Attendance Analytics */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  Attendance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LecturerAttendanceChart  />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions and Recent Sessions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Attendance Now
                </Button>
                <Button className="w-full" variant="outline">
                  View Today's Schedule
                </Button>
                <Button className="w-full" variant="outline">
                  Generate Attendance Report
                </Button>
              </CardContent>
            </Card>

            {/* Recent Attendance Sessions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentAttendanceSessions />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  valueClassName = ""
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
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