'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FlashCard } from '@/components/FlashCard';
import { StudyGuide } from '@/components/StudyGuide';
import { CitationModal } from '@/components/CitationModal';

interface Citation {
  source: string;
  page?: number;
  snippet: string;
}

interface Card {
  id: string;
  front: string;
  back: string;
  why: string | null;
  citations: Citation[];
  status: string;
}

interface Guide {
  id: string;
  content_md: string;
  citations: Citation[];
}

interface Pack {
  id: string;
  title: string;
  status: string;
  is_paid: boolean;
  course_id: string;
}

interface Course {
  id: string;
  name: string;
}

export default function PackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  const [pack, setPack] = useState<Pack | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadPackData();
  }, [resolvedParams.id]);

  const loadPackData = async () => {
    try {
      // Fetch pack
      const { data: packData, error: packError } = await supabase
        .from('study_packs')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (packError || !packData) {
        setError('Pack not found');
        setLoading(false);
        return;
      }

      setPack(packData);

      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', packData.course_id)
        .single();

      if (courseData) {
        setCourse(courseData);
      }

      // Fetch cards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('pack_id', resolvedParams.id)
        .order('created_at', { ascending: true });

      if (cardsData) {
        setCards(cardsData.map((card: Card & { citations?: Citation[] }) => ({
          ...card,
          citations: card.citations || [],
        })));
      }

      // Fetch guide
      const { data: guideData } = await supabase
        .from('study_guides')
        .select('*')
        .eq('pack_id', resolvedParams.id)
        .single();

      if (guideData) {
        setGuide({
          ...guideData,
          citations: guideData.citations || [],
        });
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pack');
      setLoading(false);
    }
  };

  const handleExport = async (format: 'anki' | 'quizlet') => {
    if (!pack) return;

    setIsExporting(true);
    try {
      const response = await fetch(`/api/exports/${pack.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      // Download file
      const blob = new Blob([data.content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFlagCard = async (cardId: string, correction: string) => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/cards/${cardId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correction }),
      });

      if (!response.ok) {
        throw new Error('Regeneration failed');
      }

      const data = await response.json();

      // Update local state
      setCards(cards.map(card =>
        card.id === cardId ? { ...card, ...data.card, status: 'regenerated' } : card
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCheckout = async () => {
    if (!pack) return;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === 'Stripe not configured') {
          setShowUpgradePrompt(false);
          setError('Upgrades unavailable right now.');
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Pack not found'}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl">CiteDeck</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
              Dashboard
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900 text-sm">
              Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Success message */}
      {checkoutSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-6xl mx-auto text-green-700 text-sm">
            Payment successful! Your pack is now unlocked.
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Dashboard
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          {course && (
            <>
              <Link href={`/courses/${course.id}`} className="text-sm text-gray-500 hover:text-gray-700">
                {course.name}
              </Link>
              <span className="text-gray-400 mx-2">/</span>
            </>
          )}
          <span className="text-sm text-gray-900">{pack.title}</span>
        </div>

        {/* Pack header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">{pack.title}</h1>
            <p className="text-gray-600">
              {cards.length} flashcards • {pack.status}
              {pack.is_paid && <span className="ml-2 text-green-600">• Paid</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('anki')}
              disabled={isExporting}
              className="bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Export Anki
            </button>
            <button
              onClick={() => handleExport('quizlet')}
              disabled={isExporting}
              className="bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Export Quizlet
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Paywall - shown if not paid */}
        {!pack.is_paid && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-8">
            <h3 className="font-semibold text-lg mb-2">Unlock Full Pack</h3>
            <p className="text-gray-600 mb-4">
              Purchase this Exam Pack to unlock all cards, unlimited regenerations, and export options.
            </p>
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Unlock Pack
            </button>
          </div>
        )}

        {/* Study Guide */}
        {guide && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Study Guide</h2>
            <StudyGuide content={guide.content_md} onCitationClick={setSelectedCitation} />
          </div>
        )}

        {/* Flashcards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Flashcards ({cards.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <FlashCard
                key={card.id}
                id={card.id}
                front={card.front}
                back={card.back}
                why={card.why || undefined}
                citations={card.citations}
                status={card.status as 'active' | 'flagged' | 'regenerated'}
                onCitationClick={setSelectedCitation}
                onFlag={handleFlagCard}
                canRegenerate={!isRegenerating}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Citation modal */}
      <CitationModal citation={selectedCitation} onClose={() => setSelectedCitation(null)} />

      {/* Upgrade prompt modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradePrompt(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Upgrades Unavailable</h3>
            <p className="text-gray-600 mb-4">
              Payment processing is not configured at this time. Please try again later.
            </p>
            <button
              onClick={() => setShowUpgradePrompt(false)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
