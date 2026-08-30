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
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-2xs glass-card">
      <div className="flex items-center space-x-4 mb-4 border-b border-slate-100 pb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
            Document Audit Vault
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
            Supports Microsoft Word (.docx) and PDF (.pdf) files up to 25MB
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Drag & Drop File Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition-all duration-200 hover-lift ${
            dragActive
              ? 'border-slate-900 bg-slate-100 shadow-md scale-[1.01]'
              : file
              ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/70'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            accept=".docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-2xl shadow-xs">
              📜
            </div>
            {file ? (
              <div className="space-y-1">
                <span className="font-serif font-bold text-emerald-900 text-base block">
                  {file.name}
                </span>
                <span className="text-xs text-slate-600 block font-mono">
                  {(file.size / 1024).toFixed(1)} KB — Click or drag to replace
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-sm sm:text-base block">
                  Click to select contract file or drag & drop here
                </span>
                <span className="text-xs text-slate-500 block max-w-md mx-auto leading-relaxed">
                  Supports Master Services Agreements, NDAs, SaaS licenses, and Vendor contracts
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Playbook Selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
            Target Playbook Ruleset
          </label>
          <select
            value={playbookName}
            onChange={(e) => setPlaybookName(e.target.value)}
            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
          >
            <option value="sample_vendor_msa">Standard Vendor MSA Playbook v2.1 (Default)</option>
          </select>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-800 font-bold shadow-2xs">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all hover-lift btn-tactile flex items-center justify-center gap-2.5"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Initializing Multi-Agent Audit Session...</span>
            </>
          ) : (
            <>
              <span>Start Automated Legal Audit</span>
              <span className="text-emerald-400">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
