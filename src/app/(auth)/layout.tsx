"use client";

import React from "react";
import Link from "next/link";
import { useBranding } from "@/context/BrandingContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-950 to-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header / Branding */}
      <header className="flex justify-center items-center">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-2 bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all shadow-lg"
        >
          <img
            src={`${branding.logoUrl}?v=${branding.cacheBuster}`}
            alt={branding.appName}
            className="w-12 h-12 object-contain rounded-lg bg-white p-1 shadow-md"
          />
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-white tracking-tight leading-tight">
              {branding.appName}
            </span>
            <span className="text-[11px] font-semibold text-blue-400 tracking-wider">
              {branding.tagline.split("•")[0]?.trim() || "Digital Recharge Platform"}
            </span>
          </div>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-md sm:max-w-lg">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-2">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>•</span>
          <span className="text-gray-400">Secure 256-bit SSL Banking Encryption</span>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Privacy
          </Link>
        </div>
        <p>© {new Date().getFullYear()} {branding.appName} Technologies Pvt Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
