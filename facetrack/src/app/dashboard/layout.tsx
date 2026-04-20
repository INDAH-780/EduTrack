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
      if (!isAuthenticated) {
        router.push('/login')
      } else if (userType && !pathname.startsWith(`/dashboard/${userType}`)) {
        router.push(`/dashboard/${userType}`)
      }
    }
  }, [isAuthenticated, loading, pathname, userType, router])

  if (loading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}