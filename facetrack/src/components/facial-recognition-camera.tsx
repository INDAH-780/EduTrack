"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Camera, Loader2, UserCheck, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Student {
  id: string
  name: string
  enrollmentId: string
  status: "present" | "absent" | "pending"
  recognizedAt?: string
}

interface FacialRecognitionCameraProps {
  courseCode: string
  courseName: string
  students: Student[]
  onStudentRecognized: (studentId: string) => void
  onAttendanceComplete: () => void
}

export function FacialRecognitionCamera({
  courseCode,
  courseName,
  students,
  onStudentRecognized,
  onAttendanceComplete,
}: FacialRecognitionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognizedStudents, setRecognizedStudents] = useState<string[]>([])
  const [currentRecognition, setCurrentRecognition] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  const presentStudents = students.filter((s) => s.status === "present").length
  const totalStudents = students.length
  const attendanceProgress = (presentStudents / totalStudents) * 100

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }, [])

  const toggleCamera = useCallback(() => {
    setIsActive(!isActive)
  }, [isActive])

  const completeAttendance = useCallback(() => {
    setIsActive(false)
    onAttendanceComplete()
  }, [onAttendanceComplete])

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout

    if (isActive) {
      startCamera()
      setSessionStartTime(new Date())

      // Start face detection after camera is initialized
      detectionInterval = setInterval(() => {
        // Simulate face detection (80% chance)
        const detected = Math.random() > 0.2
        setFaceDetected(detected)

        if (detected && !isProcessing) {
          // Find students who haven't been recognized yet
          const unrecognizedStudents = students.filter((s) => !recognizedStudents.includes(s.id))

          if (unrecognizedStudents.length > 0) {
            setIsProcessing(true)

            // Simulate processing time
            setTimeout(() => {
              // Randomly select an unrecognized student
              const randomStudent = unrecognizedStudents[Math.floor(Math.random() * unrecognizedStudents.length)]

              setCurrentRecognition(randomStudent.name)
              setRecognizedStudents((prev) => [...prev, randomStudent.id])
              onStudentRecognized(randomStudent.id)

              // Clear recognition after 3 seconds
              setTimeout(() => {
                setCurrentRecognition(null)
                setIsProcessing(false)
              }, 3000)
            }, 1500)
          }
        }
      }, 3000) // Increased interval to 3 seconds to prevent rapid updates
    } else {
      stopCamera()
    }

    return () => {
      if (detectionInterval) clearInterval(detectionInterval)
      stopCamera()
    }
  }, [isActive, startCamera, stopCamera]) // Removed isProcessing and other dependencies that cause loops

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{totalStudents - presentStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Session Time</p>
                <p className="text-lg font-bold text-gray-900">
                  {sessionStartTime ? new Date().toLocaleTimeString() : "--:--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
            <span className="text-sm text-gray-600">{Math.round(attendanceProgress)}%</span>
          </div>
          <Progress value={attendanceProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Camera Interface */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Facial Recognition Camera
                </CardTitle>
                <CardDescription>
                  {courseName} ({courseCode})
                </CardDescription>
              </div>
              <Button
                onClick={toggleCamera}
                variant={isActive ? "destructive" : "default"}
                className={isActive ? "" : "academic-gradient"}
              >
                {isActive ? "Stop Recognition" : "Start Recognition"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              {isActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                  {/* Face Detection Overlay */}
                  {faceDetected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-4 border-green-500 w-2/3 h-3/4 rounded-lg animate-pulse">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-green-500 text-white">Face Detected</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-6 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Processing Recognition...</p>
                      </div>
                    </div>
                  )}

                  {/* Recognition Success */}
                  {currentRecognition && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Alert className="bg-green-100 border-green-200 animate-fade-in">
                        <UserCheck className="h-4 w-4 text-green-800" />
                        <AlertDescription className="text-green-800 font-medium">
                          {currentRecognition} recognized and marked present!
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Camera className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">Camera Ready</p>
                  <p className="text-sm">Click "Start Recognition" to begin</p>
                </div>
              )}
            </div>

            {isActive && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recognition Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Students should look directly at the camera</li>
                  <li>• Ensure good lighting for accurate recognition</li>
                  <li>• One student at a time for best results</li>
                  <li>• System will automatically mark attendance</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recognition Log */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Recognition Log
            </CardTitle>
            <CardDescription>Real-time attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recognizedStudents.length > 0 ? (
                recognizedStudents.map((studentId, index) => {
                  const student = students.find((s) => s.id === studentId)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="h-10 w-10 rounded-full academic-gradient flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student?.name}</p>
                        <p className="text-sm text-gray-600">ID: {student?.enrollmentId}</p>
                        <p className="text-xs text-green-600">Recognized at {new Date().toLocaleTimeString()}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No students recognized yet</p>
                  <p className="text-sm">Start the camera to begin recognition</p>
                </div>
              )}
            </div>

            {recognizedStudents.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button onClick={completeAttendance} className="w-full academic-gradient">
                  Complete Attendance Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
