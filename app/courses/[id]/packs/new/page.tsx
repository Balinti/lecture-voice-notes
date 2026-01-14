'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Course {
  id: string;
  name: string;
}

export default function NewPackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadCourse();
  }, [resolvedParams.id]);

  const loadCourse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, name')
        .eq('id', resolvedParams.id)
        .eq('user_id', user.id)
        .single();

      if (courseError || !courseData) {
        setError('Course not found');
        setPageLoading(false);
        return;
      }

      setCourse(courseData);
      setPageLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pastedText.trim() || !course) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      // Create pack
      const { data: pack, error: packError } = await supabase
        .from('study_packs')
        .insert({
          user_id: user.id,
          course_id: course.id,
          title: title.trim(),
          status: 'generating',
          is_paid: false,
        })
        .select()
        .single();

      if (packError || !pack) {
        setError(packError?.message || 'Failed to create pack');
        setLoading(false);
        return;
      }

      // Create document for pasted text
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          pack_id: pack.id,
          filename: 'Pasted Text',
          mime_type: 'text/plain',
        })
        .select()
        .single();

      if (!docError && doc) {
        // Create document page
        await supabase
          .from('document_pages')
          .insert({
            document_id: doc.id,
            page_number: 1,
            text: pastedText.trim(),
          });
      }

      // Generate content via API
      const response = await fetch(`/api/packs/${pack.id}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Even if generation fails, redirect to pack page
        console.error('Generation failed:', await response.text());
      }

      router.push(`/packs/${pack.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pack');
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
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
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Dashboard
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <Link href={`/courses/${course?.id}`} className="text-sm text-gray-500 hover:text-gray-700">
            {course?.name}
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-sm text-gray-900">New Pack</span>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h1 className="text-xl font-semibold mb-6">Create New Study Pack</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Pack Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Midterm 1 Review"
              />
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Paste Your Notes *
              </label>
              <textarea
                id="text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 h-64 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your lecture notes, slide text, or study materials here..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Copy text directly from your slides or notes for best results.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim() || !pastedText.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating & generating...
                </>
              ) : (
                'Create Pack & Generate Cards'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
