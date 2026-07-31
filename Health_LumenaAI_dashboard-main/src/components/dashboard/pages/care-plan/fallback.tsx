export const CarePlanCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white/60 p-6">
    <div className="flex justify-between items-start pb-4 border-b border-slate-100">
      <div className="h-6 w-40 bg-slate-200 rounded" />
      <div className="h-6 w-20 bg-slate-200 rounded-full" />
    </div>
    <div className="mt-4 space-y-3">
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="h-4 w-48 bg-slate-200 rounded" />
      <div className="h-4 w-40 bg-slate-200 rounded" />
    </div>
    <div className="flex gap-4 items-center justify-between">
      <div className="mt-5 h-10 w-full bg-slate-200 rounded-xl" />
      <div className="mt-5 h-10 w-full bg-slate-200 rounded-xl" />
    </div>
  </div>
);

export const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-white"
        fill="currentColor"
      >
        <path d="M12 2a5 5 0 0 1 5 5v1h1a4 4 0 1 1 0 8h-1v1a5 5 0 1 1-10 0v-1H6a4 4 0 1 1 0-8h1V7a5 5 0 0 1 5-5Z" />
      </svg>
    </div>
    <h4 className="text-lg font-semibold text-slate-900">No care plans yet</h4>
    <p className="text-slate-600">
      When you create a care plan, it’ll show up here.
    </p>
  </div>
);
