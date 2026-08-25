'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import SidebarNav from '@/components/SidebarNav';
import TopHeader from '@/components/TopHeader';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <LandingNavbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      <SidebarNav />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        <TopHeader />
        <main className="flex-1 flex flex-col p-6 lg:p-10 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
