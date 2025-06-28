'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addSchedule } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
// import { Course } from '@/types/course';
import { AddSchedulePayload } from '@/types/schedules';
import { Course } from '@/types/courses';

interface AddScheduleFormProps {
  courses: Course[];
  onSuccess?: () => void;
}

export function AddScheduleForm({ courses, onSuccess }: AddScheduleFormProps) {
  const [formData, setFormData] = useState<AddSchedulePayload>({
    course_code: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addSchedule(formData);
      toast({
        title: 'Success',
        description: 'Schedule added successfully',
        variant: 'default'
      });
      setFormData({
        course_code: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        location: ''
      });
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add schedule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course_code">Course</Label>
        <Select
          value={formData.course_code}
          onValueChange={(value) => setFormData({...formData, course_code: value})}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="day_of_week">Day</Label>
          <Select
            value={formData.day_of_week}
            onValueChange={(value) => setFormData({...formData, day_of_week: value})}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
            placeholder="e.g. A301"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Schedule'}
      </Button>
    </form>
  );
}