'use client';

import { useEffect } from 'react';

interface Citation {
  source: string;
  page?: number;
  snippet: string;
}

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export function CitationModal({ citation, onClose }: CitationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!citation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Source Citation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <p className="font-medium">{citation.source}</p>
          </div>
          {citation.page && (
            <div>
              <p className="text-sm text-gray-500">Page</p>
              <p className="font-medium">{citation.page}</p>
            </div>
          )}
          {citation.snippet && (
            <div>
              <p className="text-sm text-gray-500">Excerpt</p>
              <blockquote className="bg-gray-50 border-l-4 border-blue-500 pl-4 py-2 text-gray-700 italic">
                "{citation.snippet}"
              </blockquote>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
