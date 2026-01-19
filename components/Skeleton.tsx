'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function FlashCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden" aria-busy="true" aria-label="Loading flashcard">
      <div className="p-6 min-h-[200px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
        <div className="mt-auto pt-4">
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="border-t px-4 py-3 bg-gray-50">
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export function StudyGuideSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-6" aria-busy="true" aria-label="Loading study guide">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-4">
          <Skeleton className="h-5 w-40 mb-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-5 w-36 mb-3" />
          <div className="space-y-2 pl-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-4" role="status" aria-label="Loading flashcards">
      <span className="sr-only">Loading flashcards...</span>
      {Array.from({ length: count }).map((_, idx) => (
        <FlashCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function PreviewPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto" aria-busy="true" aria-label="Loading preview">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="mb-8">
        <Skeleton className="h-6 w-28 mb-4" />
        <StudyGuideSkeleton />
      </div>
      <div className="mb-8">
        <Skeleton className="h-6 w-36 mb-4" />
        <CardGridSkeleton count={4} />
      </div>
    </div>
  );
}
