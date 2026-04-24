'use client'; // Must be client component for interactivity

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Cog,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  School,
  User,
  Camera,
  Users,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userType, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAuthenticated) return null;

  const adminNavItems = [
    { title: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Students", href: "/students", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Lecturers", href: "/lecturers", icon: <User className="h-5 w-5" /> },
    { title: "Courses", href: "/courses", icon: <BookOpen className="h-5 w-5" /> },
    { title: "Timetable", href: "/schedules", icon: <Calendar className="h-5 w-5" /> },
    { title: "Reports", href: "/admin/reports", icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Settings", href: "/admin/settings", icon: <Cog className="h-5 w-5" /> },
  ];

  const lecturerNavItems = [
    { title: "Dashboard", href: "/dashboard/lecturer", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "My Courses", href: "/myCourses", icon: <BookOpen className="h-5 w-5" /> },
    { title: "Take Attendance", href: "/take-attendance", icon: <Camera className="h-5 w-5" /> },
    { title: "Attendance Records", href: "/lecturer/attendance", icon: <Calendar className="h-5 w-5" /> },
    { title: "My Reports", href: "/lecturer/reports", icon: <FileText className="h-5 w-5" /> },
    { title: "Timetable", href: "/schedules", icon: <Users className="h-5 w-5" /> },
    { title: "Settings", href: "/lecturer/settings", icon: <Cog className="h-5 w-5" /> },
  ];

  const navItems = userType === "admin" ? adminNavItems : lecturerNavItems;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 backdrop-blur-sm shadow-lg flex flex-col z-50">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <School className="h-6 w-6" />
          <span>EduTrack</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-sm font-medium">
            {userType === "admin" ? "AD" : "LC"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
              {userType === "admin" ? "Administrator" : "Lecturer"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "user@edutrack.com"}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                pathname.startsWith(item.href)
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300"
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}