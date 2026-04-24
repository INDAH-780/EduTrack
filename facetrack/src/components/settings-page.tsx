'use client';

import { useAuth } from '@/context/authContext';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor, User, Mail, Shield, BookOpen, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, userType, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark',  label: 'Dark',  icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white dark:bg-gray-900 dark:border-gray-700 px-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-2xl">

        {/* Profile card */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="h-5 w-5 text-blue-500" /> Profile
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name ?? '—'}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 capitalize">
                  <Shield className="h-3 w-3" /> {userType ?? '—'}
                </span>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <InfoRow icon={<Mail className="h-4 w-4 text-gray-400" />} label="Email" value={user?.email ?? '—'} />
              <InfoRow
                icon={<Shield className="h-4 w-4 text-gray-400" />}
                label="Role"
                value={userType === 'admin' ? 'Administrator' : 'Lecturer'}
              />
              <InfoRow
                icon={<BookOpen className="h-4 w-4 text-gray-400" />}
                label="Account ID"
                value={userType === 'admin' ? (user as any)?.admin_id : (user as any)?.lecturer_id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance card */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              {mounted && theme === 'dark'
                ? <Moon className="h-5 w-5 text-blue-400" />
                : <Sun className="h-5 w-5 text-yellow-500" />}
              Appearance
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Choose how EduTrack looks for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ value, label, icon: Icon }) => {
                const active = mounted && theme === value;
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer
                      ${active
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                      }`}
                  >
                    <Icon className={`h-6 w-6 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className={`text-sm font-medium ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {label}
                    </span>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {mounted && theme === 'system' ? 'Following your device preference.' : `Currently using ${theme} mode.`}
            </p>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      {icon}
      <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{value ?? '—'}</span>
    </div>
  );
}
