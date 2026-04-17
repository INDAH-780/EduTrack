import { ColumnDef } from '@tanstack/react-table';
// import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Course } from '@/types/courses';

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: 'course_code',
    header: 'Code',
  },
  {
    accessorKey: 'course_name',
    header: 'Course Name',
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'lecturer_name',
    header: 'Lecturer',
  },
  {
    accessorKey: 'level',
    header: 'Level',
  },
  {
    accessorKey: 'semester',
    header: 'Semester',
  },
  {
    accessorKey: 'total_enrolled_students',
    header: 'Enrolled',
    cell: ({ row }) => {
      const count = row.getValue('total_enrolled_students');
      return count || 0;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const course = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(course.course_code)}
            >
              Copy Course Code
            </DropdownMenuItem>
            <DropdownMenuItem>View Students</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];