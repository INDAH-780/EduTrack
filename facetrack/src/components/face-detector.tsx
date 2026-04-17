"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface FaceDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>
  onFaceDetectionChange: (detected: boolean) => void
}

export function FaceDetector({ videoRef, onFaceDetectionChange }: FaceDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceDetected, setFaceDetected] = useState(false)

  // This is a simplified face detection simulation
  // In a real app, you would use a library like face-api.js or connect to a backend
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    let animationFrameId: number
    let detectionInterval: NodeJS.Timeout

    const detectFace = () => {
      // This is a simplified simulation of face detection
      // In a real app, you would use actual face detection algorithms

      // Randomly determine if a face is detected (for demo purposes)
      // In a real app, this would be the result of actual face detection
      const detected = Math.random() > 0.3 // 70% chance of detecting a face for demo

      setFaceDetected(detected)
      onFaceDetectionChange(detected)

      // Draw the video frame on the canvas
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw a face detection box if a face is detected
        if (detected) {
          // Simulate a face detection box in the center of the frame
          const boxWidth = canvas.width * 0.5
          const boxHeight = canvas.height * 0.7
          const x = (canvas.width - boxWidth) / 2
          const y = (canvas.height - boxHeight) / 2

          context.strokeStyle = "#4ade80"
          context.lineWidth = 3
          context.strokeRect(x, y, boxWidth, boxHeight)

          // Draw face landmarks (simplified)
          context.fillStyle = "#4ade80"

          // Eyes
          const eyeSize = 5
          const eyeY = y + boxHeight * 0.3
          const leftEyeX = x + boxWidth * 0.3
          const rightEyeX = x + boxWidth * 0.7

          context.beginPath()
          context.arc(leftEyeX, eyeY, eyeSize, 0, 2 * Math.PI)
          context.fill()

          context.beginPath()
          context.arc(rightEyeX, eyeY, eyeSize, 0, 2 * Math.PI)
          context.fill()

          // Mouth
          const mouthY = y + boxHeight * 0.7
          const mouthWidth = boxWidth * 0.4
          const mouthX = x + (boxWidth - mouthWidth) / 2

          context.beginPath()
          context.moveTo(mouthX, mouthY)
          context.bezierCurveTo(
            mouthX + mouthWidth * 0.25,
            mouthY + 10,
            mouthX + mouthWidth * 0.75,
            mouthY + 10,
            mouthX + mouthWidth,
            mouthY,
          )
          context.stroke()
        }
      }

      animationFrameId = requestAnimationFrame(detectFace)
    }

    // Start detection when video is playing
    const handleVideoPlay = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Clear any existing animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Start the detection loop
      detectFace()
    }

    video.addEventListener("play", handleVideoPlay)

    // Periodically check if video is playing
    detectionInterval = setInterval(() => {
      if (video.readyState >= 3 && !video.paused && !video.ended) {
        handleVideoPlay()
        clearInterval(detectionInterval)
      }
    }, 100)

    return () => {
      video.removeEventListener("play", handleVideoPlay)
      clearInterval(detectionInterval)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [videoRef, onFaceDetectionChange])

  return <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full object-cover" />
}
