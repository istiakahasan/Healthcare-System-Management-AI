import SkeletonBlock from "@/components/shared/SkeletonBlock";

export default function SettingsSkeleton() {
  return (
    <div className="w-full bg-gray-50 border rounded-2xl p-4 md:p-0">
      <div className="w-full p-6 md:p-10 bg-white">
        {/* Title */}
        <SkeletonBlock className="h-6 w-40 mb-8" />

        {/* IMAGE */}
        <div className="flex justify-start mb-6">
          <SkeletonBlock className="w-28 h-28 rounded-full!" />
        </div>

        {/* PROFILE FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-32" />
        </div>

        <hr className="my-10" />

        {/* PASSWORD TITLE */}
        <SkeletonBlock className="h-5 w-48 mb-6" />

        {/* PASSWORD FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
