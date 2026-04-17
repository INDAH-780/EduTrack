'use client';

// import { Schedule } from '@/types/schedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Schedule } from '@/types/schedules';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface TimetableProps {
  schedules: Schedule[];
}

export function Timetable({ schedules }: TimetableProps) {
  // Group schedules by day and time
  const scheduleMap = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = {};
    }
    acc[schedule.day_of_week][schedule.start_time] = schedule;
    return acc;
  }, {} as Record<string, Record<string, Schedule>>);

  return (
    <Card className="w-full overflow-auto">
      <CardHeader>
        <CardTitle>Weekly Timetable</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-w-[800px]">
          {/* Header row with days */}
          <div className="grid grid-cols-7 border-b">
            <div className="p-2 font-medium border-r">Time</div>
            {daysOfWeek.map(day => (
              <div key={day} className="p-2 font-medium text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-7 border-b">
              <div className="p-2 border-r font-medium">
                {time}
              </div>
              {daysOfWeek.map(day => {
                const schedule = scheduleMap[day]?.[time];
                return (
                  <div 
                    key={`${day}-${time}`} 
                    className="p-2 border-r min-h-[80px] relative"
                  >
                    {schedule && (
                      <div className="absolute inset-1 bg-blue-50 border border-blue-200 rounded p-1 overflow-hidden">
                        <div className="text-xs font-medium">
                          {schedule.course_code}
                        </div>
                        <div className="text-xs truncate">
                          {schedule.course_name}
                        </div>
                        <div className="text-xs">
                          {schedule.location}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}