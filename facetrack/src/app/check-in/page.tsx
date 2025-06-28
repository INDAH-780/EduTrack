"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FaceDetector } from "@/components/face-detector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CheckInPage() {
  const [userType, setUserType] = useState<"student" | "lecturer">("student")
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [recognitionStatus, setRecognitionStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [faceDetected, setFaceDetected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<{ name: string; id: string; department: string; course?: string } | null>(null)
  const [selectedCourse, setSelectedCourse] = useState("")

  useEffect(() => {
    if (cameraActive) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [cameraActive])

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
        setRecognitionStatus("idle")
        setCapturedImage(null)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setRecognitionStatus("failed")
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

  const captureImage = () => {
    if (!faceDetected) {
      alert("No face detected. Please position your face in the frame.")
      return
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL("image/png")
        setCapturedImage(imageData)
        setCameraActive(false)

        // Simulate facial recognition process
        setRecognitionStatus("processing")
        setTimeout(() => {
          // This is where you would integrate with your actual facial recognition API
          // For demo purposes, we're just simulating a successful recognition
          setRecognitionStatus("success")

          if (userType === "student") {
            setUser({
              name: "Alex Johnson",
              id: "STU1001",
              department: "Computer Science",
              course: selectedCourse || "CS401: Advanced Algorithms",
            })
          } else {
            setUser({
              name: "Dr. David Wilson",
              id: "LEC001",
              department: "Computer Science",
              course: selectedCourse || "CS401: Advanced Algorithms",
            })
          }
        }, 2000)
      }
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setRecognitionStatus("idle")
    setUser(null)
    setCameraActive(true)
  }

  const handleFaceDetectionChange = (detected: boolean) => {
    setFaceDetected(detected)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Attendance Check-In</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Tabs
          value={userType}
          onValueChange={(value) => setUserType(value as "student" | "lecturer")}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
          </TabsList>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Face Recognition</CardTitle>
              <CardDescription>
                {cameraActive
                  ? "Position your face in the frame and click capture"
                  : capturedImage
                    ? "Verifying your identity..."
                    : `Click start camera to begin the ${userType} check-in process`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!cameraActive && !capturedImage && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Course</label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CS401">CS401: Advanced Algorithms</SelectItem>
                        <SelectItem value="PHY302">PHY302: Quantum Mechanics</SelectItem>
                        <SelectItem value="BIO201">BIO201: Cell Biology</SelectItem>
                        <SelectItem value="MATH401">MATH401: Advanced Calculus</SelectItem>
                        <SelectItem value="ENG205">ENG205: Literature Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                    <FaceDetector videoRef={videoRef} onFaceDetectionChange={handleFaceDetectionChange} />
                  </>
                ) : capturedImage ? (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {recognitionStatus === "processing" && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing facial recognition...</p>
                </div>
              )}

              {recognitionStatus === "success" && user && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">Welcome, {user.name}!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <p>Successfully checked in at {new Date().toLocaleTimeString()}</p>
                    <p className="text-xs mt-1">
                      {userType === "student" ? "Student" : "Lecturer"} ID: {user.id}
                    </p>
                    <p className="text-xs">Department: {user.department}</p>
                    {user.course && <p className="text-xs">Course: {user.course}</p>}
                  </AlertDescription>
                </Alert>
              )}

              {recognitionStatus === "failed" && (
                <Alert variant="destructive">
                  <AlertTitle>Recognition Failed</AlertTitle>
                  <AlertDescription>
                    We couldn't verify your identity. Please try again or contact your administrator.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {!cameraActive && !capturedImage && (
                <Button onClick={() => setCameraActive(true)} className="w-full" disabled={!selectedCourse}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}

              {cameraActive && (
                <div className="flex w-full gap-2">
                  <Button variant="outline" onClick={() => setCameraActive(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={captureImage} className="flex-1" disabled={!faceDetected}>
                    Capture
                  </Button>
                </div>
              )}

              {capturedImage && (
                <Button
                  onClick={resetCapture}
                  variant={recognitionStatus === "success" ? "outline" : "default"}
                  className="w-full"
                  disabled={recognitionStatus === "processing"}
                >
                  {recognitionStatus === "success" ? "Done" : "Try Again"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </Tabs>
      </main>
    </div>
  )
}
