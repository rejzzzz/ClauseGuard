'use client';

import React, { useState } from 'react';
import { uploadCaseDocument, deleteCaseDocument } from '@/lib/api';
import { CaseDocumentItem } from '@/lib/types';

interface Props {
  caseId: string;
  documents: CaseDocumentItem[];
  onDocumentChange: () => void;
}

export default function CaseDocumentUploader({ caseId, documents, onDocumentChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('evidence');
  const [dragActive, setDragActive] = useState(false);

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      alert('Only .pdf and .docx files are supported.');
      return;
    }

    setUploading(true);
    try {
      await uploadCaseDocument(caseId, file, selectedCategory);
      onDocumentChange();
    } catch (err) {
      alert('Document upload failed: ' + String(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string, filename: string) {
    if (!confirm(`Delete document "${filename}" from case?`)) return;
    try {
      await deleteCaseDocument(caseId, docId);
      onDocumentChange();
    } catch (err) {
      alert('Failed to delete document: ' + String(err));
    }
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="font-serif font-bold text-slate-900 text-sm">
            Case Vault & Ingestion ({documents.length})
          </h2>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
        >
          <option value="pleading">Pleading / Suit</option>
          <option value="evidence">Evidence / Exhibit</option>
          <option value="contract">Contract / Agreement</option>
          <option value="correspondence">Notice / Letter</option>
          <option value="uncategorized">Uncategorized</option>
        </select>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
          dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
        }`}
      >
        <input
          type="file"
          id="doc-upload-input"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <label htmlFor="doc-upload-input" className="cursor-pointer space-y-1 block">
          <div className="text-xs font-bold text-slate-800">
            {uploading ? 'Ingesting Document & Generating Vector Chunks...' : '+ Upload Case File (.pdf, .docx)'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Drag files here or click to browse
          </div>
        </label>
      </div>

      {/* Document List */}
      <div className="space-y-2 overflow-y-auto max-h-[420px] flex-1 pr-1">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-white transition-all group"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-xs text-slate-800 truncate">
                    {doc.filename}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-200 text-slate-700">
                    {doc.doc_category}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-1">
                  <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  <span>{doc.chunk_count} vector chunks</span>
                  <span>·</span>
                  <span
                    className={`font-bold ${
                      doc.ingestion_status === 'COMPLETED'
                        ? 'text-emerald-600'
                        : doc.ingestion_status === 'PROCESSING'
                        ? 'text-indigo-600 animate-pulse'
                        : 'text-red-500'
                    }`}
                  >
                    {doc.ingestion_status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(doc.id, doc.filename)}
                title="Remove document"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            No case files uploaded yet. Upload evidence or pleadings to begin AI research.
          </div>
        )}
      </div>
    </div>
  );
}
