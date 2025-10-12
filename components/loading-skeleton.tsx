'use client';

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      </div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {[...Array(6)].map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  );
}

