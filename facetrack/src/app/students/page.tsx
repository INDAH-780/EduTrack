// 'use client';

// import { useEffect, useState } from 'react';
// import { DataTable } from '@/components/students/data-table';
// import { columns } from '@/components/students/columns';
// import { fetchStudents } from '@/lib/api';
// import { useRouter } from 'next/navigation';
// import { Student } from '@/types/student';
// // import { StudentStats } from '@/components/students/stats-cards';
// import { StudentStats } from '@/components/student-card';

// interface StudentError {
//   message: string;
//   details?: string;
//   isValidationError?: boolean;
//   isAuthError?: boolean;
// }

// export default function StudentsPage() {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<StudentError | null>(null);
//   const router = useRouter();

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await fetchStudents();
//       setStudents(data);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
//       const isAuthError = errorMessage.includes('Authentication') || 
//                          errorMessage.includes('Unauthorized') || 
//                          errorMessage.includes('401');

//       setError({
//         message: errorMessage,
//         isAuthError,
//         details: isAuthError ? 'Please login again to continue' : undefined
//       });

//       if (isAuthError) {
//         router.push('/login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   if (loading && students.length === 0) {
//     return (
//       <div className="p-6 space-y-6">
//         <StudentStats students={[]} loading={true} />
//         <div className="rounded-md border h-64 animate-pulse bg-gray-100"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className={`rounded-md p-4 ${
//           error.isValidationError 
//             ? 'bg-yellow-50 border-yellow-200' 
//             : 'bg-red-50 border-red-200'
//         } border`}>
//           <h3 className={`text-sm font-medium ${
//             error.isValidationError ? 'text-yellow-800' : 'text-red-800'
//           }`}>
//             {error.isValidationError ? 'Validation Error' : 'Error Loading Students'}
//           </h3>
//           <p className={`mt-2 text-sm ${
//             error.isValidationError ? 'text-yellow-700' : 'text-red-700'
//           }`}>
//             {error.message}
//           </p>
//           {error.details && (
//             <p className={`mt-1 text-sm ${
//               error.isValidationError ? 'text-yellow-600' : 'text-red-600'
//             }`}>
//               {error.details}
//             </p>
//           )}
//           <div className="mt-4">
//             <button
//               onClick={loadData}
//               className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
//                 error.isValidationError 
//                   ? 'text-yellow-700 border-yellow-300 hover:bg-yellow-100' 
//                   : 'text-red-700 border-red-300 hover:bg-red-100'
//               }`}
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <StudentStats students={students} loading={loading} onRefresh={loadData} />
      
//       <div className="rounded-md border">
//         <DataTable columns={columns} data={students} />
//       </div>
//     </div>
//   );
// }



'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/students/data-table';
import { columns } from '@/components/students/columns';
import { fetchStudents } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Student } from '@/types/student';
import { StudentStats } from '@/components/student-card';
import { EnrollmentModal } from '@/components/enrollment-modal';

interface StudentError {
  message: string;
  details?: string;
  isValidationError?: boolean;
  isAuthError?: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StudentError | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      const isAuthError = errorMessage.includes('Authentication') || 
                         errorMessage.includes('Unauthorized') || 
                         errorMessage.includes('401');

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

  if (loading && students.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <StudentStats students={[]} loading={true} />
        <div className="rounded-md border h-64 animate-pulse bg-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className={`rounded-md p-4 ${
          error.isValidationError 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-red-50 border-red-200'
        } border`}>
          <h3 className={`text-sm font-medium ${
            error.isValidationError ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {error.isValidationError ? 'Validation Error' : 'Error Loading Students'}
          </h3>
          <p className={`mt-2 text-sm ${
            error.isValidationError ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {error.message}
          </p>
          {error.details && (
            <p className={`mt-1 text-sm ${
              error.isValidationError ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {error.details}
            </p>
          )}
          <div className="mt-4">
            <button
              onClick={loadData}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
                error.isValidationError 
                  ? 'text-yellow-700 border-yellow-300 hover:bg-yellow-100' 
                  : 'text-red-700 border-red-300 hover:bg-red-100'
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
        <StudentStats students={students} loading={loading} onRefresh={loadData} />
        <EnrollmentModal 
          students={students.map(s => ({ matricule: s.matricule, name: s.name }))} 
          onSuccess={loadData}
        />
      </div>
      
      <div className="rounded-md border">
        <DataTable columns={columns} data={students} />
      </div>
    </div>
  );
}