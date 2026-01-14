import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface Course {
  id: string;
  name: string;
  term: string | null;
  exam_date: string | null;
  created_at: string;
}

interface StudyPack {
  id: string;
  course_id: string;
  title: string;
  status: string;
  is_paid: boolean;
  created_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Setup Required</h1>
          <p className="text-gray-600">Supabase is not configured. Please add environment variables.</p>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch packs
  const { data: packs } = await supabase
    .from('study_packs')
    .select('*')
    .order('created_at', { ascending: false });

  const courseList = (courses || []) as Course[];
  const packList = (packs || []) as StudyPack[];

  // Group packs by course
  const packsByCourse = packList.reduce<Record<string, StudyPack[]>>((acc, pack) => {
    if (!acc[pack.course_id]) {
      acc[pack.course_id] = [];
    }
    acc[pack.course_id].push(pack);
    return acc;
  }, {});

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
            <Link href="/account" className="text-gray-600 hover:text-gray-900 text-sm">
              Account
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-gray-600 hover:text-gray-900 text-sm">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here are your courses and study packs.</p>
          </div>
          <Link
            href="/courses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            New Course
          </Link>
        </div>

        {courseList.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-gray-600 mb-6">Create your first course to start generating study materials.</p>
            <Link
              href="/courses/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block"
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {courseList.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{course.name}</h2>
                      {(course.term || course.exam_date) && (
                        <p className="text-sm text-gray-500">
                          {course.term}
                          {course.exam_date && ` • Exam: ${new Date(course.exam_date).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Manage course
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {packsByCourse[course.id]?.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {packsByCourse[course.id].map((pack) => (
                        <Link
                          key={pack.id}
                          href={`/packs/${pack.id}`}
                          className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-sm transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{pack.title}</h3>
                            {pack.is_paid && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Paid</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 capitalize">{pack.status}</p>
                        </Link>
                      ))}
                      <Link
                        href={`/courses/${course.id}/packs/new`}
                        className="block p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition text-center"
                      >
                        <span className="text-gray-500">+ New Study Pack</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No study packs yet</p>
                      <Link
                        href={`/courses/${course.id}/packs/new`}
                        className="text-blue-600 hover:underline"
                      >
                        Create your first study pack
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
