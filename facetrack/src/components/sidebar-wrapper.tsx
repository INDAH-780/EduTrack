// components/sidebar-wrapper.tsx
'use client';

import dynamic from 'next/dynamic';

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

export default function SidebarWrapper() {
  return <Sidebar />;
}