"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Clock,
  User,
  Loader2,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { fetchCourses, fetchSchedules } from "@/lib/api";
import { Course } from "@/types/courses";
import { useRouter } from "next/navigation";

interface Schedule {
  course_code: string;
  course_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  schedule_id: number;
}

interface LecturerCoursesTableProps {
  lecturerId: string;
}

export function LecturerCoursesTable({
  lecturerId,
}: LecturerCoursesTableProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allCourses, allSchedules] = await Promise.all([
          fetchCourses(),
          fetchSchedules(),
        ]);

        // Filter courses for this lecturer
        const lecturerCourses = allCourses.filter(
          (course) => course.lecturer_id === lecturerId
        );

        setCourses(lecturerCourses);
        setFilteredCourses(lecturerCourses);
        setSchedules(allSchedules);
      } catch (err) {
        setError("Failed to load data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      loadData();
    }
  }, [lecturerId]);

  useEffect(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && course.total_enrolled_students > 0) ||
        (statusFilter === "inactive" && course.total_enrolled_students === 0);

      return matchesSearch && matchesStatus;
    });
    setFilteredCourses(filtered);
  }, [searchTerm, statusFilter, courses]);

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  // Get schedules for the selected course
  const getCourseSchedules = (courseCode: string) => {
    return schedules.filter((schedule) => schedule.course_code === courseCode);
  };

  // Format time range
  const formatTimeRange = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search courses..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Courses</option>
          <option value="active">With Students</option>
          <option value="inactive">No Students</option>
        </select>
      </div>

      {/* Courses Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <TableRow key={course.course_code}>
                  <TableCell className="font-medium">
                    {course.course_code}
                  </TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{course.total_enrolled_students}</span>
                    </div>
                  </TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCourse(course)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  {courses.length === 0
                    ? "No courses assigned"
                    : "No courses match your search"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Course Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedCourse.course_code} - {selectedCourse.course_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-white shadow-sm">
                    <div className="p-4 border-b flex flex-row items-center justify-between pb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Department
                      </span>
                      <BookOpen className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="p-4">
                      <div className="text-lg font-medium">
                        {selectedCourse.department}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white shadow-sm">
                    <div className="p-4 border-b flex flex-row items-center justify-between pb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Enrolled Students
                      </span>
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="p-4">
                      <div className="text-lg font-medium">
                        {selectedCourse.total_enrolled_students}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white shadow-sm">
                    <div className="p-4 border-b flex flex-row items-center justify-between pb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Level & Semester
                      </span>
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="p-4">
                      <div className="text-lg font-medium">
                        {selectedCourse.level} • {selectedCourse.semester}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="rounded-lg border bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Class Schedule
                    </h3>
                  </div>
                  <div className="divide-y">
                    {getCourseSchedules(selectedCourse.course_code).length >
                    0 ? (
                      getCourseSchedules(selectedCourse.course_code).map(
                        (schedule) => (
                          <div key={schedule.schedule_id} className="p-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {schedule.day_of_week}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                  {formatTimeRange(
                                    schedule.start_time,
                                    schedule.end_time
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{schedule.location}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/take-attendance/${selectedCourse.course_code}?` +
                                      `schedule_id=${schedule.schedule_id}&` +
                                      `day=${schedule.day_of_week}&` +
                                      `start_time=${schedule.start_time}&` +
                                      `end_time=${schedule.end_time}&` +
                                      `location=${encodeURIComponent(
                                        schedule.location
                                      )}`
                                  )
                                }
                              >
                                Take Attendance
                              </Button>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No schedule found for this course
                      </div>
                    )}
                  </div>
                </div>

                {/* Lecturer Info Section */}
                <div className="rounded-lg border bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium">
                      Lecturer Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 rounded-full p-3">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedCourse.lecturer_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {selectedCourse.lecturer_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   BookOpen,
//   Users,
//   Clock,
//   User,
//   Loader2,
//   Calendar,
//   MapPin,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useState, useEffect } from "react";
// import { fetchCourses, fetchSchedules } from "@/lib/api";
// import { Course } from "@/types/courses";
// import { useRouter } from "next/navigation";

// interface Schedule {
//   course_code: string;
//   course_name: string;
//   day_of_week: string;
//   start_time: string;
//   end_time: string;
//   location: string;
//   schedule_id: number;
// }

// interface LecturerCoursesTableProps {
//   lecturerId: string;
// }

// export function LecturerCoursesTable({ lecturerId }: LecturerCoursesTableProps) {
//   const router = useRouter();
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [schedules, setSchedules] = useState<Schedule[]>([]);
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         const [allCourses, allSchedules] = await Promise.all([
//           fetchCourses(),
//           fetchSchedules(),
//         ]);

//         const lecturerCourses = allCourses.filter(
//           (course) => course.lecturer_id === lecturerId
//         );

//         setCourses(lecturerCourses);
//         setFilteredCourses(lecturerCourses);
//         setSchedules(allSchedules);
//       } catch (err) {
//         setError("Failed to load data");
//         console.error("Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (lecturerId) {
//       loadData();
//     }
//   }, [lecturerId]);

//   useEffect(() => {
//     const filtered = courses.filter((course) => {
//       const matchesSearch =
//         course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         course.course_name.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesStatus =
//         statusFilter === "all" ||
//         (statusFilter === "active" && course.total_enrolled_students > 0) ||
//         (statusFilter === "inactive" && course.total_enrolled_students === 0);

//       return matchesSearch && matchesStatus;
//     });
//     setFilteredCourses(filtered);
//   }, [searchTerm, statusFilter, courses]);

//   const handleViewCourse = (course: Course) => {
//     setSelectedCourse(course);
//     setIsDialogOpen(true);
//   };

//   const getCourseSchedules = (courseCode: string) => {
//     return schedules.filter((schedule) => schedule.course_code === courseCode);
//   };

//   const formatTimeRange = (start: string, end: string) => {
//     return `${start} - ${end}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin" />
//         <span className="sr-only">Loading courses...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-red-500">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="flex flex-col sm:flex-row gap-3 mb-4">
//         <div className="relative flex-1">
//           <input
//             type="text"
//             placeholder="Search courses..."
//             className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//         </div>
//         <select
//           className="border rounded-lg px-3 py-2 text-sm"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="all">All Courses</option>
//           <option value="active">With Students</option>
//           <option value="inactive">No Students</option>
//         </select>
//       </div>

//       <div className="border rounded-lg overflow-hidden">
//         <Table>
//           <TableHeader className="bg-gray-50">
//             <TableRow>
//               <TableHead>Code</TableHead>
//               <TableHead>Course Name</TableHead>
//               <TableHead>Students</TableHead>
//               <TableHead>Level</TableHead>
//               <TableHead>Semester</TableHead>
//               <TableHead className="text-right">Action</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredCourses.length > 0 ? (
//               filteredCourses.map((course) => (
//                 <TableRow key={course.course_code}>
//                   <TableCell className="font-medium">
//                     {course.course_code}
//                   </TableCell>
//                   <TableCell>{course.course_name}</TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-2">
//                       <Users className="h-4 w-4 text-blue-500" />
//                       <span>{course.total_enrolled_students}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>{course.level}</TableCell>
//                   <TableCell>{course.semester}</TableCell>
//                   <TableCell className="text-right">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleViewCourse(course)}
//                     >
//                       View
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center py-8 text-gray-500">
//                   {courses.length === 0
//                     ? "No courses assigned"
//                     : "No courses match your search"}
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           {selectedCourse && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center gap-2">
//                   <BookOpen className="h-5 w-5" />
//                   {selectedCourse.course_code} - {selectedCourse.course_name}
//                 </DialogTitle>
//               </DialogHeader>

//               <div className="space-y-6">
//                 <div className="grid gap-4 md:grid-cols-3">
//                   <div className="rounded-lg border bg-white shadow-sm">
//                     <div className="p-4 border-b flex flex-row items-center justify-between pb-2">
//                       <span className="text-sm font-medium text-gray-500">
//                         Department
//                       </span>
//                       <BookOpen className="h-4 w-4 text-gray-500" />
//                     </div>
//                     <div className="p-4">
//                       <div className="text-lg font-medium">
//                         {selectedCourse.department}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="rounded-lg border bg-white shadow-sm">
//                     <div className="p-4 border-b flex flex-row items-center justify-between pb-2">
//                       <span className="text-sm font-medium text-gray-500">
//                         Enrolled Students
//                       </span>
//                       <Users className="h-4 w-4 text-gray-500" />
//                     </div>
//                     <div className="p-4">
//                       <div className="text-lg font-medium">
//                         {selectedCourse.total_enrolled_students}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="rounded-lg border bg-white shadow-sm">
//                     <div className="p-4 border-b flex flex-row items-center justify-between pb-2">
//                       <span className="text-sm font-medium text-gray-500">
//                         Level & Semester
//                       </span>
//                       <Clock className="h-4 w-4 text-gray-500" />
//                     </div>
//                     <div className="p-4">
//                       <div className="text-lg font-medium">
//                         {selectedCourse.level} • {selectedCourse.semester}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="rounded-lg border bg-white shadow-sm">
//                   <div className="p-4 border-b">
//                     <h3 className="text-sm font-medium flex items-center gap-2">
//                       <Calendar className="h-4 w-4" />
//                       Class Schedule
//                     </h3>
//                   </div>
//                   <div className="divide-y">
//                     {getCourseSchedules(selectedCourse.course_code).length > 0 ? (
//                       getCourseSchedules(selectedCourse.course_code).map(
//                         (schedule) => (
//                           <div key={schedule.schedule_id} className="p-4">
//                             <div className="grid grid-cols-3 gap-4">
//                               <div className="flex items-center gap-2">
//                                 <span className="font-medium">
//                                   {schedule.day_of_week}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Clock className="h-4 w-4 text-gray-500" />
//                                 <span>
//                                   {formatTimeRange(
//                                     schedule.start_time,
//                                     schedule.end_time
//                                   )}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <MapPin className="h-4 w-4 text-gray-500" />
//                                 <span>{schedule.location}</span>
//                               </div>
//                             </div>
//                             <div className="mt-3 flex justify-end">
//                               <Button
//                                 size="sm"
//                                 onClick={() =>
//                                   router.push(
//                                     `/take-attendance/${selectedCourse.course_code}?` +
//                                       `schedule_id=${schedule.schedule_id}&` +
//                                       `day=${schedule.day_of_week}&` +
//                                       `start_time=${schedule.start_time}&` +
//                                       `end_time=${schedule.end_time}&` +
//                                       `location=${encodeURIComponent(
//                                         schedule.location
//                                       )}`
//                                   )
//                                 }
//                               >
//                                 Take Attendance
//                               </Button>
//                             </div>
//                           </div>
//                         )
//                       )
//                     ) : (
//                       <div className="p-4 text-center text-gray-500">
//                         No schedule found for this course
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="rounded-lg border bg-white shadow-sm">
//                   <div className="p-4 border-b">
//                     <h3 className="text-sm font-medium">
//                       Lecturer Information
//                     </h3>
//                   </div>
//                   <div className="p-4">
//                     <div className="flex items-center gap-4">
//                       <div className="bg-gray-100 rounded-full p-3">
//                         <User className="h-5 w-5 text-gray-500" />
//                       </div>
//                       <div>
//                         <p className="font-medium">
//                           {selectedCourse.lecturer_name}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           ID: {selectedCourse.lecturer_id}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
