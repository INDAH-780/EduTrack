'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// Added XCircle for Absent status visual
import { ChevronLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'; 
import { useAuth } from '@/context/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
// Import table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


// Type definitions
// Updated: More specific type for the student object returned within detected_faces
type StudentInfo = { 
  matricule: string; // This should match the 'matricule' field from your Student.to_dict()
  name: string; // Student's name
};

type FaceBox = {
  left: number;
  top: number; 
  right: number;
  bottom: number;
};

type DetectedFace = {
  box: FaceBox;
  student?: StudentInfo; // References StudentInfo type
};

// Updated: Type to accurately reflect AttendanceRecord.to_dict() from backend
type BackendAttendanceRecord = { 
  attendance_id: number;
  matricule: string; // This is the matricule (primary key) from the backend model
  student_name: string; // Directly available, not nested under 'student'
  course_code: string;
  course_name: string;
  schedule_id: number;
  schedule_info: any; // Can be more specific if needed, e.g., schedule: ClassScheduleInfo
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE'; // Enforce specific status strings
  timestamp: string;
  verified_by_face: boolean;
};

type CourseInfo = {
  courseCode: string;
  courseName: string;
  scheduleId: number;
  dayTime: string;
  location: string;
};

// Updated: ApiResponse type to match backend's property names
type ApiResponse = {
  attendance_records_created?: BackendAttendanceRecord[]; // Matches backend property
  detected_faces?: DetectedFace[];
  message?: string;
  error?: string;
  error_message_from_backend?: string; // Generic property for backend error messages
  // annotated_image?: string; // Add if you intend to display the annotated image from backend
};

export default function TakeAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user, isAuthenticated, userType } = useAuth();
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isStreamActiveRef = useRef<boolean>(false); // Controls the readStream loop

  // State
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  // Updated: Use BackendAttendanceRecord type for attendanceRecords state
  const [attendanceRecords, setAttendanceRecords] = useState<BackendAttendanceRecord[]>([]); 
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [isCanvasDrawingFrames, setIsCanvasDrawingFrames] = useState<boolean>(false); 
  const [showPlayButton, setShowPlayButton] = useState<boolean>(true); 
  
  const [ipCamUrl] = useState<string>('http://10.35.37.232:8080/video'); 
  const MJPEG_BOUNDARY = 'Ba4oTvQMY8ew04N8dcnM'; 

  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    courseCode: '',
    courseName: '',
    scheduleId: 0,
    dayTime: '',
    location: ''
  });

  const courseCode = typeof params.courseId === 'string'
    ? params.courseId
    : Array.isArray(params.courseId)
      ? params.courseId[0] || ''
      : '';

  useEffect(() => {
    const scheduleId = Number(searchParams.get('schedule_id')) || 0;
    const courseName = searchParams.get('course_name') || '';
    const startTime = searchParams.get('start_time') || '';
    const endTime = searchParams.get('end_time') || '';
    const location = decodeURIComponent(searchParams.get('location') || '');

    setCourseInfo({
      courseCode,
      courseName,
      scheduleId,
      dayTime: `${startTime} - ${endTime}`,
      location
    });
  }, [courseCode, searchParams]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'lecturer') {
      router.push('/login');
    }
  }, [isAuthenticated, userType, router]);

  const findBytes = useCallback((haystack: Uint8Array, needle: Uint8Array, start = 0): number => {
      for (let i = start; i < haystack.length - needle.length + 1; i++) {
          let found = true;
          for (let j = 0; j < needle.length; j++) {
              if (haystack[i + j] !== needle[j]) {
                  found = false;
                  break;
              }
          }
          if (found) return i;
      }
      return -1;
  }, []); 

  const processMjpegStream = useCallback(async () => {
    if (!canvasRef.current) {
        console.warn("Canvas ref not available for MJPEG stream processing.");
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D context from canvas.");
        return;
    }

    if (window.location.protocol === 'https:' && ipCamUrl.startsWith('http:')) {
        console.warn("Mixed Content Warning: HTTPS page fetching HTTP MJPEG stream. Browser might block. Try running frontend on HTTP for dev.");
        toast({
            title: 'Security Warning',
            description: 'Browser may block insecure webcam stream (mixed content). Try running frontend on HTTP for dev.',
            variant: 'default' 
        });
    }

    setIsLoading(true); 
    setIsCanvasDrawingFrames(false); 
    setShowPlayButton(false); 
    isStreamActiveRef.current = true; 

    try {
        console.log(`Attempting to fetch MJPEG stream from: ${ipCamUrl}`);
        const response = await fetch(ipCamUrl, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            mode: 'cors' 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("Failed to get readable stream reader.");
        }

        let buffer = new Uint8Array();
        const fullBoundaryBytes = new TextEncoder().encode(`\r\n--${MJPEG_BOUNDARY}`); 
        const initialBoundaryBytes = new TextEncoder().encode(`--${MJPEG_BOUNDARY}`);

        const doubleCrlf = new TextEncoder().encode('\r\n\r\n');

        console.log("Full boundary bytes (for subsequent frames):", fullBoundaryBytes); 
        console.log("Initial boundary bytes (for first frame, no leading CRLF):", initialBoundaryBytes);

        let frameCounter = 0;
        let isFirstFrame = true; 

        const readStream = async () => {
            while (isStreamActiveRef.current) { 
                const { done, value } = await reader.read();
                if (done) {
                    console.log("MJPEG Stream finished naturally (reader done).");
                    isStreamActiveRef.current = false; 
                    break;
                }

                const newBuffer = new Uint8Array(buffer.length + value.length);
                newBuffer.set(buffer);
                newBuffer.set(value, buffer.length);
                buffer = newBuffer;

                let currentBoundaryToSearch = isFirstFrame ? initialBoundaryBytes : fullBoundaryBytes;
                console.log(`Searching for boundary (isFirstFrame: ${isFirstFrame}):`, new TextDecoder().decode(currentBoundaryToSearch).trim());


                let boundaryIndex;
                let frameProcessedInIteration = false; 

                while (isStreamActiveRef.current && (boundaryIndex = findBytes(buffer, currentBoundaryToSearch)) !== -1) {
                    const startOfHeaders = boundaryIndex + currentBoundaryToSearch.length; 
                    
                    const headersEndIndex = findBytes(buffer, doubleCrlf, startOfHeaders);

                    if (headersEndIndex !== -1) {
                        const headersRaw = buffer.subarray(startOfHeaders, headersEndIndex);
                        let headersText = 'Error decoding headers';
                        try {
                            headersText = new TextDecoder().decode(headersRaw);
                        } catch (e) {
                            console.error("Error decoding raw headers:", e);
                        }

                        let contentType = 'N/A';
                        let contentLength = '0'; 
                        headersText.split('\r\n').forEach(line => {
                            if (line.toLowerCase().startsWith('content-type:')) {
                                contentType = line.substring('content-type:'.length).trim();
                            }
                            if (line.toLowerCase().startsWith('content-length:')) {
                                contentLength = line.substring('content-length:'.length).trim();
                            }
                        });

                        const jpegDataStart = headersEndIndex + doubleCrlf.length;
                        const expectedJpegLength = parseInt(contentLength, 10);

                        if (expectedJpegLength > 0 && buffer.length >= jpegDataStart + expectedJpegLength) {
                            const jpegBytes = buffer.subarray(jpegDataStart, jpegDataStart + expectedJpegLength);

                            console.log(`--- Headers found for frame ${frameCounter} ---`);
                            console.log(`Part Content-Type: ${contentType}`); 
                            console.log(`Part Content-Length: ${contentLength}`); 
                            console.log(`Raw JPEG bytes length (extracted): ${jpegBytes.length}`); 
                            
                            if (jpegBytes.length > 0) {
                                const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
                                console.log(`Created Blob with size: ${blob.size} bytes`); 
                                const imgUrl = URL.createObjectURL(blob);
                                const img = new Image();
                                img.onload = () => {
                                    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                                        console.warn("Image loaded but has zero dimensions, skipping draw to canvas (likely corrupted frame).");
                                        URL.revokeObjectURL(imgUrl);
                                        return; 
                                    }

                                    if (frameCounter === 0 || canvas.width === 0 || canvas.height === 0) {
                                        canvas.width = img.naturalWidth;
                                        canvas.height = img.naturalHeight;
                                        console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
                                    }
                                    
                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                    URL.revokeObjectURL(imgUrl); 
                                    setIsCanvasDrawingFrames(true); 
                                    setIsLoading(false); 
                                    setShowPlayButton(false); 
                                    frameCounter++;
                                    console.log(`Image loaded with dimensions: ${img.naturalWidth}x${img.naturalHeight} and drawn to canvas.`); 
                                };
                                img.onerror = (e) => {
                                    console.error("Error loading image from blob (corrupted JPEG?):", e);
                                    URL.revokeObjectURL(imgUrl);
                                };
                                img.src = imgUrl;
                            } else {
                                console.warn("Empty JPEG data extracted for a frame.");
                                toast({ 
                                    title: 'Stream Warning',
                                    description: 'Empty JPEG data extracted for a frame. Stream might be unstable.',
                                    variant: 'default'
                                });
                            }
                            console.log(`-----------------------------`); 
                            frameProcessedInIteration = true; 

                            const searchStartForNextBoundary = jpegDataStart + expectedJpegLength;
                            const nextBoundaryFoundAt = findBytes(buffer, fullBoundaryBytes, searchStartForNextBoundary);

                            if (nextBoundaryFoundAt !== -1) {
                                buffer = buffer.subarray(nextBoundaryFoundAt); 
                                isFirstFrame = false; 
                                currentBoundaryToSearch = fullBoundaryBytes; 
                            } else {
                                buffer = buffer.subarray(searchStartForNextBoundary);
                                console.warn("Next boundary not found immediately after Content-Length data. Waiting for more data for the next frame.");
                                break; 
                            }

                        } else {
                            console.log(`Not enough data in buffer for Content-Length ${expectedJpegLength}. Current buffer size from JPEG start: ${buffer.length - jpegDataStart}. Waiting for more data.`);
                            break; 
                        }
                    } else {
                        console.warn("Headers end (double CRLF) not found within current frame part. Waiting for more data, or stream is malformed."); 
                        break; 
                    }
                }
                
                if (!frameProcessedInIteration) {
                    await new Promise(resolve => setTimeout(resolve, 50)); 
                }
            }
            reader.releaseLock();
            console.log("MJPEG readStream loop exited.");
        };

        readStream();

    } catch (error) {
        console.error("Error processing MJPEG stream:", error);
        toast({
            title: 'MJPEG Stream Error',
            description: `Failed to load or process stream: ${error instanceof Error ? error.message : String(error)}. Check console for details.`,
            variant: 'destructive'
        });
        setIsLoading(false); 
        setIsCanvasDrawingFrames(false); 
        setShowPlayButton(true); 
        isStreamActiveRef.current = false; 
    }
  }, [ipCamUrl, MJPEG_BOUNDARY, findBytes]); 

  useEffect(() => {
    return () => {
      console.log("MJPEG useEffect cleanup: Setting isStreamActiveRef.current to false on component unmount.");
      isStreamActiveRef.current = false; 
    };
  }, []); 

  const handleVideoLoadedMetadata = useCallback(() => { /* No-op */ }, []);
  const handleVideoError = useCallback(() => { /* No-op */ }, []);

  const captureAndProcess = useCallback(async () => {
    const canvas = canvasRef.current;
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        console.error("Frontend: No access token found. Cannot send attendance data.");
        toast({
            title: 'Authentication Error',
            description: 'Not authenticated. Please log in again.',
            variant: 'destructive'
        });
        setIsCapturing(false); 
        return;
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0 || !isCanvasDrawingFrames || isLoading || !isStreamActiveRef.current) { 
        console.warn("Skipping capture: Canvas not ready or has zero dimensions, or stream not active for drawing.", {
            canvasRefReady: !!canvas, 
            canvasDimensions: `${canvas?.width}x${canvas?.height}`, 
            isCanvasDrawingFrames, 
            isLoading, 
            isStreamActive: isStreamActiveRef.current
        });
        return;
    }
    
    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      const MIN_EXPECTED_IMAGE_DATA_LENGTH = 20000; 
      if (imageDataUrl.length < MIN_EXPECTED_IMAGE_DATA_LENGTH) {
          console.error("Frontend: Generated image data is suspiciously short. Possible canvas drawing issue or very low quality stream.", imageDataUrl.length);
          toast({
              title: 'Capture Warning',
              description: 'Generated image data is too small. Stream might be very low quality or canvas not drawing correctly.',
              variant: 'default' 
          });
          return;
      }

      if (!courseCode) {
        toast({
          title: 'Error',
          description: 'Course code missing',
          variant: 'destructive'
        });
        return;
      }

      console.log("DEBUG: Initializing FormData.");
      const formData = new FormData();
      console.log("DEBUG: FormData instance:", formData); 
      
      const blob = await fetch(imageDataUrl).then(res => res.blob());
      console.log("DEBUG: Blob created:", blob); 

      formData.append('image_data', blob, 'frame.jpeg'); 
      console.log("DEBUG: Appended image_data.");
      
      formData.append('course_code', courseCode);
      console.log("DEBUG: Appended course_code:", courseCode);

      formData.append('schedule_id', courseInfo.scheduleId.toString());
      console.log("DEBUG: Appended schedule_id:", courseInfo.scheduleId.toString());

      console.log("Frontend DEBUG: Sending Request to Backend (Multipart/Form-Data):");
      console.log("  URL:", 'http://127.0.0.1:5000/api/attendance/mark');
      console.log("  Method:", 'POST');
      console.log("  Headers (note: Content-Type is auto-set by browser for FormData):", {
          'Authorization': `Bearer ${accessToken}`
      });
      

      const response = await fetch('http://127.0.0.1:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}` 
        },
        body: formData 
      });

      if (!response.ok) {
          const errorData = await response.json() as ApiResponse;
          console.error('Backend error:', errorData);
          toast({
              title: 'Attendance Error',
              description: errorData.error || errorData.message || 'Failed to mark attendance.', 
              variant: 'destructive'
          });
          return;
      }
      
      const result = await response.json() as ApiResponse;
      // NEW: Log the full backend response
      console.log("Frontend DEBUG: Backend Full Response:", result);

      // Corrected: Check for the proper backend property name 'attendance_records_created'
      if (result.attendance_records_created) {
        setAttendanceRecords(prev => {
          const recordsMap = new Map<string, BackendAttendanceRecord>(
            // Corrected: Access 'matricule' directly
            prev.map(record => [record.matricule, record]) 
          );
          // Corrected: Iterate over the proper backend property
          result.attendance_records_created?.forEach(newRecord => {
            recordsMap.set(newRecord.matricule, newRecord);
          });
          return Array.from(recordsMap.values());
        });
      }

      // Ensure detectedFaces are updated, as they contain the bounding box and student info
      if (result.detected_faces) {
        setDetectedFaces(result.detected_faces);
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: 'Processing Error',
        description: `Failed to process frame: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
    }
  }, [isLoading, isCanvasDrawingFrames, courseCode, courseInfo.scheduleId, isStreamActiveRef]); 

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isCapturing && isCanvasDrawingFrames) {
      captureAndProcess(); 
      intervalId = setInterval(captureAndProcess, 2000); 
    } else {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCapturing, isCanvasDrawingFrames, captureAndProcess]); 

  const toggleCapture = useCallback(() => {
    if (!isCanvasDrawingFrames || isLoading || !isStreamActiveRef.current) {
      toast({
        title: 'Camera Not Ready',
        description: 'Please wait for camera stream to become active.',
        variant: 'destructive'
      });
      return;
    }
    setIsCapturing(prev => !prev);
  }, [isCanvasDrawingFrames, isLoading, isStreamActiveRef]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          Take Attendance - {courseInfo.courseCode}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {isLoading && (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p>Initializing video stream from IP camera...</p>
                  </div>
                )}
                
                <canvas 
                    ref={canvasRef} 
                    className={`w-full h-auto rounded-lg border ${isLoading || showPlayButton ? 'hidden' : ''}`} 
                    style={{ aspectRatio: '16/9', objectFit: 'contain' }} 
                />

                {showPlayButton && ( 
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <Button onClick={processMjpegStream}> 
                      Click to Start IP Camera Stream
                    </Button>
                  </div>
                )}
                
                {/* Corrected: Bounding box rendering logic */}
                {detectedFaces.map((face, index) => (
                  <div
                    key={`face-${index}`} 
                    className="absolute border-2 border-green-500"
                    style={{
                      left: `${face.box.left}px`,
                      top: `${face.box.top}px`,
                      width: `${face.box.right - face.box.left}px`,
                      height: `${face.box.bottom - face.box.top}px`
                    }}
                  >
                    {face.student && (
                      <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        {face.student.name} {/* Corrected: Use face.student.name */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              onClick={toggleCapture}
              disabled={isLoading || !isCanvasDrawingFrames || showPlayButton || !isStreamActiveRef.current} 
              className="w-full sm:w-auto"
            >
              {isCapturing ? 'Stop Capturing' : 'Start Capturing'}
            </Button>
          </div>
        </div>

        {/* Attendance Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Course:</strong> {courseInfo.courseName} ({courseInfo.courseCode})</p>
              <p><strong>Time:</strong> {courseInfo.dayTime}</p>
              <p><strong>Location:</strong> {courseInfo.location}</p>
              <p><strong>Lecturer:</strong> {user?.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Sheet for {courseInfo.courseCode}</CardTitle> {/* New title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Recognized</p>
                    <p className="text-2xl font-bold">{attendanceRecords.length}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Unrecognized</p>
                    <p className="text-2xl font-bold">
                      {detectedFaces.filter(f => !f.student).length}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Marked Attendance</h3>
                  <div className="border rounded-lg max-h-96 overflow-y-auto"> {/* Increased max-height */}
                    {attendanceRecords.length > 0 ? (
                      <Table> {/* Use Shadcn Table components */}
                        <TableHeader>
                          <TableRow>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.map((record) => (
                            <TableRow key={record.matricule}>
                              <TableCell className="font-medium">{record.matricule}</TableCell>
                              <TableCell>{record.student_name}</TableCell>
                              <TableCell className="text-center">
                                {record.status === 'PRESENT' ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                ) : record.status === 'ABSENT' ? (
                                  <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto" /> // For 'LATE' or other statuses
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No attendance marked yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Unrecognized Faces (Not in this Course)</h3> {/* More descriptive title */}
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {detectedFaces.filter(f => !f.student).length > 0 ? (
                      detectedFaces.filter(f => !f.student).map((_, index) => (
                        <div key={`unrecognized-${index}`} className="p-3 flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">Unknown Face</p>
                            <p className="text-sm text-gray-500">Not recognized or not enrolled</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No unrecognized faces detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
