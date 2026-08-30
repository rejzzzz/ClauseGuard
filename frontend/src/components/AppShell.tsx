'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import SidebarNav from '@/components/SidebarNav';
import TopHeader from '@/components/TopHeader';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <SidebarNav mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        <TopHeader onToggleMobile={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 flex flex-col px-6 lg:px-10 py-6 lg:py-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
