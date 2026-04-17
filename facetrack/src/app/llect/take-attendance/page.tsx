"use client"

import { useState, useEffect, useCallback } from "react"
import { BookOpen, Calendar, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FacialRecognitionCamera } from "@/components/facial-recognition-camera"

interface Course {
  id: string
  code: string
  name: string
  lecturer: string
  schedule: string
  location: string
  students: Student[]
}

interface Student {
  id: string
  name: string
  enrollmentId: string
  status: "present" | "absent" | "pending"
  recognizedAt?: string
}

export default function LecturerTakeAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [attendanceStarted, setAttendanceStarted] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCourseData, setSelectedCourseData] = useState<Course | undefined>(undefined)

  const handleStudentRecognized = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, status: "present" as const, recognizedAt: new Date().toISOString() }
          : student,
      ),
    )
  }, [])

  const handleAttendanceComplete = useCallback(() => {
    setAttendanceStarted(false)
    console.log("Attendance completed for course:", selectedCourseData?.code)
    console.log("Final attendance:", students)
  }, [selectedCourseData?.code, students])

  // Mock lecturer's courses
  const lecturerCourses: Course[] = [
    {
      id: "1",
      code: "CS401",
      name: "Advanced Algorithms",
      lecturer: "Dr. David Wilson",
      schedule: "Monday, Wednesday 10:00 AM - 11:30 AM",
      location: "Science Building, Room 302",
      students: [
        { id: "1", name: "Alex Johnson", enrollmentId: "STU1001", status: "pending" },
        { id: "2", name: "Sarah Williams", enrollmentId: "STU1042", status: "pending" },
        { id: "3", name: "Michael Brown", enrollmentId: "STU1023", status: "pending" },
        { id: "4", name: "Emily Davis", enrollmentId: "STU1067", status: "pending" },
        { id: "5", name: "David Wilson", enrollmentId: "STU1089", status: "pending" },
        { id: "6", name: "Jessica Taylor", enrollmentId: "STU1102", status: "pending" },
        { id: "7", name: "Robert Martinez", enrollmentId: "STU1054", status: "pending" },
        { id: "8", name: "Jennifer Garcia", enrollmentId: "STU1076", status: "pending" },
      ],
    },
    {
      id: "2",
      code: "CS305",
      name: "Database Systems",
      lecturer: "Dr. David Wilson",
      schedule: "Tuesday, Thursday 2:00 PM - 3:30 PM",
      location: "Computer Lab 1",
      students: [
        { id: "9", name: "John Smith", enrollmentId: "STU2001", status: "pending" },
        { id: "10", name: "Lisa Anderson", enrollmentId: "STU2002", status: "pending" },
        { id: "11", name: "Mark Thompson", enrollmentId: "STU2003", status: "pending" },
        { id: "12", name: "Anna Wilson", enrollmentId: "STU2004", status: "pending" },
      ],
    },
    {
      id: "3",
      code: "CS350",
      name: "Software Engineering",
      lecturer: "Dr. David Wilson",
      schedule: "Friday 9:00 AM - 12:00 PM",
      location: "Science Building, Room 205",
      students: [
        { id: "13", name: "Tom Brown", enrollmentId: "STU3001", status: "pending" },
        { id: "14", name: "Emma Davis", enrollmentId: "STU3002", status: "pending" },
        { id: "15", name: "James Wilson", enrollmentId: "STU3003", status: "pending" },
      ],
    },
  ]

  useEffect(() => {
    const course = lecturerCourses.find((c) => c.id === selectedCourse)
    setSelectedCourseData(course)
  }, [selectedCourse])

  useEffect(() => {
    if (selectedCourseData) {
      setStudents(selectedCourseData.students)
    }
  }, [selectedCourseData])

  const startAttendance = () => {
    setAttendanceStarted(true)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-6">
        <h1 className="text-xl font-semibold text-gray-900">Take Attendance</h1>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        {!attendanceStarted ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <Card className="glass-effect shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">Select Course for Attendance</CardTitle>
                <CardDescription>Choose one of your assigned courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">My Courses</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturerCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium">
                                {course.name} ({course.code})
                              </p>
                              <p className="text-sm text-gray-500">{course.students.length} students</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCourseData && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900">Course Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Lecturer: {selectedCourseData.lecturer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Schedule: {selectedCourseData.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Location: {selectedCourseData.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Students: {selectedCourseData.students.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={startAttendance}
                  disabled={!selectedCourse}
                  className="w-full h-12 academic-gradient text-lg font-medium"
                >
                  Start Facial Recognition Attendance
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          selectedCourseData && (
            <FacialRecognitionCamera
              courseCode={selectedCourseData.code}
              courseName={selectedCourseData.name}
              students={students}
              onStudentRecognized={handleStudentRecognized}
              onAttendanceComplete={handleAttendanceComplete}
            />
          )
        )}
      </main>
    </div>
  )
}
