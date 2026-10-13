"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useBranding, BrandingData } from "@/context/BrandingContext";

interface AuditEntry {
  id: string;
  action: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  fieldChanged: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export function BrandingSettingsManager({ userRole = "SUPER_ADMIN" }: { userRole?: string }) {
  const { branding, refreshBranding } = useBranding();

  // Form State
  const [formData, setFormData] = useState<BrandingData>(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "logos" | "login" | "audit" | "mobile_notice">("general");

  const webLogoInputRef = useRef<HTMLInputElement>(null);
  const mobileLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = userRole.toUpperCase() === "SUPER_ADMIN" || userRole.toUpperCase() === "MASTER_ADMIN";
  const canEdit = isSuperAdmin || userRole.toUpperCase() === "ADMIN";

  // Sync initial branding into form
  useEffect(() => {
    setFormData(branding);
  }, [branding]);

  // Fetch audit history
  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/branding/history?limit=25");
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.history || []);
      }
    } catch (e) {
      console.error("Failed to load audit history:", e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleChange = (field: keyof BrandingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(branding);
    setFeedback({ type: "success", message: "Form changes reset to current saved branding." });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update branding settings");
      }

      await refreshBranding();
      setFeedback({
        type: "success",
        message: "Branding updated successfully! All website and mobile app screens now reflect the new brand in real time.",
      });
      fetchAuditLogs();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "An unexpected error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setIsRestoring(true);
    setShowRestoreModal(false);
    setFeedback(null);

    try {
      const res = await fetch("/api/branding/restore", {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to restore defaults");
      }

      await refreshBranding();
      setFormData(json.data);
      setFeedback({
        type: "success",
        message: "Default Recharge Pro branding restored successfully across all channels!",
      });
      fetchAuditLogs();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to restore defaults." });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "web_logo" | "mobile_logo" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setFeedback({
        type: "error",
        message: "Invalid image format. Supported formats: PNG, JPG, WebP, SVG.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: `Image size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 2MB limit.`,
      });
      return;
    }

    setIsUploading(category);
    setFeedback(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("category", category);

      const res = await fetch("/api/branding/upload", {
        method: "POST",
        body,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      await refreshBranding();
      const updatedField =
        category === "favicon"
          ? "faviconUrl"
          : category === "mobile_logo"
            ? "mobileLogoUrl"
            : "logoUrl";

      setFormData((prev) => ({ ...prev, [updatedField]: json.url }));
      setFeedback({
        type: "success",
        message: `${category.replace("_", " ").toUpperCase()} uploaded and applied live!`,
      });
      fetchAuditLogs();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Upload failed" });
    } finally {
      setIsUploading(null);
      if (e.target) e.target.value = "";
    }
  };

  if (!canEdit) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-red-100 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Prohibited</h2>
        <p className="text-gray-600 text-sm">
          Branding customization requires Super Administrator or authorized Administrator privileges.
          Your current account does not have sufficient role permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-2xl p-6 text-white shadow-xl border border-navy-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-blue-400/20">
            <span>✨</span> Dynamic White-Label Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Branding & Identity Studio
          </h1>
          <p className="text-gray-300 text-sm mt-1 max-w-2xl">
            Configure application name, logos, and portal theme. Updates apply instantly across website, web dashboard, and mobile apps without rebuilding or redeployment.
          </p>
        </div>

        {/* Live Brand Badge Preview */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3 shrink-0">
          <img
            src={`${formData.logoUrl}?v=${branding.cacheBuster}`}
            alt="Brand Logo"
            className="w-12 h-12 object-contain rounded-lg bg-white p-1"
          />
          <div>
            <div className="text-xs text-gray-400 font-medium">Active Brand</div>
            <div className="text-base font-bold text-white tracking-tight">{formData.appName}</div>
            <div className="text-[10px] text-emerald-400 font-medium">Version {branding.version} Live</div>
          </div>
        </div>
      </div>

      {/* Feedback Toast / Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span className="text-xl">{feedback.type === "success" ? "✅" : "⚠️"}</span>
          <div className="text-sm font-medium leading-relaxed">{feedback.message}</div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
        {[
          { key: "general", label: "General Branding", icon: "⚙️" },
          { key: "logos", label: "Logo & Favicon Studio", icon: "🎨" },
          { key: "login", label: "Login & Support", icon: "🔐" },
          { key: "mobile_notice", label: "Mobile App Store vs In-App", icon: "📱" },
          { key: "audit", label: "Change History & Audit", icon: "📜" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-navy-600 text-navy-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: General Branding */}
      {activeTab === "general" && (
        <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Application Name *
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => handleChange("appName", e.target.value)}
                maxLength={50}
                placeholder="e.g. Recharge Pro"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 font-semibold text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Displayed in browser tab titles, header, sidebars, mobile app navigation, and transactional invoices.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Brand Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                maxLength={100}
                placeholder="e.g. All Recharge • Bill Payments • Digital Services"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Sub-header displayed on the landing page, receipts, and login portal.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Portal Theme Colors (Hex)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Primary (Dark Navy)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Accent (Royal Blue)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Secondary (Emerald Green)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondaryAccent}
                    onChange={(e) => handleChange("secondaryAccent", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.secondaryAccent}
                    onChange={(e) => handleChange("secondaryAccent", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Logo & Favicon Studio */}
      {activeTab === "logos" && (
        <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Website Logo */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Website Main Logo</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">SVG / PNG / WebP</span>
                </div>
                <div className="w-full h-40 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-4 relative group overflow-hidden">
                  <img
                    src={`${formData.logoUrl}?v=${branding.cacheBuster}`}
                    alt="Website Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 512x512px or wide transparent PNG/SVG. Max 2MB.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <input
                  type="file"
                  ref={webLogoInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "web_logo")}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading === "web_logo"}
                  onClick={() => webLogoInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading === "web_logo" ? "Uploading & Processing..." : "📤 Upload New Web Logo"}
                </button>
              </div>
            </div>

            {/* 2. Mobile Application Logo */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile App Logo</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">In-App Header</span>
                </div>
                <div className="w-full h-40 bg-navy-950 rounded-xl border border-gray-800 flex items-center justify-center p-4 relative group overflow-hidden">
                  <img
                    src={`${formData.mobileLogoUrl}?v=${branding.cacheBuster}`}
                    alt="Mobile App Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Optimized for Android top bar & mobile splash screens.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <input
                  type="file"
                  ref={mobileLogoInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "mobile_logo")}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading === "mobile_logo"}
                  onClick={() => mobileLogoInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading === "mobile_logo" ? "Uploading & Processing..." : "📱 Upload Mobile Logo"}
                </button>
              </div>
            </div>

            {/* 3. Browser Favicon */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Favicon & Shortcut</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Tab Icon</span>
                </div>
                <div className="w-full h-40 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-4">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${formData.faviconUrl}?v=${branding.cacheBuster}`}
                      alt="Favicon"
                      className="w-16 h-16 object-contain rounded-lg p-1 bg-gray-50 border border-gray-200"
                    />
                    <span className="text-[10px] text-gray-400 font-mono">32x32 / 64x64 Preview</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Square icon rendered in browser tabs, bookmarks, and PWA shortcuts.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <input
                  type="file"
                  ref={faviconInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "favicon")}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading === "favicon"}
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading === "favicon" ? "Uploading & Processing..." : "🔖 Upload Favicon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Login & Support */}
      {activeTab === "login" && (
        <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Login Page Welcome Banner Text
              </label>
              <textarea
                rows={2}
                value={formData.loginBannerText}
                onChange={(e) => handleChange("loginBannerText", e.target.value)}
                placeholder="India's Premier Digital Recharge & Utility Payment Platform"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Greeting message shown on the sign-in modal and retailer onboarding screen.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Official Support Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                placeholder="support@rechargepro.in"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Official Helpline Mobile / WhatsApp
              </label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => handleChange("supportPhone", e.target.value)}
                placeholder="+91 98000 12345"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Mobile App Store vs In-App Architecture Notice */}
      {activeTab === "mobile_notice" && (
        <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-base font-bold text-amber-900 mb-2">
                  Critical Architecture Rule: In-App Dynamic Branding vs Native Launcher Icons
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  As required by modern mobile operating systems (Google Android & Apple iOS), there is a fundamental distinction between dynamic in-app branding and native OS launcher assets:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/80 p-4 rounded-xl border border-amber-300">
                    <div className="font-bold text-navy-900 text-sm mb-1">
                      ✅ Dynamic In-App Branding (No deployment needed)
                    </div>
                    <p className="text-xs text-gray-700 leading-normal">
                      The mobile app queries <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">GET /api/branding</code> on launch. Top bars, headers, in-app banners, invoice receipts, and theme colors update dynamically the second you hit Save Changes.
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-xl border border-amber-300">
                    <div className="font-bold text-navy-900 text-sm mb-1">
                      📦 Native OS Launcher Icon & App Store Package
                    </div>
                    <p className="text-xs text-gray-700 leading-normal">
                      The home-screen icon (<code className="bg-gray-100 px-1 py-0.5 rounded font-mono">ic_launcher.png</code>) and app manifest name are compiled directly into the binary APK / AAB. Updating the icon on the Android launcher screen requires generating an updated build with Android Studio and submitting to the Play Store.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit History & Change Log */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              Immutable Branding Audit Trail
            </h3>
            <button
              type="button"
              onClick={fetchAuditLogs}
              className="text-xs font-semibold text-navy-600 hover:text-navy-800 px-3 py-1 bg-gray-50 border rounded-lg"
            >
              🔄 Refresh Logs
            </button>
          </div>

          {isLoadingLogs ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading audit log entries...</div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No branding change logs found.</div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Admin Email (ID)</th>
                    <th className="py-3 px-4">Field</th>
                    <th className="py-3 px-4">Previous Value</th>
                    <th className="py-3 px-4">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            log.action === "RESTORE_DEFAULT"
                              ? "bg-amber-100 text-amber-800"
                              : log.action === "LOGO_UPLOAD"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{log.adminEmail}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{log.adminRole}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-navy-800">{log.fieldChanged}</td>
                      <td className="py-3 px-4 text-gray-500 truncate max-w-xs">{log.previousValue || "—"}</td>
                      <td className="py-3 px-4 font-medium text-emerald-700 truncate max-w-xs">{log.newValue || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Global Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {isSuperAdmin && (
            <button
              type="button"
              disabled={isRestoring}
              onClick={() => setShowRestoreModal(true)}
              className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
            >
              🔄 Restore Default Recharge Pro Branding
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? "Saving Live Changes..." : "💾 Save Changes & Apply Live"}
          </button>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restore Default Branding?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              This will reset the application name to <strong>Recharge Pro</strong>, restore default brand colors,
              and reinstate official logos across all web and mobile platforms. This action will be logged in the audit trail.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                Yes, Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
