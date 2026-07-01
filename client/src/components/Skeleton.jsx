// Animated placeholder bar. Compose multiples to match the shape of real content.
export function SkeletonBar({ className = "" }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

// Pre-built skeleton for a stat card grid
export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
      <SkeletonBar className="h-3 w-24" />
      <SkeletonBar className="mt-3 h-8 w-16" />
    </div>
  );
}

// Pre-built skeleton for a list row (appointments, etc.)
export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-gray-100">
      <div className="flex-1 space-y-2">
        <SkeletonBar className="h-4 w-40" />
        <SkeletonBar className="h-3 w-56" />
      </div>
      <SkeletonBar className="h-6 w-20 rounded-full" />
    </div>
  );
}
