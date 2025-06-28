// components/students/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Student = {
  matricule: string;
  name: string;
  department: string;
  level: string;
  total_enrolled_courses: number;
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "matricule",
    header: "Matricule",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("matricule")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("department")}</div>
    ),
    filterFn: (row, id: string, value: string[]): boolean => {
      const rowValue = row.getValue(id) as string;
      return value.includes(rowValue);
    },
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <div>{row.getValue("level")}</div>,
  },
  {
    accessorKey: "total_enrolled_courses",
    header: () => <div className="text-right">Courses</div>,
    cell: ({ row }) => {
      const courses = Number(row.getValue("total_enrolled_courses"));
      return <div className="text-right font-medium">{courses}</div>;
    },
  },
];