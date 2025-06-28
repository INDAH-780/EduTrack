'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { Schedule, AddSchedulePayload } from '@/types/schedule';
// import { Course } from '@/types/course';
import { fetchSchedules, addSchedule, fetchCourses } from '@/lib/api';
import { Timetable } from '@/components/schedules/timetable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { AddScheduleForm } from '@/components/schedules/add-schedule-form';
import { useToast } from '@/components/ui/use-toast';
import { Schedule } from '@/types/schedules';
import { Course } from '@/types/courses';

interface ScheduleError {
  message: string;
  details?: string;
  isAuthError?: boolean;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ScheduleError | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [schedulesData, coursesData] = await Promise.all([
        fetchSchedules(),
        fetchCourses()
      ]);
      
      setSchedules(schedulesData);
      setCourses(coursesData);
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

  if (loading && schedules.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Timetable Management</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
        <div className="rounded-md border h-96 animate-pulse bg-gray-100"></div>
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
            {error.isAuthError ? 'Authentication Error' : 'Error Loading Schedules'}
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
        <h2 className="text-2xl font-bold">Timetable Management</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
            </DialogHeader>
            <AddScheduleForm 
              courses={courses}
              onSuccess={() => {
                loadData();
                setOpenDialog(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Timetable schedules={schedules} />
    </div>
  );
}