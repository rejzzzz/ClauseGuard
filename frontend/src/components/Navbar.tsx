'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { checkHealth } from '@/lib/api';

export default function Navbar() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifyBackendHealth() {
      try {
        const res = await checkHealth();
        setIsHealthy(res.status === 'ok');
      } catch {
        setIsHealthy(false);
      }
    }
    verifyBackendHealth();
    const interval = setInterval(verifyBackendHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
            C
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              ClauseGuard
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              v1.0
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
            <span className="text-gray-500 dark:text-gray-400">Backend API:</span>
            {isHealthy === null ? (
              <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Checking...
              </span>
            ) : isHealthy ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Connected
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
