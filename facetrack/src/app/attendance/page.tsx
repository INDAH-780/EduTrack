"use client"

import { useState } from "react"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { StudentAttendanceTable } from "@/components/student-attendance-table"
import { LecturerAttendanceTable } from "@/components/lecturer-attendance-table"
import { CourseAttendanceTable } from "@/components/course-attendance-table"
import { generateAttendanceReport } from "@/lib/pdf-generator"

export default function AttendancePage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [attendanceType, setAttendanceType] = useState("students")
  const [department, setDepartment] = useState("all")

  const handleGenerateReport = () => {
    const selectedDate = date?.from || new Date()
    generateAttendanceReport(selectedDate, attendanceType)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Attendance Records</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      "Filter by date"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>

            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="eng">Engineering</SelectItem>
                <SelectItem value="bio">Biology</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="phys">Physics</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>More Filters</span>
            </Button>
          </div>
          <Button size="sm" className="h-8 gap-1" onClick={handleGenerateReport}>
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF Report</span>
          </Button>
        </div>

        <Tabs value={attendanceType} onValueChange={setAttendanceType} className="w-full">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>
                  Attendance records for {date?.from ? format(date.from, "MMMM d, yyyy") : "today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentAttendanceTable department={department} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="lecturers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lecturer Attendance</CardTitle>
                <CardDescription>
                  Attendance records for {date?.from ? format(date.from, "MMMM d, yyyy") : "today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LecturerAttendanceTable department={department} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Attendance</CardTitle>
                <CardDescription>
                  Attendance records for {date?.from ? format(date.from, "MMMM d, yyyy") : "today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseAttendanceTable department={department} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
