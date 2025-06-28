"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { useAuth } from "@/context/authContext"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const isLoginPage = pathname === "/login"

  if (isLoginPage || !isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </ThemeProvider>
  )
}
