// // 'use client';

// // import { useParams, useSearchParams, useRouter } from 'next/navigation';
// // import { useEffect, useRef, useState, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
// // import { useAuth } from '@/context/authContext';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { toast } from '@/components/ui/use-toast';

// // // Type definitions
// // type Student = {
// //   student_matricule: string;
// //   student_name: string;
// // };

// // type FaceBox = {
// //   left: number;
// //   top: number;
// //   right: number;
// //   bottom: number;
// // };

// // type DetectedFace = {
// //   box: FaceBox;
// //   student?: Student;
// // };

// // type AttendanceRecord = {
// //   student: any;
// //   student_matricule: string;
// //   student_name: string;
// // };

// // type CourseInfo = {
// //   courseCode: string;
// //   courseName: string;
// //   scheduleId: number;
// //   dayTime: string;
// //   location: string;
// // };

// // type ApiResponse = {
// //   marked_students?: AttendanceRecord[];
// //   detected_faces?: DetectedFace[];
// //   message?: string;
// //   error?: string;
// // };

// // export default function TakeAttendancePage() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const params = useParams();
// //   const { user, isAuthenticated, userType } = useAuth();
  
// //   // Refs
// //   const canvasRef = useRef<HTMLCanvasElement>(null);
// //   const isStreamActiveRef = useRef<boolean>(false); // Controls the readStream loop

// //   // State
// //   // Initial state: not loading, button is visible, no canvas drawing yet.
// //   const [isLoading, setIsLoading] = useState<boolean>(false); 
// //   const [isCapturing, setIsCapturing] = useState<boolean>(false);
// //   const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
// //   const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
// //   const [isCanvasDrawingFrames, setIsCanvasDrawingFrames] = useState<boolean>(false); // Renamed from videoLoaded
// //   const [showPlayButton, setShowPlayButton] = useState<boolean>(true); 
  
// //   // IMPORTANT: Use your exact MJPEG stream URL and boundary!
// //   // The boundary is found in the Content-Type header: multipart/x-mixed-replace;boundary=YOUR_BOUNDARY
// //   const [ipCamUrl] = useState<string>('http://10.35.37.232:8080/video');
// //   const MJPEG_BOUNDARY = 'Ba4oTvQMY8ew04N8dcnM'; 

// //   const [courseInfo, setCourseInfo] = useState<CourseInfo>({
// //     courseCode: '',
// //     courseName: '',
// //     scheduleId: 0,
// //     dayTime: '',
// //     location: ''
// //   });

// //   // Get course code from params
// //   const courseCode = typeof params.courseId === 'string'
// //     ? params.courseId
// //     : Array.isArray(params.courseId)
// //       ? params.courseId[0] || ''
// //       : '';

// //   // Initialize course info
// //   useEffect(() => {
// //     const scheduleId = Number(searchParams.get('schedule_id')) || 0;
// //     const courseName = searchParams.get('course_name') || '';
// //     const startTime = searchParams.get('start_time') || '';
// //     const endTime = searchParams.get('end_time') || '';
// //     const location = decodeURIComponent(searchParams.get('location') || '');

// //     setCourseInfo({
// //       courseCode,
// //       courseName,
// //       scheduleId,
// //       dayTime: `${startTime} - ${endTime}`,
// //       location
// //     });
// //   }, [courseCode, searchParams]);

// //   // Auth check
// //   useEffect(() => {
// //     if (!isAuthenticated || userType !== 'lecturer') {
// //       router.push('/login');
// //     }
// //   }, [isAuthenticated, userType, router]);

// //   // Helper function to find a sequence of bytes in a Uint8Array
// //   const findBytes = useCallback((haystack: Uint8Array, needle: Uint8Array, start = 0): number => {
// //       for (let i = start; i < haystack.length - needle.length + 1; i++) {
// //           let found = true;
// //           for (let j = 0; j < needle.length; j++) {
// //               if (haystack[i + j] !== needle[j]) {
// //                   found = false;
// //                   break;
// //               }
// //           }
// //           if (found) return i;
// //       }
// //       return -1;
// //   }, []); 

// //   // --- MJPEG Stream Handling ---
// //   const processMjpegStream = useCallback(async () => {
// //     if (!canvasRef.current) {
// //         console.warn("Canvas ref not available for MJPEG stream processing.");
// //         return;
// //     }

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     if (!ctx) {
// //         console.error("Could not get 2D context from canvas.");
// //         return;
// //     }

// //     // Mixed Content Warning (still relevant for fetch)
// //     if (window.location.protocol === 'https:' && ipCamUrl.startsWith('http:')) {
// //         console.warn("Mixed Content Warning: HTTPS page fetching HTTP MJPEG stream. Browser might block. Try running frontend on HTTP for dev.");
// //         toast({
// //             title: 'Security Warning',
// //             description: 'Browser may block insecure webcam stream (mixed content). Try running frontend on HTTP for dev.',
// //             variant: 'default' 
// //         });
// //     }

// //     // States when stream processing begins
// //     setIsLoading(true); // Show "Initializing..."
// //     setIsCanvasDrawingFrames(false); // No frames drawn yet
// //     setShowPlayButton(false); // Hide the play button
// //     isStreamActiveRef.current = true; // Activate the stream loop

// //     try {
// //         console.log(`Attempting to fetch MJPEG stream from: ${ipCamUrl}`);
// //         const response = await fetch(ipCamUrl, {
// //             headers: {
// //                 'Cache-Control': 'no-cache, no-store, must-revalidate',
// //                 'Pragma': 'no-cache',
// //                 'Expires': '0',
// //             },
// //             mode: 'cors' 
// //         });

// //         if (!response.ok) {
// //             throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
// //         }

// //         const reader = response.body?.getReader();
// //         if (!reader) {
// //             throw new Error("Failed to get readable stream reader.");
// //         }

// //         let buffer = new Uint8Array();
// //         const fullBoundaryBytes = new TextEncoder().encode(`\r\n--${MJPEG_BOUNDARY}`); 
// //         const doubleCrlf = new TextEncoder().encode('\r\n\r\n');

// //         let frameCounter = 0;

// //         const readStream = async () => {
// //             while (isStreamActiveRef.current) { 
// //                 const { done, value } = await reader.read();
// //                 if (done) {
// //                     console.log("MJPEG Stream finished naturally (reader done).");
// //                     isStreamActiveRef.current = false; 
// //                     break;
// //                 }

// //                 const newBuffer = new Uint8Array(buffer.length + value.length);
// //                 newBuffer.set(buffer);
// //                 newBuffer.set(value, buffer.length);
// //                 buffer = newBuffer;

// //                 // console.log(`Buffer size: ${buffer.length} bytes.`); // Commented for less verbose logs

// //                 let boundaryIndex;
// //                 while ((boundaryIndex = findBytes(buffer, fullBoundaryBytes)) !== -1) {
// //                     const startOfFrameData = boundaryIndex + fullBoundaryBytes.length; 
// //                     const endOfFrame = findBytes(buffer, fullBoundaryBytes, startOfFrameData);

// //                     if (endOfFrame !== -1) {
// //                         const frameAndHeaders = buffer.subarray(startOfFrameData, endOfFrame);
                        
// //                         let headersEndIndex = findBytes(frameAndHeaders, doubleCrlf);
// //                         if (headersEndIndex !== -1) {
// //                             const jpegDataStart = headersEndIndex + doubleCrlf.length;
// //                             const jpegBytes = frameAndHeaders.subarray(jpegDataStart);

// //                             // console.log(`Boundary found at: ${boundaryIndex}, Headers end at: ${headersEndIndex}, Extracted JPEG bytes length: ${jpegBytes.length}`); // Commented for less verbose logs

// //                             if (jpegBytes.length > 0) {
// //                                 const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
// //                                 const imgUrl = URL.createObjectURL(blob);
// //                                 const img = new Image();
// //                                 img.onload = () => {
// //                                     if (frameCounter === 0 || canvas.width === 0 || canvas.height === 0) {
// //                                         canvas.width = img.naturalWidth;
// //                                         canvas.height = img.naturalHeight;
// //                                         console.log("Canvas dimensions set to:", canvas.width, "x", canvas.height);
// //                                     }
// //                                     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
// //                                     URL.revokeObjectURL(imgUrl); 
// //                                     setIsCanvasDrawingFrames(true); // Indicate first frame drawn
// //                                     setIsLoading(false); // Hide loading text
// //                                     setShowPlayButton(false); 
// //                                     frameCounter++;
// //                                 };
// //                                 img.onerror = (e) => {
// //                                     console.error("Error loading image from blob (corrupted JPEG?):", e);
// //                                     URL.revokeObjectURL(imgUrl);
// //                                 };
// //                                 img.src = imgUrl;
// //                             } else {
// //                                 console.warn("Empty JPEG data extracted for a frame.");
// //                             }
// //                         } else {
// //                             console.warn("Headers not yet complete for this frame, or invalid frame data. Waiting for more data.");
// //                             break; 
// //                         }
// //                         buffer = buffer.subarray(endOfFrame);
// //                     } else {
// //                         console.log("End boundary not found yet, need more data for current frame. Waiting for more data.");
// //                         break;
// //                     }
// //                 }
// //             }
// //             reader.releaseLock();
// //             console.log("MJPEG readStream loop exited.");
// //         };

// 'use client';

// import { useParams, useSearchParams, useRouter } from 'next/navigation';
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
// import { useAuth } from '@/context/authContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { toast } from '@/components/ui/use-toast';

// // Type definitions
// type Student = {
//   student_matricule: string;
//   student_name: string;
// };

// type FaceBox = {
//   left: number;
//   top: number;
//   right: number;
//   bottom: number;
// };

// type DetectedFace = {
//   box: FaceBox;
//   student?: Student;
// };

// type AttendanceRecord = {
//   student: any;
//   student_matricule: string;
//   student_name: string;
// };

// type CourseInfo = {
//   courseCode: string;
//   courseName: string;
//   scheduleId: number;
//   dayTime: string;
//   location: string;
// };

// type ApiResponse = {
//   marked_students?: AttendanceRecord[];
//   detected_faces?: DetectedFace[];
//   message?: string;
//   error?: string;
// };

// export default function TakeAttendancePage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const params = useParams();
//   const { user, isAuthenticated, userType } = useAuth();
  
//   // Refs
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const isStreamActiveRef = useRef<boolean>(false); // Controls the readStream loop

//   // State
//   const [isLoading, setIsLoading] = useState<boolean>(false); // Start as not loading, button is visible
//   const [isCapturing, setIsCapturing] = useState<boolean>(false);
//   const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
//   const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
//   const [isCanvasDrawingFrames, setIsCanvasDrawingFrames] = useState<boolean>(false); 
//   const [showPlayButton, setShowPlayButton] = useState<boolean>(true); 
  
//   // IMPORTANT: Use your exact MJPEG stream URL and boundary!
//   const [ipCamUrl] = useState<string>('http://10.35.37.232:8080/video');
//   const MJPEG_BOUNDARY = 'Ba4oTvQMY8ew04N8dcnM'; 

//   const [courseInfo, setCourseInfo] = useState<CourseInfo>({
//     courseCode: '',
//     courseName: '',
//     scheduleId: 0,
//     dayTime: '',
//     location: ''
//   });

//   // Get course code from params
//   const courseCode = typeof params.courseId === 'string'
//     ? params.courseId
//     : Array.isArray(params.courseId)
//       ? params.courseId[0] || ''
//       : '';

//   // Initialize course info
//   useEffect(() => {
//     const scheduleId = Number(searchParams.get('schedule_id')) || 0;
//     const courseName = searchParams.get('course_name') || '';
//     const startTime = searchParams.get('start_time') || '';
//     const endTime = searchParams.get('end_time') || '';
//     const location = decodeURIComponent(searchParams.get('location') || '');

//     setCourseInfo({
//       courseCode,
//       courseName,
//       scheduleId,
//       dayTime: `${startTime} - ${endTime}`,
//       location
//     });
//   }, [courseCode, searchParams]);

//   // Auth check
//   useEffect(() => {
//     if (!isAuthenticated || userType !== 'lecturer') {
//       router.push('/login');
//     }
//   }, [isAuthenticated, userType, router]);

//   // Helper function to find a sequence of bytes in a Uint8Array
//   const findBytes = useCallback((haystack: Uint8Array, needle: Uint8Array, start = 0): number => {
//       for (let i = start; i < haystack.length - needle.length + 1; i++) {
//           let found = true;
//           for (let j = 0; j < needle.length; j++) {
//               if (haystack[i + j] !== needle[j]) {
//                   found = false;
//                   break;
//               }
//           }
//           if (found) return i;
//       }
//       return -1;
//   }, []); 

//   // --- MJPEG Stream Handling ---
//   const processMjpegStream = useCallback(async () => {
//     if (!canvasRef.current) {
//         console.warn("Canvas ref not available for MJPEG stream processing.");
//         return;
//     }

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) {
//         console.error("Could not get 2D context from canvas.");
//         return;
//     }

//     // Mixed Content Warning (still relevant for fetch)
//     if (window.location.protocol === 'https:' && ipCamUrl.startsWith('http:')) {
//         console.warn("Mixed Content Warning: HTTPS page fetching HTTP MJPEG stream. Browser might block. Try running frontend on HTTP for dev.");
//         toast({
//             title: 'Security Warning',
//             description: 'Browser may block insecure webcam stream (mixed content). Try running frontend on HTTP for dev.',
//             variant: 'default' 
//         });
//     }

//     // States when stream processing begins
//     setIsLoading(true); // Show "Initializing..."
//     setIsCanvasDrawingFrames(false); // No frames drawn yet
//     setShowPlayButton(false); // Hide the play button
//     isStreamActiveRef.current = true; // Activate the stream loop

//     try {
//         console.log(`Attempting to fetch MJPEG stream from: ${ipCamUrl}`);
//         const response = await fetch(ipCamUrl, {
//             headers: {
//                 'Cache-Control': 'no-cache, no-store, must-revalidate',
//                 'Pragma': 'no-cache',
//                 'Expires': '0',
//             },
//             mode: 'cors' 
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
//         }

//         const reader = response.body?.getReader();
//         if (!reader) {
//             throw new Error("Failed to get readable stream reader.");
//         }

//         let buffer = new Uint8Array();
//         // The common boundary in the stream, prefixed with CRLF and two hyphens.
//         const fullBoundaryBytes = new TextEncoder().encode(`\r\n--${MJPEG_BOUNDARY}`); 
//         // Some streams start with boundary without leading CRLF, handle this for the very first boundary
//         const initialBoundaryBytes = new TextEncoder().encode(`--${MJPEG_BOUNDARY}`);

//         const doubleCrlf = new TextEncoder().encode('\r\n\r\n');

//         console.log("Full boundary bytes (for subsequent frames):", fullBoundaryBytes); 
//         console.log("Initial boundary bytes (for first frame, no leading CRLF):", initialBoundaryBytes);

//         let frameCounter = 0;
//         let isFirstFrame = true; // Flag to handle initial boundary parsing

//         const readStream = async () => {
//             while (isStreamActiveRef.current) { 
//                 const { done, value } = await reader.read();
//                 if (done) {
//                     console.log("MJPEG Stream finished naturally (reader done).");
//                     isStreamActiveRef.current = false; 
//                     break;
//                 }

//                 const newBuffer = new Uint8Array(buffer.length + value.length);
//                 newBuffer.set(buffer);
//                 newBuffer.set(value, buffer.length);
//                 buffer = newBuffer;

//                 // console.log(`Buffer size: ${buffer.length} bytes.`); 

//                 let currentBoundaryToSearch = isFirstFrame ? initialBoundaryBytes : fullBoundaryBytes;
//                 console.log(`Searching for boundary (isFirstFrame: ${isFirstFrame}):`, new TextDecoder().decode(currentBoundaryToSearch).trim());


//                 let boundaryIndex;
//                 while ((boundaryIndex = findBytes(buffer, currentBoundaryToSearch)) !== -1) {
//                     const startOfFrameData = boundaryIndex + currentBoundaryToSearch.length; 
                    
//                     // After finding the initial boundary, subsequent frame boundaries must include CRLF
//                     const nextBoundaryToSearch = fullBoundaryBytes; 
//                     const endOfFrame = findBytes(buffer, nextBoundaryToSearch, startOfFrameData);

//                     if (endOfFrame !== -1) {
//                         // Extract just the part, including its headers and image data
//                         const framePartBuffer = buffer.subarray(startOfFrameData, endOfFrame);
                        
//                         let headersEndIndex = findBytes(framePartBuffer, doubleCrlf);
//                         if (headersEndIndex !== -1) {
//                             const headersRaw = framePartBuffer.subarray(0, headersEndIndex);
//                             const jpegDataStart = headersEndIndex + doubleCrlf.length;
//                             const jpegBytes = framePartBuffer.subarray(jpegDataStart);

//                             let headersText = 'Error decoding headers';
//                             try {
//                                 headersText = new TextDecoder().decode(headersRaw);
//                             } catch (e) {
//                                 console.error("Error decoding raw headers:", e);
//                             }

//                             let contentType = 'N/A';
//                             let contentLength = 'N/A';
//                             headersText.split('\r\n').forEach(line => {
//                                 if (line.toLowerCase().startsWith('content-type:')) {
//                                     contentType = line.substring('content-type:'.length).trim();
//                                 }
//                                 if (line.toLowerCase().startsWith('content-length:')) {
//                                     contentLength = line.substring('content-length:'.length).trim();
//                                 }
//                             });
                            
//                             console.log(`--- Headers found for frame ${frameCounter} ---`);
//                             console.log(`Part Content-Type: ${contentType}`); 
//                             console.log(`Part Content-Length: ${contentLength}`); 
//                             console.log(`Raw JPEG bytes length from stream: ${jpegBytes.length}`); 
                            
//                             if (jpegBytes.length > 0) {
//                                 const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
//                                 console.log(`Created Blob with size: ${blob.size} bytes`); // NEW LOG: Blob size
//                                 const imgUrl = URL.createObjectURL(blob);
//                                 const img = new Image();
//                                 img.onload = () => {
//                                     if (img.naturalWidth === 0 || img.naturalHeight === 0) {
//                                         console.warn("Image loaded but has zero dimensions, skipping draw to canvas (likely corrupted frame).");
//                                         URL.revokeObjectURL(imgUrl);
//                                         return; 
//                                     }

//                                     // Set canvas dimensions once on the first valid frame
//                                     if (frameCounter === 0 || canvas.width === 0 || canvas.height === 0) {
//                                         canvas.width = img.naturalWidth;
//                                         canvas.height = img.naturalHeight;
//                                         console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
//                                     }
                                    
//                                     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//                                     URL.revokeObjectURL(imgUrl); 
//                                     setIsCanvasDrawingFrames(true); 
//                                     setIsLoading(false); 
//                                     setShowPlayButton(false); 
//                                     frameCounter++;
//                                     console.log(`Image loaded with dimensions: ${img.naturalWidth}x${img.naturalHeight} and drawn to canvas.`); 
//                                 };
//                                 img.onerror = (e) => {
//                                     console.error("Error loading image from blob (corrupted JPEG?):", e);
//                                     URL.revokeObjectURL(imgUrl);
//                                 };
//                                 img.src = imgUrl;
//                             } else {
//                                 console.warn("Empty JPEG data extracted for a frame.");
//                                 toast({ // NEW TOAST for empty JPEG data
//                                     title: 'Stream Warning',
//                                     description: 'Empty JPEG data extracted for a frame. Stream might be unstable.',
//                                     variant: 'default'
//                                 });
//                             }
//                             console.log(`-----------------------------`); // End of frame headers log
//                         } else {
//                             console.warn("Headers not yet complete for this frame, or invalid frame data. Waiting for more data.");
//                             // If headers aren't complete, we need more data. Break from inner while loop.
//                             break; 
//                         }
//                         buffer = buffer.subarray(endOfFrame); // Move buffer past the processed frame
//                         isFirstFrame = false; // After processing the first frame, all subsequent are not "first"
//                         currentBoundaryToSearch = fullBoundaryBytes; // Ensure next search uses full boundary
//                     } else {
//                         console.log("End boundary not found yet, need more data for current frame. Waiting for more data.");
//                         break;
//                     }
//                 }
//             }
//             reader.releaseLock();
//             console.log("MJPEG readStream loop exited.");
//         };

//         readStream();

//     } catch (error) {
//         console.error("Error processing MJPEG stream:", error);
//         toast({
//             title: 'MJPEG Stream Error',
//             description: `Failed to load or process stream: ${error instanceof Error ? error.message : String(error)}. Check console for details.`,
//             variant: 'destructive'
//         });
//         setIsLoading(false); 
//         setIsCanvasDrawingFrames(false); 
//         setShowPlayButton(true); 
//         isStreamActiveRef.current = false; 
//     }
//   }, [ipCamUrl, MJPEG_BOUNDARY, findBytes]); 

//   // Cleanup effect for when component unmounts
//   useEffect(() => {
//     return () => {
//       console.log("MJPEG useEffect cleanup: Setting isStreamActiveRef.current to false on component unmount.");
//       isStreamActiveRef.current = false; 
//     };
//   }, []); 

//   // These callbacks are now mostly placeholders as the MJPEG parsing handles display and errors.
//   const handleVideoLoadedMetadata = useCallback(() => { /* No-op */ }, []);
//   const handleVideoError = useCallback(() => { /* No-op */ }, []);

//   // Capture and process frame from the canvas
//   const captureAndProcess = useCallback(async () => {
//     const canvas = canvasRef.current;

//     // Ensure canvas is ready, has valid dimensions, and stream is active
//     if (!canvas || canvas.width === 0 || canvas.height === 0 || !isCanvasDrawingFrames || isLoading || !isStreamActiveRef.current) { 
//         console.warn("Skipping capture: Canvas not ready or has zero dimensions, or stream not active for drawing.", {
//             canvasRefReady: !!canvas, 
//             canvasDimensions: `${canvas?.width}x${canvas?.height}`, 
//             isCanvasDrawingFrames, 
//             isLoading, 
//             isStreamActive: isStreamActiveRef.current
//         });
//         return;
//     }
    
//     try {
//       const imageData = canvas.toDataURL('image/jpeg', 0.8);

//       const MIN_EXPECTED_IMAGE_DATA_LENGTH = 20000; // Increased to 20KB
//       if (imageData.length < MIN_EXPECTED_IMAGE_DATA_LENGTH) {
//           console.error("Frontend: Generated image data is suspiciously short. Possible canvas drawing issue or very low quality stream.", imageData.length);
//           toast({
//               title: 'Capture Warning',
//               description: 'Generated image data is too small. Stream might be very low quality or canvas not drawing correctly.',
//               variant: 'default' 
//           });
//           return;
//       }

//       if (!courseCode) {
//         toast({
//           title: 'Error',
//           description: 'Course code missing',
//           variant: 'destructive'
//         });
//         return;
//       }

//       console.log("Sending image data length to backend:", imageData.length); // Log length before sending
//       const response = await fetch('http://127.0.0.1:5000/api/attendance/mark', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//         },
//         body: JSON.stringify({
//           image_data: imageData,
//           course_code: courseCode,
//           schedule_id: courseInfo.scheduleId
//         })
//       });

//       if (!response.ok) {
//           const errorData = await response.json() as ApiResponse;
//           console.error('Backend error:', errorData);
//           toast({
//               title: 'Attendance Error',
//               description: errorData.message || 'Failed to mark attendance.',
//               variant: 'destructive'
//           });
//           return;
//       }
      
//       const result = await response.json() as ApiResponse;
      
//       if (result.marked_students) {
//         setAttendanceRecords(prev => {
//           const recordsMap = new Map<string, AttendanceRecord>(
//             prev.map(record => [record.student_matricule, record])
//           );
//           result.marked_students?.forEach(newRecord => {
//             recordsMap.set(newRecord.student_matricule, newRecord);
//           });
//           return Array.from(recordsMap.values());
//         });
//       }

//       if (result.detected_faces) {
//         setDetectedFaces(result.detected_faces);
//       }
//     } catch (error) {
//       console.error('Capture error:', error);
//       toast({
//         title: 'Processing Error',
//         description: 'Failed to process frame',
//         variant: 'destructive',
//       });
//     }
//   }, [isLoading, isCanvasDrawingFrames, courseCode, courseInfo.scheduleId, isStreamActiveRef]); 

//   // Capture interval
//   useEffect(() => {
//     let intervalId: NodeJS.Timeout | null = null;
    
//     // Only start interval if capturing is enabled AND isCanvasDrawingFrames is true
//     if (isCapturing && isCanvasDrawingFrames) {
//       captureAndProcess(); 
//       intervalId = setInterval(captureAndProcess, 2000);
//     }

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, [isCapturing, isCanvasDrawingFrames, captureAndProcess]);

//   const toggleCapture = useCallback(() => {
//     // Only allow toggling capture if the stream is active and a frame has been drawn
//     if (!isCanvasDrawingFrames || isLoading || !isStreamActiveRef.current) {
//       toast({
//         title: 'Camera Not Ready',
//         description: 'Please wait for camera stream to become active.',
//         variant: 'destructive'
//       });
//       return;
//     }
//     setIsCapturing(prev => !prev);
//   }, [isCanvasDrawingFrames, isLoading, isStreamActiveRef]);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center gap-4">
//         <Button variant="outline" size="icon" onClick={() => router.back()}>
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//         <h1 className="text-2xl font-bold">
//           Take Attendance - {courseInfo.courseCode}
//         </h1>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Webcam Feed */}
//         <div className="lg:col-span-2 space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Live Recognition</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="relative">
//                 {/* Show loading text if isLoading is true */}
//                 {isLoading && (
//                   <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
//                     <p>Initializing video stream from IP camera...</p>
//                   </div>
//                 )}
                
//                 {/* Canvas is now the primary display for the MJPEG stream */}
//                 <canvas 
//                     ref={canvasRef} 
//                     className={`w-full h-auto rounded-lg border ${isLoading || showPlayButton ? 'hidden' : ''}`} 
//                     style={{ aspectRatio: '16/9', objectFit: 'contain' }} 
//                 />

//                 {showPlayButton && ( // Show play button when showPlayButton is true
//                   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
//                     <Button onClick={processMjpegStream}> 
//                       Click to Start IP Camera Stream
//                     </Button>
//                   </div>
//                 )}
                
//                 {detectedFaces.map((face, index) => (
//                   <div
//                     key={`face-${index}`} 
//                     className="absolute border-2 border-green-500"
//                     style={{
//                       left: `${face.box.left}px`,
//                       top: `${face.box.top}px`,
//                       width: `${face.box.right - face.box.left}px`,
//                       height: `${face.box.bottom - face.box.top}px`
//                     }}
//                   >
//                     {face.student && (
//                       <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
//                         {face.student.student_name}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-center gap-4">
//             <Button
//               onClick={toggleCapture}
//               disabled={isLoading || !isCanvasDrawingFrames || showPlayButton || !isStreamActiveRef.current} 
//               className="w-full sm:w-auto"
//             >
//               {isCapturing ? 'Stop Capturing' : 'Start Capturing'}
//             </Button>
//           </div>
//         </div>

//         {/* Attendance Results */}
//         <div className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Class Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <p><strong>Course:</strong> {courseInfo.courseName} ({courseInfo.courseCode})</p>
//               <p><strong>Time:</strong> {courseInfo.dayTime}</p>
//               <p><strong>Location:</strong> {courseInfo.location}</p>
//               <p><strong>Lecturer:</strong> {user?.name}</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Attendance Results</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <p className="text-sm text-green-600">Recognized</p>
//                     <p className="text-2xl font-bold">{attendanceRecords.length}</p>
//                   </div>
//                   <div className="bg-yellow-50 p-4 rounded-lg">
//                     <p className="text-sm text-yellow-600">Unrecognized</p>
//                     <p className="text-2xl font-bold">
//                       {detectedFaces.filter(f => !f.student).length}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <h3 className="font-medium">Marked Attendance</h3>
//                   <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
//                     {attendanceRecords.length > 0 ? (
//                       attendanceRecords.map((record) => (
//                         <div key={record.student_matricule} className="p-3 flex items-center gap-3">
//                           <CheckCircle2 className="h-5 w-5 text-green-500" />
//                           <div>
//                             <p className="font-medium">{record.student.student_name}</p>
//                             <p className="text-sm text-gray-500">{record.student.student_matricule}</p>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-4 text-center text-gray-500">
//                         No attendance marked yet
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <h3 className="font-medium">Unrecognized Faces</h3>
//                   <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
//                     {detectedFaces.filter(f => !f.student).length > 0 ? (
//                       detectedFaces.filter(f => !f.student).map((_, index) => (
//                         <div key={`unrecognized-${index}`} className="p-3 flex items-center gap-3">
//                           <AlertCircle className="h-5 w-5 text-yellow-500" />
//                           <div>
//                             <p className="font-medium">Unknown Face</p>
//                             <p className="text-sm text-gray-500">Not recognized</p>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-4 text-center text-gray-500">
//                         No unrecognized faces
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useParams, useSearchParams, useRouter } from 'next/navigation';
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
// import { useAuth } from '@/context/authContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { toast } from '@/components/ui/use-toast';

// // Type definitions
// type Student = {
//   student_matricule: string;
//   student_name: string;
// };

// type FaceBox = {
//   left: number;
//   top: number;
//   right: number;
//   bottom: number;
// };

// type DetectedFace = {
//   box: FaceBox;
//   student?: Student;
// };

// type AttendanceRecord = {
//   student: any;
//   student_matricule: string;
//   student_name: string;
// };

// type CourseInfo = {
//   courseCode: string;
//   courseName: string;
//   scheduleId: number;
//   dayTime: string;
//   location: string;
// };

// type ApiResponse = {
//   marked_students?: AttendanceRecord[];
//   detected_faces?: DetectedFace[];
//   message?: string;
//   error?: string;
// };

// export default function TakeAttendancePage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const params = useParams();
//   const { user, isAuthenticated, userType } = useAuth();
  
//   // Refs
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const isStreamActiveRef = useRef<boolean>(false); // Controls the readStream loop

//   // State
//   const [isLoading, setIsLoading] = useState<boolean>(false); // Start as not loading, button is visible
//   const [isCapturing, setIsCapturing] = useState<boolean>(false);
//   const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
//   const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
//   const [isCanvasDrawingFrames, setIsCanvasDrawingFrames] = useState<boolean>(false); 
//   // Removed showPlayButton state and all related code

//   // IMPORTANT: Use your exact MJPEG stream URL and boundary!
//   const [ipCamUrl] = useState<string>('http://10.35.37.232:8080/video'); 


//   const MJPEG_BOUNDARY = 'Ba4oTvQMY8ew04N8dcnM'; 

//   const [courseInfo, setCourseInfo] = useState<CourseInfo>({
//     courseCode: '',
//     courseName: '',
//     scheduleId: 0,
//     dayTime: '',
//     location: ''
//   });

//   // Get course code from params
//   const courseCode = typeof params.courseId === 'string'
//     ? params.courseId
//     : Array.isArray(params.courseId)
//       ? params.courseId[0] || ''
//       : '';

//   // Initialize course info
//   useEffect(() => {
//     const scheduleId = Number(searchParams.get('schedule_id')) || 0;
//     const courseName = searchParams.get('course_name') || '';
//     const startTime = searchParams.get('start_time') || '';
//     const endTime = searchParams.get('end_time') || '';
//     const location = decodeURIComponent(searchParams.get('location') || '');

//     setCourseInfo({
//       courseCode,
//       courseName,
//       scheduleId,
//       dayTime: `${startTime} - ${endTime}`,
//       location
//     });
//   }, [courseCode, searchParams]);

//   // Auth check
//   useEffect(() => {
//     if (!isAuthenticated || userType !== 'lecturer') {
//       router.push('/login');
//     }
//   }, [isAuthenticated, userType, router]);

//   // Helper function to find a sequence of bytes in a Uint8Array
//   const findBytes = useCallback((haystack: Uint8Array, needle: Uint8Array, start = 0): number => {
//       for (let i = start; i < haystack.length - needle.length + 1; i++) {
//           let found = true;
//           for (let j = 0; j < needle.length; j++) {
//               if (haystack[i + j] !== needle[j]) {
//                   found = false;
//                   break;
//               }
//           }
//           if (found) return i;
//       }
//       return -1;
//   }, []); 

//   // --- MJPEG Stream Handling ---
//   const processMjpegStream = useCallback(async () => {
//     if (!canvasRef.current) {
//         console.warn("Canvas ref not available for MJPEG stream processing.");
//         return;
//     }

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) {
//         console.error("Could not get 2D context from canvas.");
//         return;
//     }

//     // Mixed Content Warning (still relevant for fetch)
//     if (window.location.protocol === 'https:' && ipCamUrl.startsWith('http:')) {
//         console.warn("Mixed Content Warning: HTTPS page fetching HTTP MJPEG stream. Browser might block. Try running frontend on HTTP for dev.");
//         toast({
//             title: 'Security Warning',
//             description: 'Browser may block insecure webcam stream (mixed content). Try running frontend on HTTP for dev.',
//             variant: 'default' 
//         });
//     }

//     // States when stream processing begins
//     setIsLoading(true); // Show "Initializing..."
//     setIsCanvasDrawingFrames(false); // No frames drawn yet
//     // Removed setShowPlayButton(false);
//     isStreamActiveRef.current = true; // Activate the stream loop

//     try {
//         console.log(`Attempting to fetch MJPEG stream from: ${ipCamUrl}`);
//         const response = await fetch(ipCamUrl, {
//             headers: {
//                 'Cache-Control': 'no-cache, no-store, must-revalidate',
//                 'Pragma': 'no-cache',
//                 'Expires': '0',
//             },
//             mode: 'cors' 
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
//         }

//         const reader = response.body?.getReader();
//         if (!reader) {
//             throw new Error("Failed to get readable stream reader.");
//         }

//         let buffer = new Uint8Array();
//         // The common boundary in the stream, prefixed with CRLF and two hyphens.
//         const fullBoundaryBytes = new TextEncoder().encode(`\r\n--${MJPEG_BOUNDARY}`); 
//         // Some streams start with boundary without leading CRLF, handle this for the very first boundary
//         const initialBoundaryBytes = new TextEncoder().encode(`--${MJPEG_BOUNDARY}`);

//         const doubleCrlf = new TextEncoder().encode('\r\n\r\n');

//         console.log("Full boundary bytes (for subsequent frames):", fullBoundaryBytes); 
//         console.log("Initial boundary bytes (for first frame, no leading CRLF):", initialBoundaryBytes);

//         let frameCounter = 0;
//         let isFirstFrame = true; // Flag to handle initial boundary parsing

//         const readStream = async () => {
//             while (isStreamActiveRef.current) { 
//                 const { done, value } = await reader.read();
//                 if (done) {
//                     console.log("MJPEG Stream finished naturally (reader done).");
//                     isStreamActiveRef.current = false; 
//                     break;
//                 }

//                 const newBuffer = new Uint8Array(buffer.length + value.length);
//                 newBuffer.set(buffer);
//                 newBuffer.set(value, buffer.length);
//                 buffer = newBuffer;

//                 let currentBoundaryToSearch = isFirstFrame ? initialBoundaryBytes : fullBoundaryBytes;
//                 console.log(`Searching for boundary (isFirstFrame: ${isFirstFrame}):`, new TextDecoder().decode(currentBoundaryToSearch).trim());

//                 let boundaryIndex;
//                 let frameProcessedInIteration = false; // Track if a frame was processed in this iteration

//                 // Loop to process all complete frames in the current buffer
//                 while (isStreamActiveRef.current && (boundaryIndex = findBytes(buffer, currentBoundaryToSearch)) !== -1) {
//                     const startOfHeaders = boundaryIndex + currentBoundaryToSearch.length; 
                    
//                     // Find the end of headers (double CRLF)
//                     const headersEndIndex = findBytes(buffer, doubleCrlf, startOfHeaders);

//                     if (headersEndIndex !== -1) {
//                         const headersRaw = buffer.subarray(startOfHeaders, headersEndIndex);
//                         let headersText = 'Error decoding headers';
//                         try {
//                             headersText = new TextDecoder().decode(headersRaw);
//                         } catch (e) {
//                             console.error("Error decoding raw headers:", e);
//                         }

//                         let contentType = 'N/A';
//                         let contentLength = '0'; // Default to 0, parse as int later
//                         headersText.split('\r\n').forEach(line => {
//                             if (line.toLowerCase().startsWith('content-type:')) {
//                                 contentType = line.substring('content-type:'.length).trim();
//                             }
//                             if (line.toLowerCase().startsWith('content-length:')) {
//                                 contentLength = line.substring('content-length:'.length).trim();
//                             }
//                         });

//                         const jpegDataStart = headersEndIndex + doubleCrlf.length;
//                         const expectedJpegLength = parseInt(contentLength, 10);

//                         // Check if we have enough data in the buffer for the full JPEG image based on Content-Length
//                         if (expectedJpegLength > 0 && buffer.length >= jpegDataStart + expectedJpegLength) {
//                             const jpegBytes = buffer.subarray(jpegDataStart, jpegDataStart + expectedJpegLength);

//                             if (jpegBytes.length > 0) {
//                                 const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
//                                 const imgUrl = URL.createObjectURL(blob);
//                                 const img = new Image();
//                                 img.onload = () => {
//                                     if (img.naturalWidth === 0 || img.naturalHeight === 0) {
//                                         console.warn("Image loaded but has zero dimensions, skipping draw to canvas (likely corrupted frame).");
//                                         URL.revokeObjectURL(imgUrl);
//                                         return; 
//                                     }

//                                     // Set canvas dimensions once on the first valid frame
//                                     if (frameCounter === 0 || canvas.width === 0 || canvas.height === 0) {
//                                         canvas.width = img.naturalWidth;
//                                         canvas.height = img.naturalHeight;
//                                         console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
//                                     }
                                    
//                                     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//                                     URL.revokeObjectURL(imgUrl); 
//                                     setIsCanvasDrawingFrames(true); 
//                                     setIsLoading(false); 
//                                     frameCounter++;
//                                     console.log(`Image loaded with dimensions: ${img.naturalWidth}x${img.naturalHeight} and drawn to canvas.`); 
//                                 };
//                                 img.onerror = (e) => {
//                                     console.error("Error loading image from blob (corrupted JPEG?):", e);
//                                     URL.revokeObjectURL(imgUrl);
//                                 };
//                                 img.src = imgUrl;
//                             } else {
//                                 console.warn("Empty JPEG data extracted for a frame.");
//                                 toast({ 
//                                     title: 'Stream Warning',
//                                     description: 'Empty JPEG data extracted for a frame. Stream might be unstable.',
//                                     variant: 'default'
//                                 });
//                             }
//                             console.log(`-----------------------------`); // End of frame headers log
//                             frameProcessedInIteration = true; // Mark that a frame was processed

//                             const searchStartForNextBoundary = jpegDataStart + expectedJpegLength;
//                             const nextBoundaryFoundAt = findBytes(buffer, fullBoundaryBytes, searchStartForNextBoundary);

//                             if (nextBoundaryFoundAt !== -1) {
//                                 buffer = buffer.subarray(nextBoundaryFoundAt); 
//                                 isFirstFrame = false; 
//                                 currentBoundaryToSearch = fullBoundaryBytes; 
//                             } else {
//                                 buffer = buffer.subarray(searchStartForNextBoundary);
//                                 console.warn("Next boundary not found immediately after Content-Length data. Waiting for more data for the next frame.");
//                                 break; 
//                             }

//                         } else {
//                             console.log(`Not enough data in buffer for Content-Length ${expectedJpegLength}. Current buffer size from JPEG start: ${buffer.length - jpegDataStart}. Waiting for more data.`);
//                             break; 
//                         }
//                     } else {
//                         console.warn("Headers end (double CRLF) not found within current frame part. Waiting for more data, or stream is malformed."); 
//                         break; 
//                     }
//                 }
                
//                 if (!frameProcessedInIteration) {
//                     await new Promise(resolve => setTimeout(resolve, 50)); 
//                 }
//             }
//             reader.releaseLock();
//             console.log("MJPEG readStream loop exited.");
//         };

//         readStream();

//     } catch (error) {
//         console.error("Error processing MJPEG stream:", error);
//         toast({
//             title: 'MJPEG Stream Error',
//             description: `Failed to load or process stream: ${error instanceof Error ? error.message : String(error)}. Check console for details.`,
//             variant: 'destructive'
//         });
//         setIsLoading(false); 
//         setIsCanvasDrawingFrames(false); 
//         isStreamActiveRef.current = false; 
//     }
//   }, [ipCamUrl, MJPEG_BOUNDARY, findBytes]); 

//   // Cleanup effect for when component unmounts
//   useEffect(() => {
//     return () => {
//       console.log("MJPEG useEffect cleanup: Setting isStreamActiveRef.current to false on component unmount.");
//       isStreamActiveRef.current = false; 
//     };
//   }, []); 

//   const handleVideoLoadedMetadata = useCallback(() => { /* No-op */ }, []);
//   const handleVideoError = useCallback(() => { /* No-op */ }, []);

//   // Capture and process frame from the canvas
//   const captureAndProcess = useCallback(async () => {
//     const canvas = canvasRef.current;

//     // Ensure canvas is ready, has valid dimensions, and stream is active
//     if (!canvas || canvas.width === 0 || canvas.height === 0 || !isCanvasDrawingFrames || isLoading || !isStreamActiveRef.current) { 
//         console.warn("Skipping capture: Canvas not ready or has zero dimensions, or stream not active for drawing.", {
//             canvasRefReady: !!canvas, 
//             canvasDimensions: `${canvas?.width}x${canvas?.height}`, 
//             isCanvasDrawingFrames, 
//             isLoading, 
//             isStreamActive: isStreamActiveRef.current
//         });
//         return;
//     }
    
//     try {
//       // Get the image as a Blob
//       let imageBlob: Blob | null = await new Promise<Blob | null>(resolve => 
//         canvas.toBlob(resolve, 'image/jpeg', 0.8)
//       );

//       if (!imageBlob) {
//         console.error("Frontend: Failed to convert canvas to blob.");
//         toast({
//             title: 'Capture Error',
//             description: 'Failed to capture image from canvas.',
//             variant: 'destructive'
//         });
//         return;
//       }

//       // --- Sanitize the image blob (retained from previous attempt, good practice) ---
//       const jpegEoiBytes = new Uint8Array([0xFF, 0xD9]); // JPEG End Of Image marker
//       const arrayBuffer = await imageBlob.arrayBuffer();
//       const uint8Array = new Uint8Array(arrayBuffer);

//       let eoiIndex = -1;
//       for (let i = uint8Array.length - 2; i >= 0; i--) {
//           if (uint8Array[i] === jpegEoiBytes[0] && uint8Array[i+1] === jpegEoiBytes[1]) {
//               eoiIndex = i;
//               break;
//           }
//       }

//       if (eoiIndex !== -1 && eoiIndex + 2 < uint8Array.length) {
//           const cleanBytes = uint8Array.subarray(0, eoiIndex + 2);
//           imageBlob = new Blob([cleanBytes], { type: 'image/jpeg' });
//           console.log(`Frontend: Cleaned image blob. Original size: ${uint8Array.length}, New size: ${imageBlob.size}`);
//       } else if (eoiIndex === -1) {
//           console.warn("Frontend: JPEG EOI (FF D9) not found in the captured image blob. Sending as is, but might be malformed.");
//           toast({
//               title: 'Capture Warning',
//               description: 'JPEG End Of Image marker not found. Image might be corrupted.',
//               variant: 'default'
//           });
//       }

//       if (imageBlob.size < 20000) { 
//           console.error("Frontend: Generated image blob is suspiciously short.", imageBlob.size);
//           toast({
//               title: 'Capture Warning',
//               description: 'Generated image is too small. Stream might be very low quality or canvas not drawing correctly.',
//               variant: 'default' 
//           });
//           return;
//       }

//       if (!courseCode) {
//         toast({
//           title: 'Error',
//           description: 'Course code missing',
//           variant: 'destructive'
//         });
//         return;
//       }

//       // --- NEW: Convert Blob to Base64 string and send as JSON ---
//       const reader = new FileReader();
//       reader.readAsDataURL(imageBlob);
//       reader.onloadend = async () => {
//         const base64data = reader.result as string;
//         // Remove the "data:image/jpeg;base64," prefix
//         const base64ImageString = base64data.split(',')[1]; 

//         const payload = {
//           image_data_base64: base64ImageString,
//           course_code: courseCode,
//           schedule_id: String(courseInfo.scheduleId),
//         };

//         // Log payload content (for debugging)
//         console.log("Frontend: JSON payload being sent (excluding full base64 string):", {
//             course_code: payload.course_code,
//             schedule_id: payload.schedule_id,
//             image_data_base64_length: payload.image_data_base64.length
//         });

//         const response = await fetch('http://127.0.0.1:5000/api/attendance/mark', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json', // Explicitly set to JSON
//             'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//           },
//           body: JSON.stringify(payload), // Send JSON string
//         });

//         if (!response.ok) {
//             const errorData = await response.json() as ApiResponse;
//             console.error('Backend error:', errorData);
//             toast({
//                 title: 'Attendance Error',
//                 description: errorData.message || 'Failed to mark attendance.',
//                 variant: 'destructive'
//             });
//             return;
//         }
        
//         const result = await response.json() as ApiResponse;
        
//         if (result.marked_students) {
//           setAttendanceRecords(prev => {
//             const recordsMap = new Map<string, AttendanceRecord>(
//               prev.map(record => [record.student_matricule, record])
//             );
//             result.marked_students?.forEach(student => {
//               recordsMap.set(student.student_matricule, student);
//             });
//             return Array.from(recordsMap.values());
//           });
//         }

//         if (result.detected_faces) {
//           setDetectedFaces(result.detected_faces);
//         }
//       };
//     } catch (error) {
//       console.error("Capture and process error:", error);
//       toast({
//         title: 'Capture Error',
//         description: `Failed to process image for attendance. ${error instanceof Error ? error.message : String(error)}`,
//         variant: 'destructive',
//       });
//     }
//   }, [courseCode, courseInfo.scheduleId, isCanvasDrawingFrames, isLoading]);

//   // Interval for capturing frames every 3 seconds when capturing is active
//   useEffect(() => {
//     if (!isCapturing) return;

//     const intervalId = setInterval(() => {
//       if (!isCapturing) return;
//       captureAndProcess();
//     }, 3000);

//     return () => clearInterval(intervalId);
//   }, [isCapturing, captureAndProcess]);

//   // Toggle capture button handler
//   const toggleCapture = useCallback(() => {
//     // If stream not active and not loading, start MJPEG stream
//     if (!isCanvasDrawingFrames && !isLoading) {
//       processMjpegStream().then(() => {
//         setIsCapturing(true);
//       }).catch((e) => {
//         console.error("Failed to start MJPEG stream:", e);
//         setIsCapturing(false);
//       });
//     } else if (isCanvasDrawingFrames) {
//       // Toggle capturing on/off if stream is already active
//       setIsCapturing(prev => !prev);
//     } else {
//       toast({
//         title: 'Camera Not Ready',
//         description: 'Please wait for the camera stream to initialize before capturing.',
//         variant: 'destructive'
//       });
//     }
//   }, [isCanvasDrawingFrames, isLoading, processMjpegStream]);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center gap-4">
//         <Button variant="outline" size="icon" onClick={() => router.back()}>
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//         <h1 className="text-2xl font-bold">
//           Take Attendance - {courseInfo.courseCode}
//         </h1>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Live Recognition</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="relative">
//                 {/* Show loading placeholder if still loading */}
//                 {isLoading && (
//                   <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
//                     <p>Initializing video stream from IP camera...</p>
//                   </div>
//                 )}

//                 {/* Canvas to draw MJPEG frames */}
//                 <canvas
//                   ref={canvasRef}
//                   className={`w-full h-auto rounded-lg border ${isLoading ? 'hidden' : ''}`}
//                   style={{ aspectRatio: '16/9', objectFit: 'contain' }}
//                 />

//                 {/* Detected face boxes */}
//                 {detectedFaces.map((face, index) => (
//                   <div
//                     key={`face-${index}`}
//                     className="absolute border-2 border-green-500"
//                     style={{
//                       left: `${face.box.left}px`,
//                       top: `${face.box.top}px`,
//                       width: `${face.box.right - face.box.left}px`,
//                       height: `${face.box.bottom - face.box.top}px`
//                     }}
//                   >
//                     {face.student && (
//                       <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
//                         {face.student.student_name}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-center gap-4">
//             <Button
//               onClick={toggleCapture}
//               disabled={isLoading || (!isCanvasDrawingFrames && !isCapturing)}
//               className="w-full sm:w-auto"
//             >
//               {isCapturing ? 'Stop Capturing' : 'Start Capturing'}
//             </Button>
//           </div>
//         </div>

//         {/* Attendance Summary Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Attendance Results</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {attendanceRecords.length === 0 ? (
//               <p>No students marked present yet.</p>
//             ) : (
//               attendanceRecords.map(({ student_matricule, student_name }) => (
//                 <div key={student_matricule} className="flex items-center gap-2 mb-2">
//                   <CheckCircle2 className="text-green-600" />
//                   <p>{student_name} - {student_matricule}</p>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>

//         {/* Class Info Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Class Info</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             <div><strong>Course Code:</strong> {courseInfo.courseCode}</div>
//             <div><strong>Course Name:</strong> {courseInfo.courseName}</div>
//             <div><strong>Schedule ID:</strong> {courseInfo.scheduleId}</div>
//             <div><strong>Day & Time:</strong> {courseInfo.dayTime}</div>
//             <div><strong>Location:</strong> {courseInfo.location}</div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }










'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// Added XCircle for Absent status visual, AlertCircle for Unrecognized
import { ChevronLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'; 
import { useAuth } from '@/context/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
// Import table components for the attendance sheet
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
  student?: StudentInfo; // References StudentInfo type, will be undefined if not recognized
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

// Updated: ApiResponse type to match backend's property names and include annotated_image
type ApiResponse = {
  attendance_records_created?: BackendAttendanceRecord[]; // Matches backend property
  detected_faces?: DetectedFace[];
  message?: string;
  error?: string;
  error_message_from_backend?: string; // Generic property for backend error messages
  annotated_image?: string; // Add if you intend to display the annotated image from backend
};

export default function TakeAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user, isAuthenticated, userType } = useAuth();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // To manage the media stream

  // State
  const [isLoading, setIsLoading] = useState<boolean>(false); // For webcam initialization
  const [isCapturing, setIsCapturing] = useState<boolean>(false); // For sending frames to backend
  const [attendanceRecords, setAttendanceRecords] = useState<BackendAttendanceRecord[]>([]); 
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [isWebcamReady, setIsWebcamReady] = useState<boolean>(false); // True when video stream is actively playing

  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    courseCode: '',
    courseName: '',
    scheduleId: 0,
    dayTime: '',
    location: ''
  });

  // Get course code from params
  const courseCode = typeof params.courseId === 'string'
    ? params.courseId
    : Array.isArray(params.courseId)
      ? params.courseId[0] || ''
      : '';

  // Initialize course info
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

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || userType !== 'lecturer') {
      router.push('/login');
    }
  }, [isAuthenticated, userType, router]);

  // Initialize webcam
  const initializeWebcam = useCallback(async () => {
    try {
      console.log("DEBUG: Initializing webcam...");
      setIsLoading(true); // Show initializing state
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Use front camera on mobile if available
          width: { ideal: 1280 }, // Request higher resolution for better detection
          height: { ideal: 720 }
        },
        audio: false // No audio needed
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream; // Store stream for cleanup
        
        // Wait for video to be ready to play
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                resolve();
              }).catch(err => {
                console.error("Error playing video stream:", err);
                reject(new Error(`Failed to play video stream: ${err.name || err.message}`));
              });
            };
            videoRef.current.onerror = (e) => {
              console.error("Video element error:", e);
              reject(new Error(`Video element error: ${e}`));
            };
          } else {
            reject(new Error("Video ref not available during loadedmetadata setup."));
          }
        });
        
        console.log("DEBUG: Webcam stream started and playing.");
        setIsWebcamReady(true); // Mark webcam as ready
      }

      setIsLoading(false); // Hide initializing state
    } catch (error) {
      console.error('Webcam error:', error);
      toast({
        title: 'Webcam Error',
        description: `Could not access webcam: ${error instanceof Error ? error.message : String(error)}. Please ensure camera access is granted.`,
        variant: 'destructive'
      });
      setIsLoading(false); // Hide initializing state
      setIsWebcamReady(false); // Mark webcam as not ready
    }
  }, []);

  // Cleanup webcam on component unmount
  useEffect(() => {
    return () => {
      console.log("DEBUG: Cleaning up webcam stream on component unmount.");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture and process frame
  const captureAndProcess = useCallback(async () => {
    // Only proceed if webcam is ready and actively playing
    if (!videoRef.current || !canvasRef.current || !isWebcamReady) {
      console.warn("DEBUG: Skipping capture: Webcam not ready or not playing.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("DEBUG: Canvas 2D context not available.");
      toast({
        title: 'Canvas Error',
        description: 'Failed to get canvas context. Try refreshing.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Set canvas dimensions to match video (important for correct scaling of bounding boxes)
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image as Blob (for multipart/form-data)
      const blob: Blob | null = await new Promise(resolve => {
        // Quality 0.8 is good balance
        canvas.toBlob(resolve, 'image/jpeg', 0.8); 
      });

      if (!blob) {
        console.error("DEBUG: Failed to create image blob from canvas.");
        throw new Error("Failed to create image blob");
      }

      // Check blob size to avoid sending empty/tiny images
      const MIN_BLOB_SIZE = 10000; // 10KB as a minimum
      if (blob.size < MIN_BLOB_SIZE) {
        console.warn("DEBUG: Captured image blob is very small. Skipping sending to backend. Size:", blob.size);
        toast({
          title: 'Image Capture Warning',
          description: 'Captured image is too small. Please ensure proper lighting and camera focus.',
          variant: 'default'
        });
        return;
      }

      // Create FormData object
      const formData = new FormData();
      formData.append('image_data', blob, 'attendance.jpg');
      formData.append('course_code', courseCode);
      formData.append('schedule_id', String(courseInfo.scheduleId)); // Ensure schedule_id is a string

      console.log("Frontend DEBUG: Sending Request to Backend (Multipart/Form-Data):");
      console.log("  URL:", 'http://127.0.0.1:5000/api/attendance/mark');
      console.log("  Method:", 'POST');
      console.log("  Course Code:", courseCode);
      console.log("  Schedule ID:", courseInfo.scheduleId);
      // Note: FormData content cannot be easily logged directly in console

      const response = await fetch('http://127.0.0.1:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          // DO NOT set 'Content-Type' for FormData; browser sets it automatically with boundary
        },
        body: formData // Send the FormData object directly
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiResponse;
        console.error('Frontend DEBUG: Backend Error Response:', errorData); // Log full error response
        toast({
            title: 'Attendance Error',
            description: errorData.error || errorData.message || 'Failed to mark attendance.', 
            variant: 'destructive'
        });
        return; // Exit if response not OK
      }
      
      const result = await response.json() as ApiResponse;
      console.log("Frontend DEBUG: Backend Full Response:", result); // IMPORTANT: Log the full successful response

      // Update attendance records if received
      if (result.attendance_records_created && result.attendance_records_created.length > 0) {
        setAttendanceRecords(prev => {
          const recordsMap = new Map<string, BackendAttendanceRecord>(
            prev.map(record => [record.matricule, record]) // Use matricule as key for uniqueness
          );
          result.attendance_records_created?.forEach(newRecord => {
            recordsMap.set(newRecord.matricule, newRecord); // Add/update new records
          });
          return Array.from(recordsMap.values()); // Convert map back to array
        });
        toast({
            title: 'Attendance Marked!',
            description: `Successfully marked ${result.attendance_records_created.length} student(s).`,
            variant: 'success' // Use a success toast variant
        });
      } else if (result.message && result.message.includes("already marked")) {
         toast({
            title: 'Attendance Info',
            description: result.message, // "Attendance for FE20A204 already marked..."
            variant: 'default'
        });
      }


      // Update detected faces for bounding boxes
      if (result.detected_faces) {
        setDetectedFaces(result.detected_faces);
      } else {
        setDetectedFaces([]); // Clear faces if none detected
      }

    } catch (error) {
      console.error("Frontend DEBUG: Capture error (network/parsing):", error);
      toast({
        title: 'Processing Error',
        description: `Failed to process frame: ${error instanceof Error ? error.message : String(error)}. Check console.`,
        variant: 'destructive'
      });
    }
  }, [courseCode, courseInfo.scheduleId, isWebcamReady]);

  // Toggle capture button logic
  const toggleCapture = useCallback(() => {
    if (!isWebcamReady) {
      // If webcam is not ready, try to initialize it first
      initializeWebcam().then(() => {
        // Only start capturing if initialization was successful
        if (videoRef.current && videoRef.current.readyState >= 3) { // video has enough data to play
          setIsCapturing(true);
        } else {
          toast({
            title: 'Webcam Init Failed',
            description: 'Webcam could not be initialized or started properly.',
            variant: 'destructive'
          });
        }
      });
    } else {
      // If webcam is ready, just toggle capturing state
      setIsCapturing(prev => !prev);
    }
  }, [isWebcamReady, initializeWebcam]);

  // Interval for continuous capture
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Only start interval if capturing is enabled AND webcam is ready
    if (isCapturing && isWebcamReady) {
      console.log("DEBUG: Starting capture interval.");
      captureAndProcess(); // Call immediately on start
      intervalId = setInterval(captureAndProcess, 3000); // Send frame every 3 seconds
    } else {
        console.log("DEBUG: Stopping capture interval (isCapturing:", isCapturing, "isWebcamReady:", isWebcamReady, ").");
        // If capturing is turned off or webcam is not ready, clear interval
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Cleanup function when component unmounts or dependencies change
    return () => {
      console.log("DEBUG: Cleanup: Clearing capture interval.");
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCapturing, isWebcamReady, captureAndProcess]); // Dependencies for useEffect


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
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {/* Webcam video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isWebcamReady ? 'hidden' : ''}`}
                />

                {/* Hidden canvas for capture (always rendered but hidden) */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Loading state or initial state */}
                {(!isWebcamReady || isLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-700">
                    {isLoading ? (
                      <p>Initializing webcam...</p>
                    ) : (
                      <Button onClick={initializeWebcam} disabled={isLoading}>
                        Initialize Webcam
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Face detection boxes */}
                {/* Ensure video dimensions are used to scale boxes correctly */}
                {isWebcamReady && detectedFaces.map((face, index) => {
                  // Scale factors based on video intrinsic size vs. displayed size
                  const videoElement = videoRef.current;
                  if (!videoElement) return null; // Should not happen if isWebcamReady is true

                  const videoWidth = videoElement.videoWidth;
                  const videoHeight = videoElement.videoHeight;
                  const displayWidth = videoElement.offsetWidth;
                  const displayHeight = videoElement.offsetHeight;

                  // Calculate actual scaling
                  const scaleX = displayWidth / videoWidth;
                  const scaleY = displayHeight / videoHeight;

                  return (
                    <div
                      key={`face-${index}`} 
                      className="absolute border-2 border-green-500"
                      style={{
                        left: `${face.box.left * scaleX}px`,
                        top: `${face.box.top * scaleY}px`,
                        width: `${(face.box.right - face.box.left) * scaleX}px`,
                        height: `${(face.box.bottom - face.box.top) * scaleY}px`
                      }}
                    >
                      {face.student && (
                        <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          {face.student.name} {/* Use face.student.name */}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={toggleCapture}
              disabled={isLoading || !isWebcamReady} // Disable if initializing or webcam not ready
              className="w-full sm:w-auto"
              size="lg"
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
                      {/* Filter detectedFaces to count only those without a student (unrecognized) */}
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
                      detectedFaces.filter(f => !f.student).map((face, index) => ( // Use 'face' to potentially show box later
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
