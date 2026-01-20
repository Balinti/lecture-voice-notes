'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import GoogleAuth from '@/components/GoogleAuth';

function AuthContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl">CiteDeck</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <h1 className="text-2xl font-bold text-center mb-2">
              Welcome to CiteDeck
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Sign in to access your study materials
            </p>

            <div className="flex justify-center mb-6">
              <GoogleAuth />
            </div>

            <p className="text-center text-sm text-gray-500">
              Sign in with your Google account to save your progress and access your flashcards from anywhere.
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/app" className="hover:underline">
              Continue without account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
