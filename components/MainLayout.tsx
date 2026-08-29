'use client';

import { useSidebar } from './SidebarContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={`min-h-screen pt-15 md:pt-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'md:pl-0' : 'md:pl-72'
      }`}
    >
      {children}
    </main>
  );
}
