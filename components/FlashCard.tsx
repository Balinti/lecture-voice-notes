'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { KEYBOARD_KEYS } from '@/lib/constants';

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

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
      e.preventDefault();
      handleFlip();
    }
  }, [handleFlip]);

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div
        className="p-6 cursor-pointer min-h-[200px] flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-pressed={isFlipped}
        aria-label={isFlipped ? `Answer: ${back}. Press Enter or Space to show question.` : `Question: ${front}. Press Enter or Space to reveal answer.`}
      >
        {!isFlipped ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Question</span>
              {status === 'flagged' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded" role="status">
                  Flagged
                </span>
              )}
              {status === 'regenerated' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded" role="status">
                  Updated
                </span>
              )}
            </div>
            <p className="text-lg font-medium text-gray-900 flex-1">{front}</p>
            <p className="text-sm text-gray-400 mt-4" aria-hidden="true">Click or press Enter to reveal answer</p>
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
              <div className="flex flex-wrap gap-2 mt-3" role="list" aria-label="Citations">
                {citations.map((citation, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCitationClick(citation);
                    }}
                    className="text-xs text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={`View citation from ${citation.source}${citation.page ? `, page ${citation.page}` : ''}`}
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
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              disabled={!canRegenerate}
              aria-label={!canRegenerate ? 'Sign up to regenerate more cards' : 'Flag this card for correction'}
              title={!canRegenerate ? 'Sign up to regenerate more cards' : 'Flag this card for correction'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Wrong/Unclear
            </button>
          ) : (
            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              <label htmlFor={`correction-${id}`} className="sr-only">Describe what is wrong with this card</label>
              <input
                id={`correction-${id}`}
                type="text"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === KEYBOARD_KEYS.ENTER) {
                    handleFlag();
                  } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
                    setShowFlagInput(false);
                    setCorrection('');
                  }
                }}
                placeholder="What's wrong?"
                className="text-sm border rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleFlag}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Fix
              </button>
              <button
                onClick={() => {
                  setShowFlagInput(false);
                  setCorrection('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
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
