import Link from 'next/link';

export default function PricingPage() {
  const examPackEnabled = !!process.env.NEXT_PUBLIC_STRIPE_EXAM_PACK_PRICE_ID;

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
            <Link href="/auth" className="text-gray-600 hover:text-gray-900 text-sm">
              Sign in
            </Link>
            <Link
              href="/app"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Try it now
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
          <p className="text-xl text-gray-600">
            Start free, pay only when you need the full pack.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free tier */}
          <div className="bg-white rounded-2xl border p-8">
            <h2 className="text-xl font-semibold mb-2">Free Preview</h2>
            <p className="text-3xl font-bold mb-4">$0</p>
            <p className="text-gray-600 mb-6">Try before you buy</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>10 flashcards preview</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Short study guide</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>3 card regenerations</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No signup required</span>
              </li>
            </ul>
            <Link
              href="/app"
              className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Try for free
            </Link>
          </div>

          {/* Exam Pack */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              Best Value
            </div>
            <h2 className="text-xl font-semibold mb-2">Exam Pack</h2>
            <p className="text-3xl font-bold mb-4">$4.99</p>
            <p className="text-gray-600 mb-6">Per study pack</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Up to 50 flashcards</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Full study guide</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited regenerations</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Export to Anki & Quizlet</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Source citations</span>
              </li>
            </ul>
            {examPackEnabled ? (
              <Link
                href="/app"
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Get started
              </Link>
            ) : (
              <div className="text-center text-gray-500 text-sm py-3">
                Upgrades unavailable right now
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Questions?</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                You pay once per study pack. No subscriptions, no hidden fees. Generate as many cards as you need for that exam.
              </p>
            </div>
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-2">Can I try before buying?</h3>
              <p className="text-gray-600">
                Absolutely! Generate a 10-card preview for free without signing up. Only pay when you want the full pack.
              </p>
            </div>
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-2">What formats can I export to?</h3>
              <p className="text-gray-600">
                Export your flashcards to Anki (TSV) or Quizlet (CSV) format. Import them directly into your favorite study app.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>CiteDeck — Transform lectures into study-ready materials</p>
        </div>
      </footer>
    </div>
  );
}
