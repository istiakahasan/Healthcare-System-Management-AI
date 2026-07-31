"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-black px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-blue-600/10 flex items-center justify-center">
            <Ghost className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-5xl font-semibold text-slate-900 dark:text-white mb-3">
          404
        </h1>
        <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">
          Page Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
          >
            <Link href="/dashboard/admin">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back home
            </Link>
          </Button>
          <Link
            href="/contact"
            className="text-sm text-blue-700 dark:text-blue-400 hover:underline"
          >
            Contact support
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-slate-500 dark:text-slate-400">
        LumenaAI Admin Dashboard © {new Date().getFullYear()}
      </p>
    </div>
  );
}
