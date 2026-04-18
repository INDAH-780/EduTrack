"use client"

import { useAuth } from "@/context/authContext"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType, isAuthenticated, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Match the actual folder structure
      const expectedPath = userType ? `/(dashboard)/${userType}/dashboard` : null
      
      if (!isAuthenticated) {
        router.push('/login')
      } 
      // Check if current path doesn't match expected structure
      else if (expectedPath && !pathname.startsWith(`/(dashboard)/${userType}`)) {
        console.log(`Redirecting to: ${expectedPath}`)
        router.push(expectedPath)
      }
    }
  }, [isAuthenticated, loading, pathname, userType])

  if (loading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}