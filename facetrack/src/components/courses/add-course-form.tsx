'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addCourse } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { AddCoursePayload } from '@/types/courses';

interface AddCourseFormProps {
  departments: string[];
  lecturers: string[];
  levels: string[];
  semesters: string[];
  onSuccess?: () => void;
}

export function AddCourseForm({ 
  departments, 
  lecturers, 
  levels, 
  semesters,
  onSuccess 
}: AddCourseFormProps) {
  const [formData, setFormData] = useState<AddCoursePayload>({
    course_code: '',
    course_name: '',
    department: '',
    lecturer_name: '',
    level: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addCourse(formData);
      toast({
        title: 'Success',
        description: 'Course added successfully',
        variant: 'default'
      });
      setFormData({
        course_code: '',
        course_name: '',
        department: '',
        lecturer_name: '',
        level: '',
        semester: ''
      });
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course_code">Course Code</Label>
          <Input
            id="course_code"
            value={formData.course_code}
            onChange={(e) => setFormData({...formData, course_code: e.target.value})}
            required
            placeholder="e.g. CEF405"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_name">Course Name</Label>
          <Input
            id="course_name"
            value={formData.course_name}
            onChange={(e) => setFormData({...formData, course_name: e.target.value})}
            required
            placeholder="e.g. Cloud Computing"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({...formData, department: value})}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lecturer_name">Lecturer</Label>
          <Select
            value={formData.lecturer_name}
            onValueChange={(value) => setFormData({...formData, lecturer_name: value})}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lecturer" />
            </SelectTrigger>
            <SelectContent>
              {lecturers.map((lecturer) => (
                <SelectItem key={lecturer} value={lecturer}>
                  {lecturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({...formData, level: value})}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select
            value={formData.semester}
            onValueChange={(value) => setFormData({...formData, semester: value})}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Course'}
      </Button>
    </form>
  );
}