"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/authContext"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, userType, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && userType) {
        router.push(`/dashboard/${userType}`)
      } else {
        // If not logged in, redirect to login
        router.push("/login")
      }
    }
  }, [isAuthenticated, userType, router, loading])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return null // Just shows blank while redirecting
}
