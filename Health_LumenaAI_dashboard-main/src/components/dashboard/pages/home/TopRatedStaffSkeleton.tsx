import SkeletonBlock from "@/components/shared/SkeletonBlock";

export default function TopRatedStaffSkeleton() {
  return (
    <section className="mt-6 rounded-2xl border shadow-sm p-6 bg-white dark:bg-[#0e1116] dark:border-[#1f2937]">
      {/* Title skeleton */}
      <SkeletonBlock className="h-5 w-40 mb-4" />

      {/* List skeleton */}
      <ul className="grid gap-3 grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="
              rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50
              px-4 py-3
              flex flex-col gap-3
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <div className="flex items-center gap-3 w-full min-w-0">
              {/* Avatar skeleton */}
              <SkeletonBlock className="h-9 w-9 rounded-full shrink-0" />

              <div className="min-w-0 w-full">
                <SkeletonBlock className="h-4 w-32 mb-2 rounded-md" />
                <SkeletonBlock className="h-3 w-40 rounded-md" />
              </div>
            </div>

            {/* Rating skeleton */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <SkeletonBlock className="h-4 w-20 rounded-md" />
              <SkeletonBlock className="h-4 w-10 rounded-md" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
