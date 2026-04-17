'use client';

import { Camera, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FacialRecognitionStatusProps {
  accuracy: number;
}

export function FacialRecognitionStatus({ accuracy }: FacialRecognitionStatusProps) {
  return (
    <Card className="shadow-sm border-blue-100 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Camera className="h-5 w-5" />
          Facial Recognition System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Recognition Accuracy</span>
            <span className="text-sm font-bold text-blue-800">{accuracy}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={accuracy} 
              className="h-2 bg-blue-200"
              // The indicator color is controlled via CSS variable
              style={{
                // @ts-ignore - This is a custom property
                '--progress-indicator': '#4f46e5' // blue-600
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Zap className="h-4 w-4" />
            <span>System is active and ready for attendance marking</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}