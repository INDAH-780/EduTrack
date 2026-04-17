'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/types/student';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  loading?: boolean;
}

export function StatsCard({ title, value, description, className, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse"></div>
          {description && (
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DepartmentStatsCardProps {
  students: Student[];
  loading?: boolean;
}

export function DepartmentStatsCard({ students, loading }: DepartmentStatsCardProps) {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-1">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calculate department counts
  const departmentCounts = students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate level counts per department
  const levelCountsByDept = students.reduce((acc, student) => {
    if (!acc[student.department]) {
      acc[student.department] = {};
    }
    acc[student.department][student.level] = (acc[student.department][student.level] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Department Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(departmentCounts).map(([dept, count]) => (
          <div key={dept} className="space-y-2">
            <h3 className="font-medium">{dept}</h3>
            <p>Total: {count} students</p>
            <div className="text-sm text-muted-foreground">
              {Object.entries(levelCountsByDept[dept] || {}).map(([level, levelCount]) => (
                <div key={level}>Level {level}: {levelCount}</div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface StudentStatsProps {
  students: Student[];
  loading: boolean;
  onRefresh?: () => void;
}

export function StudentStats({ students, loading, onRefresh }: StudentStatsProps) {
  const departments = [...new Set(students.map(student => student.department))];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Dashboard</h2>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Students" 
          value={students.length} 
          description="All registered students"
          loading={loading}
        />
        <StatsCard 
          title="Departments" 
          value={departments.length} 
          description="Number of departments"
          loading={loading}
        />
        {departments.slice(0, 2).map(dept => (
          <StatsCard
            key={dept}
            title={dept}
            value={students.filter(s => s.department === dept).length}
            description={`Students in ${dept}`}
            loading={loading}
          />
        ))}
      </div>

      <DepartmentStatsCard students={students} loading={loading} />
    </div>
  );
}