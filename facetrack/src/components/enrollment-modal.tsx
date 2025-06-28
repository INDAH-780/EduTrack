'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { enrollStudent, bulkEnrollStudents, fetchCourses } from '@/lib/api';

interface EnrollmentModalProps {
  students: { matricule: string; name: string }[];
  onSuccess: () => void;
}

export function EnrollmentModal({ students, onSuccess }: EnrollmentModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [courses, setCourses] = useState<{ course_code: string; course_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    course_code: '',
    departments: [] as string[],
    levels: [] as string[],
    matricules: [] as string[],
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (error) {
        alert('Failed to load courses');
      }
    };
    loadCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'single') {
        await enrollStudent({
          matricule: formData.matricule,
          course_code: formData.course_code
        });
        alert('Student enrolled successfully');
      } else {
        // Create the base payload
        const payload: any = {
          course_code: formData.course_code
        };

        // Add formatted arrays if they have values
        if (formData.departments.length > 0) {
          payload.departments = formData.departments.map(dept => ` ${dept}`);
        }
        if (formData.levels.length > 0) {
          payload.levels = formData.levels.map(level => ` ${level}`);
        }
        if (formData.matricules.length > 0) {
          payload.matricules = formData.matricules.map(mat => ` ${mat}`);
        }

        await bulkEnrollStudents(payload);
        alert('Students enrolled in bulk successfully');
      }
      onSuccess();
      setOpen(false);
    } catch (error) {
      alert('Failed to enroll students');
      console.error('Enrollment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (type: 'departments' | 'levels', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type], value]
        : prev[type].filter(item => item !== value)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-2">
          Enroll Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll Students in Course</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mb-6">
          <Button
            variant={mode === 'single' ? 'default' : 'outline'}
            onClick={() => setMode('single')}
          >
            Single Enrollment
          </Button>
          <Button
            variant={mode === 'bulk' ? 'default' : 'outline'}
            onClick={() => setMode('bulk')}
          >
            Bulk Enrollment
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
              <Select
                value={formData.course_code}
                onValueChange={(value) => setFormData({...formData, course_code: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.course_code} value={course.course_code}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === 'single' ? (
              <div className="space-y-2">
                <Label htmlFor="matricule">Student Matricule</Label>
                <Select
                  value={formData.matricule}
                  onValueChange={(value) => setFormData({...formData, matricule: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.matricule} value={student.matricule}>
                        {student.matricule} - {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Filter Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departments</Label>
                      <div className="space-y-2">
                        {['Computer Engineering', 'Electrical Engineering', 'Civil Engineering'].map((dept) => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dept-${dept}`}
                              checked={formData.departments.includes(dept)}
                              onCheckedChange={(checked: boolean) => 
                                handleCheckboxChange('departments', dept, checked)
                              }
                            />
                            <label htmlFor={`dept-${dept}`} className="text-sm">
                              {dept}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Levels</Label>
                      <div className="space-y-2">
                        {['Level 200', 'Level 300', 'Level 400', 'Level 500'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level}`}
                              checked={formData.levels.includes(level)}
                              onCheckedChange={(checked: boolean) => 
                                handleCheckboxChange('levels', level, checked)
                              }
                            />
                            <label htmlFor={`level-${level}`} className="text-sm">
                              {level}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricules">Or specify matricules (comma separated)</Label>
                  <Input
                    id="matricules"
                    placeholder="FE21A002, FE20A014"
                    value={formData.matricules.join(', ')}
                    onChange={(e) => {
                      const matricules = e.target.value
                        .split(',')
                        .map(m => m.trim())
                        .filter(m => m);
                      setFormData({...formData, matricules});
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'single' ? 'Enroll Student' : 'Enroll Students'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}