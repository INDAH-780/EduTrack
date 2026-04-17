"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/authContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "lecturer"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (requiredRole && user?.user_type !== requiredRole) {
        // Redirect to appropriate dashboard if wrong role
        router.push(`/${user?.user_type}/dashboard`)
        return
      }
    }
  }, [isAuthenticated, requiredRole, user, router, loading])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.user_type !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
