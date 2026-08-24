'use client';

import React, { useState } from 'react';
import { uploadContract } from '@/lib/api';
import { SessionInitResponse } from '@/lib/types';

interface UploadCardProps {
  onUploadSuccess: (response: SessionInitResponse) => void;
}

export default function UploadCard({ onUploadSuccess }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [playbookName, setPlaybookName] = useState<string>('sample_vendor_msa');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx' && ext !== 'pdf') {
      setErrorMessage('Invalid file format. Please upload a .docx or .pdf contract document.');
      setFile(null);
      return;
    }
    if (selectedFile.size === 0) {
      setErrorMessage('The selected file is empty.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a contract file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const response = await uploadContract(file, playbookName);
      onUploadSuccess(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload contract.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Upload Contract for Multi-Agent Audit
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Upload your contract document (.docx or .pdf) to initiate automated risk auditing, playbook citation grounding, and tracked-changes redlining.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drag & Drop File Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : file
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            accept=".docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-3 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              📄
            </div>
            {file ? (
              <div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm block">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  {(file.size / 1024).toFixed(1)} KB — Click or drag to replace
                </span>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm block">
                  Click to choose a file
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  or drag & drop .docx / .pdf file here
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Playbook Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
            Target Playbook Ruleset
          </label>
          <select
            value={playbookName}
            onChange={(e) => setPlaybookName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sample_vendor_msa">Standard Vendor MSA Playbook (Default)</option>
          </select>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition shadow-sm flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Uploading Contract...
            </>
          ) : (
            'Upload & Create Review Session'
          )}
        </button>
      </form>
    </div>
  );
}
