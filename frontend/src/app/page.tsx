'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UploadCard from '@/components/UploadCard';
import { SessionInitResponse } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();

  const handleUploadSuccess = (res: SessionInitResponse) => {
    // Redirect to review workspace for the created session
    router.push(`/review/${res.session_id}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="text-center max-w-2xl mb-8 space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          Autonomous Contract Auditing & Tracked-Changes Redlining
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Upload any vendor contract or Master Services Agreement (.docx or .pdf) to perform structure-aware playbook auditing, reasoning trace citation grounding, and automated OOXML redlining.
        </p>
      </div>

      <UploadCard onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}
