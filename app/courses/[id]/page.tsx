'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Course {
  id: string;
  name: string;
  term: string | null;
  exam_date: string | null;
}

interface StudyPack {
  id: string;
  title: string;
  status: string;
  is_paid: boolean;
  created_at: string;
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [packs, setPacks] = useState<StudyPack[]>([]);
  const [loading, setLoading] = useState(true);
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
        .select('*')
        .eq('id', resolvedParams.id)
        .eq('user_id', user.id)
        .single();

      if (courseError || !courseData) {
        setError('Course not found');
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: packsData } = await supabase
        .from('study_packs')
        .select('*')
        .eq('course_id', resolvedParams.id)
        .order('created_at', { ascending: false });

      setPacks(packsData || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
      setLoading(false);
    }
  };

  const deleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course and all its study packs?')) {
      return;
    }

    try {
      await supabase.from('courses').delete().eq('id', resolvedParams.id);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Dashboard
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-sm text-gray-900">{course.name}</span>
        </div>

        {/* Course header */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{course.name}</h1>
              {(course.term || course.exam_date) && (
                <p className="text-gray-600">
                  {course.term}
                  {course.exam_date && ` • Exam: ${new Date(course.exam_date).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={deleteCourse}
                className="text-red-600 hover:text-red-700 text-sm px-3 py-2"
              >
                Delete course
              </button>
            </div>
          </div>
        </div>

        {/* Study packs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Study Packs</h2>
          <Link
            href={`/courses/${course.id}/packs/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            New Study Pack
          </Link>
        </div>

        {packs.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No study packs yet</h3>
            <p className="text-gray-600 mb-6">Create your first study pack to start generating flashcards.</p>
            <Link
              href={`/courses/${course.id}/packs/new`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block"
            >
              Create Study Pack
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {packs.map((pack) => (
              <Link
                key={pack.id}
                href={`/packs/${pack.id}`}
                className="bg-white border rounded-xl p-6 hover:border-blue-500 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{pack.title}</h3>
                  {pack.is_paid && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Paid</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 capitalize mb-2">{pack.status}</p>
                <p className="text-xs text-gray-400">
                  Created {new Date(pack.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
