'use client';

import React, { useState, useEffect } from 'react';
import { checkHealth } from '@/lib/api';

export default function ApiStatusBadge() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((data) => {
        if (isMounted) setIsOnline(data && (data.status === 'ok' || data.status === 'healthy'));
      })
      .catch(() => {
        if (isMounted) setIsOnline(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-mono">
      <span className="text-slate-500 font-medium hidden sm:inline">Backend API:</span>
      {isOnline === null ? (
        <span className="text-amber-600 font-bold animate-pulse">Connecting...</span>
      ) : isOnline ? (
        <span className="flex items-center text-emerald-700 font-extrabold space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>FastAPI Online</span>
        </span>
      ) : (
        <span className="flex items-center text-slate-600 font-bold space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>Standalone Demo</span>
        </span>
      )}
    </div>
  );
}
