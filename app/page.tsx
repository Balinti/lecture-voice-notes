import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl">CiteDeck</span>
          </div>
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

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4">
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Turn your slides into<br />
            <span className="text-blue-600">cited flashcards</span> in minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your PDFs or paste lecture notes. Get source-cited study guides and
            Anki/Quizlet-ready decks. Fix mistakes in 10 seconds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/app"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
            >
              Try it now — Free
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 px-6 py-4 rounded-xl text-lg hover:text-gray-900 transition"
            >
              See how it works
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No signup required to start</p>
        </section>

        {/* Features */}
        <section id="how-it-works" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload or Paste</h3>
              <p className="text-gray-600">
                Drop your PDF slides or paste lecture notes. We extract the text while preserving
                page references for citations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Generate Preview</h3>
              <p className="text-gray-600">
                Get 10 flashcards and a short study guide instantly. Each fact links back to its
                source page so you can verify and learn in context.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Fix in 10 Seconds</h3>
              <p className="text-gray-600">
                See something wrong? Click "Fix" on any card, add your correction, and regenerate.
                Export to Anki or Quizlet when you're happy.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
              <h3 className="font-semibold text-xl mb-3">Source Citations</h3>
              <p className="text-gray-600 mb-4">
                Every flashcard and guide section includes [Source p.X] citations. Click to see the
                exact quote from your materials.
              </p>
              <div className="bg-white rounded-lg p-4 border text-sm">
                <p className="font-medium">What is mitosis?</p>
                <p className="text-gray-600 mt-2">
                  Cell division producing two identical daughter cells. <span className="text-blue-600">[Bio101 Slides p.24]</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl">
              <h3 className="font-semibold text-xl mb-3">Export Anywhere</h3>
              <p className="text-gray-600 mb-4">
                Download your cards as Anki-compatible TSV or Quizlet CSV. Import in seconds and
                start studying with your favorite tools.
              </p>
              <div className="flex gap-3">
                <div className="bg-white rounded-lg p-3 border flex-1 text-center">
                  <p className="font-medium text-sm">Anki</p>
                  <p className="text-xs text-gray-500">.tsv export</p>
                </div>
                <div className="bg-white rounded-lg p-3 border flex-1 text-center">
                  <p className="font-medium text-sm">Quizlet</p>
                  <p className="text-xs text-gray-500">.csv export</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to ace your next exam?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Start for free. No credit card needed.
            </p>
            <Link
              href="/app"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition inline-block"
            >
              Create Your First Deck
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>CiteDeck — Transform lectures into study-ready materials</p>
        </div>
      </footer>
    </div>
  );
}
