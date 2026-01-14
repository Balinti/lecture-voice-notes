'use client';

import { useState } from 'react';

interface Citation {
  source: string;
  page?: number;
  snippet: string;
}

interface FlashCardProps {
  id: string;
  front: string;
  back: string;
  why?: string;
  citations: Citation[];
  status: 'active' | 'flagged' | 'regenerated';
  onCitationClick: (citation: Citation) => void;
  onFlag: (id: string, correction: string) => void;
  canRegenerate: boolean;
}

export function FlashCard({
  id,
  front,
  back,
  why,
  citations,
  status,
  onCitationClick,
  onFlag,
  canRegenerate,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [correction, setCorrection] = useState('');

  const handleFlag = () => {
    if (correction.trim()) {
      onFlag(id, correction);
      setShowFlagInput(false);
      setCorrection('');
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div
        className="p-6 cursor-pointer min-h-[200px] flex flex-col"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Question</span>
              {status === 'flagged' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Flagged</span>
              )}
              {status === 'regenerated' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Updated</span>
              )}
            </div>
            <p className="text-lg font-medium text-gray-900 flex-1">{front}</p>
            <p className="text-sm text-gray-400 mt-4">Click to reveal answer</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Answer</span>
            </div>
            <p className="text-gray-800 flex-1">{back}</p>
            {why && (
              <p className="text-sm text-gray-500 mt-3 italic">Why: {why}</p>
            )}
            {citations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {citations.map((citation, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCitationClick(citation);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    [{citation.source}{citation.page ? ` p.${citation.page}` : ''}]
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div className="flex gap-2">
          {!showFlagInput ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFlagInput(true);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              disabled={!canRegenerate}
              title={!canRegenerate ? 'Sign up to regenerate more cards' : 'Flag this card for correction'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Wrong/Unclear
            </button>
          ) : (
            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                placeholder="What's wrong?"
                className="text-sm border rounded px-2 py-1 w-40"
                autoFocus
              />
              <button
                onClick={handleFlag}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Fix
              </button>
              <button
                onClick={() => {
                  setShowFlagInput(false);
                  setCorrection('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
