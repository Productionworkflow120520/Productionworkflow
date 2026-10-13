"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="card max-w-md w-full p-8 space-y-5 shadow-lg border border-gray-200">
        <div className="w-16 h-16 bg-navy-50 text-navy-500 rounded-2xl flex items-center justify-center text-3xl mx-auto">
          🔍
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-gray-800 mt-1">Page Not Found</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            The page or resource you requested could not be located. It may have been moved or you might need to sign in again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link href="/">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              Go to Login / Dashboard →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
