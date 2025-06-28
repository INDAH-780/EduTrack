'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data - replace with API call
const data = [
  { name: 'CEF450', attendance: 90, students: 42 },
  { name: 'CS401', attendance: 85, students: 35 },
  { name: 'SE410', attendance: 78, students: 28 },
  { name: 'DB301', attendance: 92, students: 37 },
];

export function LecturerAttendanceChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#888888" />
          <YAxis stroke="#888888" domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderColor: '#eeeeee',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="attendance" 
            name="Attendance %" 
            fill="#6366f1" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}