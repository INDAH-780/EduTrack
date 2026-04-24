// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import SidebarWrapper from "@/components/sidebar-wrapper";
import MainWrapper from "@/components/main-wrapper";
import { ThemeProvider } from "@/components/theme-provider";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex h-screen">
              <SidebarWrapper />
              <MainWrapper>{children}</MainWrapper>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}