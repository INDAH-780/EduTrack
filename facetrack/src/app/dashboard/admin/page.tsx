"use client";

import { useAuth } from "@/context/authContext";
import { BookOpen, GraduationCap, User, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAttendanceChart } from "@/components/admin/admin-attendance-chart";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";
import { AdminSystemOverview } from "@/components/admin/admin-system-overview";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, userType, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (userType !== "admin") {
      logout();
      router.push("/login");
    }
  }, [isAuthenticated, userType, router, logout]);

  if (!isAuthenticated || userType !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header with user info */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.name || 'Administrator'}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Students" 
            value="5,842" 
            change="+120 from last semester"
            icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
            title="Total Lecturers" 
            value="248" 
            change="+12 from last semester"
            icon={<User className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
            title="Active Courses" 
            value="342" 
            change="Current semester"
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
            title="System Health" 
            value="98.5%" 
            change="Uptime this month"
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            valueClassName="text-green-600"
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>System-wide Attendance Overview</CardTitle>
              <CardDescription>
                University attendance statistics across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAttendanceChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* System Management Tabs */}
        <SystemManagementTabs />
      </main>
    </div>
  );
}

// Component for stat cards
function StatCard({
  title,
  value,
  change,
  icon,
  valueClassName = ""
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

// Component for system management tabs
function SystemManagementTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="flex items-center">
        <h2 className="text-xl font-bold tracking-tight mr-4">System Management</h2>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="overview" className="border rounded-lg">
        <AdminSystemOverview />
      </TabsContent>
      
      <TabsContent value="alerts" className="border rounded-lg p-6">
        <div className="space-y-4">
          <AlertItem 
            type="warning" 
            title="Low Attendance Alert" 
            message="CS401 has attendance below 75% threshold" 
          />
          <AlertItem 
            type="info" 
            title="System Update Available" 
            message="New facial recognition model ready for deployment" 
          />
        </div>
      </TabsContent>
      
      <TabsContent value="performance" className="border rounded-lg p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Recognition Accuracy"
            value="97.8%"
            change="Last 30 days"
            valueClassName="text-green-600" icon={undefined}          />
          <StatCard 
            title="Average Response Time"
            value="1.2s"
            change="Recognition speed" icon={undefined}          />
          <StatCard 
            title="Daily Active Users"
            value="4,523"
            change="Today" icon={undefined}          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Component for alert items
function AlertItem({
  type,
  title,
  message
}: {
  type: "warning" | "info";
  title: string;
  message: string;
}) {
  const colors = {
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      title: "text-yellow-800",
      message: "text-yellow-700"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      title: "text-blue-800",
      message: "text-blue-700"
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 ${colors[type].bg} border ${colors[type].border} rounded-lg`}>
      <AlertTriangle className={`h-5 w-5 ${colors[type].icon}`} />
      <div>
        <p className={`font-medium ${colors[type].title}`}>{title}</p>
        <p className={`text-sm ${colors[type].message}`}>{message}</p>
      </div>
    </div>
  );
}