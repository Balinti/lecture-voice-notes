'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GoogleAuth from '@/components/GoogleAuth';
import { FlashCard } from '@/components/FlashCard';
import { StudyGuide } from '@/components/StudyGuide';
import { CitationModal } from '@/components/CitationModal';
import { SavePromptBanner } from '@/components/SavePromptBanner';
import {
  createLocalCourse,
  createLocalPack,
  addLocalMaterial,
  setLocalCards,
  setLocalGuide,
  getLocalCourses,
  getLocalPacks,
  getLocalMaterials,
  getLocalCards,
  getLocalGuide,
  updateLocalCard,
  canRegenerate,
  incrementRegeneration,
  getRegenerationsRemaining,
  hasDataToSave,
  LocalCourse,
  LocalStudyPack,
  LocalCard,
} from '@/lib/localStorage';

interface Citation {
  source: string;
  page?: number;
  snippet: string;
}

type Step = 'course' | 'pack' | 'materials' | 'preview';

export default function AppPage() {
  // State
  const [step, setStep] = useState<Step>('course');
  const [courses, setCourses] = useState<LocalCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<LocalCourse | null>(null);
  const [packs, setPacks] = useState<LocalStudyPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<LocalStudyPack | null>(null);
  const [cards, setCards] = useState<LocalCard[]>([]);
  const [guide, setGuide] = useState<string>('');

  // Form state
  const [courseName, setCourseName] = useState('');
  const [packTitle, setPackTitle] = useState('');
  const [pastedText, setPastedText] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [regenerationsLeft, setRegenerationsLeft] = useState(3);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadedCourses = getLocalCourses();
    setCourses(loadedCourses);
    setRegenerationsLeft(getRegenerationsRemaining());

    // If there's existing data, try to restore state
    if (loadedCourses.length > 0) {
      const lastCourse = loadedCourses[loadedCourses.length - 1];
      setSelectedCourse(lastCourse);
      const coursePacks = getLocalPacks(lastCourse.id);
      setPacks(coursePacks);
      if (coursePacks.length > 0) {
        const lastPack = coursePacks[coursePacks.length - 1];
        setSelectedPack(lastPack);
        const packCards = getLocalCards(lastPack.id);
        const packGuide = getLocalGuide(lastPack.id);
        if (packCards.length > 0) {
          setCards(packCards);
          setGuide(packGuide?.content || '');
          setStep('preview');
        } else {
          setStep('materials');
        }
      } else {
        setStep('pack');
      }
    }
  }, []);

  // Create course
  const handleCreateCourse = () => {
    if (!courseName.trim()) return;
    const course = createLocalCourse(courseName.trim());
    setCourses([...courses, course]);
    setSelectedCourse(course);
    setCourseName('');
    setStep('pack');
  };

  // Create pack
  const handleCreatePack = () => {
    if (!packTitle.trim() || !selectedCourse) return;
    const pack = createLocalPack(selectedCourse.id, packTitle.trim());
    setPacks([...packs, pack]);
    setSelectedPack(pack);
    setPackTitle('');
    setStep('materials');
  };

  // Generate preview
  const handleGeneratePreview = async () => {
    if (!pastedText.trim() || !selectedPack) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Save material
      addLocalMaterial(selectedPack.id, pastedText.trim());

      // Call preview API
      const response = await fetch('/api/packs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText.trim(),
          title: selectedPack.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();

      // Save to localStorage
      const savedCards = setLocalCards(
        selectedPack.id,
        data.cards.map((card: { front: string; back: string; why?: string; citations: Citation[] }) => ({
          front: card.front,
          back: card.back,
          why: card.why,
          citations: card.citations || [],
          status: 'active' as const,
        }))
      );
      setCards(savedCards);

      setLocalGuide(selectedPack.id, data.guide, []);
      setGuide(data.guide);

      setStep('preview');
      setShowSavePrompt(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle card flag/regeneration
  const handleFlagCard = async (cardId: string, correction: string) => {
    if (!canRegenerate()) {
      setError('Sign up to regenerate more cards');
      return;
    }

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Call API for single card regeneration
      const response = await fetch('/api/packs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Original question: ${card.front}\nOriginal answer: ${card.back}\nCorrection: ${correction}\n\nPlease regenerate this flashcard with the correction applied.`,
          title: 'Card Correction',
          cardCount: 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate card');

      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        const newCard = data.cards[0];
        const updatedCard = updateLocalCard(cardId, {
          front: newCard.front,
          back: newCard.back,
          why: newCard.why,
          citations: newCard.citations || [],
          status: 'regenerated',
        });

        if (updatedCard) {
          setCards(cards.map((c) => (c.id === cardId ? updatedCard : c)));
        }

        incrementRegeneration();
        setRegenerationsLeft(getRegenerationsRemaining());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 'course':
        return (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Create a Course</h2>
              <p className="text-gray-600 mb-6">
                Give your course a name (e.g., "Biology 101" or "Econ Midterm")
              </p>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Course name"
                className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
              />
              <button
                onClick={handleCreateCourse}
                disabled={!courseName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>

            {courses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Or select existing course</h3>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setPacks(getLocalPacks(course.id));
                        setStep('pack');
                      }}
                      className="w-full text-left bg-white border rounded-lg p-4 hover:border-blue-500 transition"
                    >
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-gray-500">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'pack':
        return (
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setStep('course')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to courses
              </button>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <p className="text-sm text-gray-500 mb-2">Course: {selectedCourse?.name}</p>
              <h2 className="text-xl font-semibold mb-4">Create a Study Pack</h2>
              <p className="text-gray-600 mb-6">
                Name your study pack (e.g., "Midterm 1" or "Chapter 5 Review")
              </p>
              <input
                type="text"
                value={packTitle}
                onChange={(e) => setPackTitle(e.target.value)}
                placeholder="Study pack title"
                className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePack()}
              />
              <button
                onClick={handleCreatePack}
                disabled={!packTitle.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>

            {packs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Or select existing pack</h3>
                <div className="space-y-2">
                  {packs.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => {
                        setSelectedPack(pack);
                        const packCards = getLocalCards(pack.id);
                        const packGuide = getLocalGuide(pack.id);
                        if (packCards.length > 0) {
                          setCards(packCards);
                          setGuide(packGuide?.content || '');
                          setStep('preview');
                        } else {
                          setStep('materials');
                        }
                      }}
                      className="w-full text-left bg-white border rounded-lg p-4 hover:border-blue-500 transition"
                    >
                      <p className="font-medium">{pack.title}</p>
                      <p className="text-sm text-gray-500">
                        {pack.status === 'preview' ? 'Preview generated' : 'Draft'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'materials':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setStep('pack')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to packs
              </button>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <p className="text-sm text-gray-500 mb-2">
                {selectedCourse?.name} / {selectedPack?.title}
              </p>
              <h2 className="text-xl font-semibold mb-4">Add Your Materials</h2>

              <div className="space-y-6">
                {/* Paste text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your lecture notes or text
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your lecture notes, slide text, or study materials here..."
                    className="w-full border rounded-lg px-4 py-3 h-64 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tip: Copy text directly from your slides or notes for best results.
                  </p>
                </div>

                {/* PDF upload placeholder */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    PDF upload available with free account
                  </p>
                  <Link href="/auth?mode=signup" className="text-blue-600 text-sm hover:underline">
                    Sign up to upload PDFs
                  </Link>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGeneratePreview}
                  disabled={!pastedText.trim() || isGenerating}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating preview...
                    </>
                  ) : (
                    'Generate Preview'
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setStep('materials')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Add more materials
              </button>
              <div className="text-sm text-gray-500">
                {regenerationsLeft} regenerations remaining
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">
                {selectedCourse?.name} / {selectedPack?.title}
              </p>
              <h2 className="text-2xl font-semibold">Your Study Preview</h2>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {/* Study Guide */}
            {guide && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Study Guide</h3>
                <StudyGuide content={guide} onCitationClick={setSelectedCitation} />
              </div>
            )}

            {/* Flashcards */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Flashcards ({cards.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <FlashCard
                    key={card.id}
                    id={card.id}
                    front={card.front}
                    back={card.back}
                    why={card.why}
                    citations={card.citations}
                    status={card.status}
                    onCitationClick={setSelectedCitation}
                    onFlag={handleFlagCard}
                    canRegenerate={canRegenerate()}
                  />
                ))}
              </div>
            </div>

            {/* Export / Upgrade section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-lg mb-2">Ready to export?</h3>
              <p className="text-gray-600 mb-4">
                Create a free account to export your cards to Anki or Quizlet, upload PDFs, and save your progress.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/auth?mode=signup"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Sign up free
                </Link>
                <Link href="/auth" className="text-gray-600 px-4 py-2 hover:text-gray-900">
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

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
            <GoogleAuth />
          </nav>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className={step === 'course' ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              1. Course
            </span>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={step === 'pack' ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              2. Study Pack
            </span>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={step === 'materials' ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              3. Materials
            </span>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={step === 'preview' ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              4. Preview
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="py-8 px-4">
        {renderStep()}
      </main>

      {/* Citation modal */}
      <CitationModal citation={selectedCitation} onClose={() => setSelectedCitation(null)} />

      {/* Save prompt banner */}
      <SavePromptBanner show={showSavePrompt && hasDataToSave()} />
    </div>
  );
}
