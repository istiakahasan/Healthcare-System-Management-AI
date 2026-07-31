"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-black px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-red-600/10 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We’re sorry, but an unexpected error occurred. Please try again or
          return to the dashboard.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Try again
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/dashboard/admin">Go to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-slate-500 dark:text-slate-400">
        LumenaAI Admin Dashboard
      </p>
    </div>
  );
}
