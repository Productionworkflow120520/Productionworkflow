"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  };
  unreadNotifications?: number;
  onOpenMobileMenu?: () => void;
  className?: string;
}

export function Header({
  title,
  breadcrumbs = [],
  user = {
    name: "Admin User",
    email: "user@rechargepro.in",
    role: "ADMIN",
  },
  unreadNotifications = 3,
  onOpenMobileMenu,
  className,
}: HeaderProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      window.location.href = "/login";
    }
  };

  const getRolePrefix = () => {
    switch (user.role) {
      case "SUPER_ADMIN":
      case "MASTER_ADMIN":
        return "/super-admin";
      case "ADMIN":
        return "/admin";
      case "SUPER_DISTRIBUTOR":
        return "/super-distributor";
      case "MASTER_DISTRIBUTOR":
        return "/master-distributor";
      case "DISTRIBUTOR":
        return "/distributor";
      case "RETAILER":
        return "/retailer";
      default:
        return "";
    }
  };

  const rolePrefix = getRolePrefix();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 sm:px-6 backdrop-blur-sm shadow-xs",
        className
      )}
    >
      {/* Left side: Hamburger (mobile) + Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open sidebar menu"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex flex-col">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-xs text-gray-500 mb-0.5">
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-400">/</span>}
                  {bc.href ? (
                    <Link
                      href={bc.href}
                      className="hover:text-navy-600 transition-colors"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{bc.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {title && (
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {title}
            </h1>
          )}
        </div>
      </div>

      {/* Right side: Notifications + User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
            className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900">
                  Notifications
                </span>
                <span className="text-[11px] text-navy-600 font-medium cursor-pointer hover:underline">
                  Mark all as read
                </span>
              </div>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-gray-800">
                    Wallet auto-recharged
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    ₹5,000 credited to your main balance successfully.
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    10 minutes ago
                  </span>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-gray-800">
                    New KYC submission
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Retailer RT-0428 submitted Aadhaar & PAN for verification.
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    1 hour ago
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile menu dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-white font-semibold text-xs shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-900 leading-none">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-500 leading-none mt-1">
                {user.role ? (ROLE_LABELS[user.role] || user.role) : "User"}
              </span>
            </div>
            <svg
              className="h-4 w-4 text-gray-400 hidden sm:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">
                  {user.role ? (ROLE_LABELS[user.role] || user.role) : "User"}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href={`${rolePrefix}/profile`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-navy-600 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link
                  href={`${rolePrefix}/settings`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-navy-600 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export const HeaderMemo = React.memo(Header);
export default HeaderMemo;
