'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchLecturers, addLecturer } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
// import { AddLecturerForm } from '@/components/lecturers/add-lecturer-form';
import { useToast } from '@/components/ui/use-toast';
import { AddLecturerForm } from '@/components/lecturer/add-lecturer-form';

import { Lecturer } from '@/types/lecturers';
import { columns } from '@/components/lecturer/columns';
import { DataTable } from '@/components/lecturer/data-table';


interface LecturerError {
  message: string;
  details?: string;
  isAuthError?: boolean;
}

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LecturerError | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLecturers();
      setLecturers(data);
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
        // router.push('/login');
        console.log("auth token not found")
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departments = [...new Set(lecturers.map(lecturer => lecturer.department))];

  if (loading && lecturers.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Lecturer Dashboard</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Lecturer
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
            {error.isAuthError ? 'Authentication Error' : 'Error Loading Lecturers'}
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
        <h2 className="text-2xl font-bold">Lecturer Dashboard</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lecturer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lecturer</DialogTitle>
            </DialogHeader>
            <AddLecturerForm 
              departments={departments} 
              onSuccess={() => {
                loadData();
                setOpenDialog(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Total Lecturers</h3>
          <p className="text-2xl font-bold">{lecturers.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Departments</h3>
          <p className="text-2xl font-bold">{departments.length}</p>
        </div>
        {departments.slice(0, 2).map(dept => (
          <div key={dept} className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">{dept}</h3>
            <p className="text-2xl font-bold">
              {lecturers.filter(l => l.department === dept).length}
            </p>
            <p className="text-xs text-muted-foreground">Lecturers</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={lecturers} />
      </div>
    </div>
  );
}