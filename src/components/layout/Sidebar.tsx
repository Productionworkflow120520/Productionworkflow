"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { useBranding } from "@/context/BrandingContext";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  menuItems: MenuItem[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsedDesktop?: boolean;
  onToggleDesktop?: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  };
}

export function Sidebar({
  menuItems,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsedDesktop = false,
  onToggleDesktop,
  user = {
    name: "Admin User",
    email: "user@rechargepro.in",
    role: "ADMIN",
  },
}: SidebarProps) {
  const { branding } = useBranding();
  const rawPathname = usePathname();
  const pathname = rawPathname || "";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-navy-900 text-white transition-all duration-200 ease-out border-r border-navy-800 shadow-xl gpu-composite",
          // Width based on collapsed state on desktop
          isCollapsedDesktop ? "lg:w-20" : "lg:w-64",
          // Mobile responsive slide-over
          isOpenMobile
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0 w-64"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-navy-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden text-white font-bold tracking-tight"
          >
            <img
              src={`${branding.logoUrl}?v=${branding.cacheBuster}`}
              alt={branding.appName}
              className="h-9 w-9 shrink-0 object-contain rounded-lg bg-white p-0.5 shadow-md"
            />
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-black tracking-tight text-white truncate leading-tight">
                  {branding.appName}
                </span>
                <span className="text-[10px] text-gray-400 font-medium truncate leading-tight">
                  {branding.tagline.split("•")[0]?.trim() || "Recharge & Payments"}
                </span>
              </div>
            )}
          </Link>


          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="rounded-lg p-1 text-gray-400 hover:bg-navy-800 hover:text-white lg:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/master-admin" &&
                item.href !== "/distributor" &&
                item.href !== "/retailer" &&
                pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsedDesktop ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative active:scale-[0.98] select-none fast-tap",
                  isActive
                    ? "bg-navy-600 text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:bg-navy-800 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center text-lg",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}
                >
                  {item.icon}
                </span>

                {(!isCollapsedDesktop || isOpenMobile) && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}

                {(!isCollapsedDesktop || isOpenMobile) && item.badge !== undefined && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-navy-800 text-navy-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex px-3 py-2 border-t border-navy-800 justify-end">
          <button
            type="button"
            onClick={onToggleDesktop}
            className="flex items-center gap-2 p-2 rounded-lg text-xs text-gray-400 hover:bg-navy-800 hover:text-white transition-colors w-full justify-center"
            title={isCollapsedDesktop ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isCollapsedDesktop && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            {!isCollapsedDesktop && <span>Collapse Sidebar</span>}
          </button>
        </div>

        {/* User Info Footer */}
        <div className="border-t border-navy-800 p-3 bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 font-semibold text-white text-sm ring-2 ring-navy-600">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {(!isCollapsedDesktop || isOpenMobile) && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-[11px] text-navy-300 truncate">
                    {user.role ? (ROLE_LABELS[user.role] || user.role) : "User"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export const SidebarMemo = React.memo(Sidebar);
export default SidebarMemo;
