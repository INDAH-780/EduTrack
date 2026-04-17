'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { Course, AddCoursePayload } from '@/types/course';
import { fetchCourses, addCourse, fetchLecturers } from '@/lib/api';
// import { DataTable } from '@/components/courses/data-table';
// import { columns } from '@/components/courses/columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { AddCourseForm } from '@/components/courses/add-course-form';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/courses/data-table';
import { Course } from '@/types/courses';
import { columns } from '@/components/courses/columns';

interface CourseError {
  message: string;
  details?: string;
  isAuthError?: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CourseError | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const levels = ['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Level 500'];
  const semesters = ['First Semester', 'Second Semester'];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [coursesData, lecturersData] = await Promise.all([
        fetchCourses(),
        fetchLecturers()
      ]);
      
      setCourses(coursesData);
      setLecturers(lecturersData.map(l => l.name));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      const isAuthError = errorMessage.includes('Authentication') || 
                         errorMessage.includes('Unauthorized');
      
      setError({
        message: errorMessage,
        isAuthError,
        details: isAuthError ? 'Please login again to continue' : undefined
      });

      if (isAuthError) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departments = [...new Set(courses.map(course => course.department))];
  const totalCourses = courses.length;

  // Calculate courses per department
  const coursesPerDept = courses.reduce((acc, course) => {
    acc[course.department] = (acc[course.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate courses per level
  const coursesPerLevel = courses.reduce((acc, course) => {
    acc[course.level] = (acc[course.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading && courses.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Courses Dashboard</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="rounded-md border h-64 animate-pulse bg-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className={`rounded-md p-4 ${
          error.isAuthError ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        } border`}>
          <h3 className={`text-sm font-medium ${
            error.isAuthError ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {error.isAuthError ? 'Authentication Error' : 'Error Loading Courses'}
          </h3>
          <p className={`mt-2 text-sm ${
            error.isAuthError ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {error.message}
          </p>
          {error.details && (
            <p className={`mt-1 text-sm ${
              error.isAuthError ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {error.details}
            </p>
          )}
          <div className="mt-4">
            <button
              onClick={loadData}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
                error.isAuthError 
                  ? 'text-red-700 border-red-300 hover:bg-red-100' 
                  : 'text-yellow-700 border-yellow-300 hover:bg-yellow-100'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Courses Dashboard</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <AddCourseForm 
              departments={departments} 
              lecturers={lecturers}
              levels={levels}
              semesters={semesters}
              onSuccess={() => {
                loadData();
                setOpenDialog(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>

        {Object.entries(coursesPerDept).slice(0, 2).map(([dept, count]) => (
          <Card key={dept}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{dept}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">Courses</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Courses by Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {levels.map(level => (
                <div key={level} className="flex items-center justify-between">
                  <span>{level}</span>
                  <span className="font-medium">{coursesPerLevel[level] || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.map(dept => (
                <div key={dept} className="flex items-center justify-between">
                  <span>{dept}</span>
                  <span className="font-medium">{coursesPerDept[dept] || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={courses} />
      </div>
    </div>
  );
}