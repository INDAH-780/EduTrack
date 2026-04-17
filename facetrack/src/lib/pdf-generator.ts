import { format } from "date-fns"

// Mock data for the student attendance report
const mockStudentData = [
  {
    name: "Alex Johnson",
    id: "STU1001",
    course: "CS401: Advanced Algorithms",
    department: "Computer Science",
    checkIn: "09:45 AM",
    status: "Present",
  },
  {
    name: "Sarah Williams",
    id: "STU1042",
    course: "PHY302: Quantum Mechanics",
    department: "Physics",
    checkIn: "10:15 AM",
    status: "Present",
  },
  {
    name: "Michael Brown",
    id: "STU1023",
    course: "MATH401: Advanced Calculus",
    department: "Mathematics",
    checkIn: "09:12 AM",
    status: "Late",
  },
  {
    name: "Emily Davis",
    id: "STU1067",
    course: "BIO201: Cell Biology",
    department: "Biology",
    checkIn: "08:55 AM",
    status: "Present",
  },
  {
    name: "David Wilson",
    id: "STU1089",
    course: "ENG205: Literature Analysis",
    department: "English",
    checkIn: "N/A",
    status: "Absent",
  },
]

// Mock data for the lecturer attendance report
const mockLecturerData = [
  {
    name: "Dr. David Wilson",
    id: "LEC001",
    course: "CS401: Advanced Algorithms",
    department: "Computer Science",
    checkIn: "09:15 AM",
    status: "Present",
  },
  {
    name: "Prof. Jennifer Garcia",
    id: "LEC042",
    course: "PHY302: Quantum Mechanics",
    department: "Physics",
    checkIn: "09:45 AM",
    status: "Present",
  },
  {
    name: "Dr. Michael Brown",
    id: "LEC023",
    course: "MATH401: Advanced Calculus",
    department: "Mathematics",
    checkIn: "08:50 AM",
    status: "Present",
  },
  {
    name: "Prof. Emily Davis",
    id: "LEC067",
    course: "BIO201: Cell Biology",
    department: "Biology",
    checkIn: "N/A",
    status: "Absent",
  },
]

// Mock statistics for the student report
const mockStudentStatistics = {
  totalStudents: 5842,
  present: 4985,
  absent: 587,
  late: 270,
  attendanceRate: "85.3%",
}

// Mock statistics for the lecturer report
const mockLecturerStatistics = {
  totalLecturers: 248,
  present: 225,
  absent: 15,
  late: 8,
  attendanceRate: "90.7%",
}

export const generateAttendanceReport = async (date: Date, type = "students") => {
  // Dynamically import jspdf and jspdf-autotable to reduce bundle size
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  // Create a new PDF document
  const doc = new jsPDF()
  const formattedDate = format(date, "MMMM d, yyyy")

  // Add title and date
  doc.setFontSize(20)
  doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Attendance Report`, 105, 15, { align: "center" })

  doc.setFontSize(12)
  doc.text(`Date: ${formattedDate}`, 105, 25, { align: "center" })

  // Add university logo (placeholder)
  doc.setFontSize(16)
  doc.text("EduTrack", 20, 20)

  // Add summary statistics
  doc.setFontSize(14)
  doc.text("Attendance Summary", 14, 40)

  doc.setFontSize(10)

  // Choose the appropriate data based on report type
  const statistics = type === "students" ? mockStudentStatistics : mockLecturerStatistics
  const data = type === "students" ? mockStudentData : mockLecturerData

  const summaryData = [
    [`Total ${type}`, statistics.totalStudents || statistics.totalLecturers],
    ["Present", statistics.present],
    ["Absent", statistics.absent],
    ["Late", statistics.late],
    ["Attendance Rate", statistics.attendanceRate],
  ]

  autoTable(doc, {
    startY: 45,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
    },
    margin: { left: 14, right: 14 },
  })

  // Add attendance details table
  doc.setFontSize(14)
  doc.text("Attendance Details", 14, doc.lastAutoTable.finalY + 15)

  const tableData = data.map((item) => [item.name, item.id, item.course, item.department, item.checkIn, item.status])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Name", "ID", "Course", "Department", "Check In", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
    margin: { left: 14, right: 14 },
  })

  // Add department breakdown
  doc.setFontSize(14)
  doc.text("Department Breakdown", 14, doc.lastAutoTable.finalY + 15)

  const departmentData = [
    ["Computer Science", "1245", "1120", "85", "40", "90%"],
    ["Physics", "850", "765", "65", "20", "90%"],
    ["Mathematics", "720", "648", "54", "18", "90%"],
    ["Biology", "980", "833", "98", "49", "85%"],
    ["English", "650", "553", "78", "19", "85%"],
  ]

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Department", "Total", "Present", "Absent", "Late", "Rate"]],
    body: departmentData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
    margin: { left: 14, right: 14 },
  })

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")} | Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    )
  }

  // Save the PDF with a filename
  doc.save(`${type.charAt(0).toUpperCase() + type.slice(1)}_Attendance_Report_${format(date, "yyyy-MM-dd")}.pdf`)
}
