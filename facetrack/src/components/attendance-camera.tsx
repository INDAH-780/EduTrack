"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, UserCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AttendanceCameraProps {
  onStudentRecognized: (studentId: string) => void
}

export function AttendanceCamera({ onStudentRecognized }: AttendanceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [lastRecognized, setLastRecognized] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)

  // Mock student data for simulation
  const mockStudents = [
    { id: "STU1001", name: "Alex Johnson" },
    { id: "STU1042", name: "Sarah Williams" },
    { id: "STU1023", name: "Michael Brown" },
    { id: "STU1067", name: "Emily Davis" },
    { id: "STU1089", name: "David Wilson" },
    { id: "STU1102", name: "Jessica Taylor" },
    { id: "STU1054", name: "Robert Martinez" },
    { id: "STU1076", name: "Jennifer Garcia" },
  ]

  // Start camera when component mounts
  useEffect(() => {
    let detectInterval: NodeJS.Timeout

    const initCamera = async () => {
      await startCamera()

      // Start face detection after camera is initialized
      if (cameraReady) {
        detectInterval = setInterval(() => {
          // Simulate face detection (70% chance of detecting a face)
          const detected = Math.random() > 0.3
          setFaceDetected(detected)

          if (detected && !processing) {
            // Simulate processing a detected face
            processDetectedFace()
          }
        }, 1000)
      }
    }

    initCamera()

    // Cleanup function
    return () => {
      stopCamera()
      if (detectInterval) {
        clearInterval(detectInterval)
      }
    }
  }, [cameraReady, processing]) // Add dependencies to prevent stale closures

  const startCamera = async () => {
    if (videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        })
        videoRef.current.srcObject = stream
        setCameraReady(true)
      } catch (err) {
        console.error("Error accessing camera:", err)
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const processDetectedFace = () => {
    if (processing) return

    setProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      // Randomly select a student to "recognize"
      const randomIndex = Math.floor(Math.random() * mockStudents.length)
      const randomStudent = mockStudents[randomIndex]

      // Notify parent component
      onStudentRecognized(randomStudent.id)

      // Update UI
      setLastRecognized(randomStudent.name)

      // Reset processing state after a delay
      setTimeout(() => {
        setProcessing(false)
      }, 2000)
    }, 1500)
  }

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Face detection overlay */}
      {faceDetected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-green-500 w-1/2 h-3/4 rounded-lg flex items-center justify-center">
            {processing && (
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recognition notification */}
      {lastRecognized && (
        <div className="absolute bottom-4 left-4 right-4">
          <Alert className="bg-green-100 border-green-200">
            <UserCheck className="h-4 w-4 text-green-800 mr-2" />
            <AlertDescription className="text-green-800 font-medium">
              {lastRecognized} recognized and marked present
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Camera loading state */}
      {!cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
