// components/sidebar-wrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/authContext';

const Sidebar = dynamic(() => import('@/components/sidebar'), {
  ssr: false,
  loading: () => (
    <div className="w-64 border-r bg-gray-50">
      <div className="h-16 border-b animate-pulse" />
      <div className="p-4 space-y-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
});

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

export default function SidebarWrapper() {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  const isPublicPage = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  if (isPublicPage || !isAuthenticated || loading) return null;

  return <Sidebar />;
}