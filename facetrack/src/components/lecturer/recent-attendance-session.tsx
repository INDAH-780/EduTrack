'use client';

import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';

export function RecentAttendanceSessions() {
  // Mock data - replace with API call
  const sessions = [
    {
      course: 'CEF450 - Cloud Computing',
      date: 'Today, 09:00 AM',
      status: 'completed',
      recognized: 38,
      total: 42
    },
    {
      course: 'CS401 - Advanced Algorithms',
      date: 'Yesterday, 10:00 AM',
      status: 'completed',
      recognized: 32,
      total: 35
    },
    {
      course: 'SE410 - Software Engineering',
      date: 'Mon, 13:00 PM',
      status: 'pending',
      recognized: 0,
      total: 28
    }
  ];

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-white">
          {session.status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-medium">{session.course}</h4>
            <p className="text-sm text-gray-500">{session.date}</p>
            {session.status === 'completed' && (
              <p className="text-sm mt-1">
                <span className="text-green-600 font-medium">{session.recognized}</span> of{' '}
                <span className="font-medium">{session.total}</span> students recognized
              </p>
            )}
          </div>
          {session.status === 'pending' && (
            <Button variant="outline" size="sm">
              Mark Attendance
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}