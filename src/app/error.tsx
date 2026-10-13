"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="card max-w-md w-full p-8 space-y-5 shadow-lg border border-red-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto">
          ⚠️
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Application Error</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            {error?.message || "An unexpected error occurred while loading this section."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button variant="secondary" size="sm" onClick={() => reset()} className="w-full sm:w-auto">
            Try Again
          </Button>
          <Link href="/login">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              Return to Login →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
