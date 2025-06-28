// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import SidebarWrapper from "@/components/sidebar-wrapper"; // Changed import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduTrack",
  description: "EduTrack admin dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <div className="flex h-screen">
            {/* Use the client-side wrapper */}
            <SidebarWrapper />
            <div className="flex-1 overflow-auto ml-64">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}