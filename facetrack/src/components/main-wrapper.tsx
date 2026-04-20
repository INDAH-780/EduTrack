'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/authContext';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  const isPublicPage = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const showSidebar = !isPublicPage && isAuthenticated && !loading;

  return (
    <div className={`flex-1 overflow-auto ${showSidebar ? 'ml-64' : ''}`}>
      {children}
    </div>
  );
}
