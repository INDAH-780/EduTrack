'use client';

import { useAuth } from "@/context/authContext";
import { BookOpen, Search, Filter, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LecturerCoursesTable } from "@/components/lecturer/lecturer-courses-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MyCoursesPage() {
  const { user, userType, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (userType !== "lecturer") {
      logout();
      router.push("/login");
    }
  }, [isAuthenticated, userType, router, logout]);

  if (!isAuthenticated || userType !== "lecturer") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Get lecturer ID from user object
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
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">My Courses</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Filter status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
      </main>
    </div>
  );
}


// 'use client';

// import { useAuth } from "@/context/authContext";
// import { BookOpen, Search, Filter, LogOut } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { LecturerCoursesTable } from "@/components/lecturer/lecturer-courses-table";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export default function MyCoursesPage() {
//   const { user, userType, logout, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

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

//   return (
//     <div className="flex min-h-screen w-full flex-col bg-gray-50">
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

//       <main className="flex-1 p-6 space-y-6">
//         <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//           <div className="flex items-center gap-3">
//             <BookOpen className="h-6 w-6 text-blue-600" />
//             <h2 className="text-xl font-semibold">My Courses</h2>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search courses..."
//                 className="pl-10"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-full sm:w-40">
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-gray-400" />
//                   <SelectValue placeholder="Filter status" />
//                 </div>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 <SelectItem value="active">Active</SelectItem>
//                 <SelectItem value="completed">Completed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BookOpen className="h-5 w-5 text-blue-500" />
//               Your Courses
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <LecturerCoursesTable lecturerId={lecturerId} />
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   );
// }