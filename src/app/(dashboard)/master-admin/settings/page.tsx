"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

type SettingsTab = "branding" | "services" | "limits" | "security" | "notifications";

export default function MasterAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("branding");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [branding, setBranding] = useState({
    appName: APP_NAME,
    logoUrl: "/logo.svg",
    primaryColor: "#1e3a8a",
    secondaryColor: "#3b82f6",
    supportEmail: "support@rechargepro.in",
    supportPhone: "+91 1800 233 4455",
  });

  const [services, setServices] = useState({
    mobileRecharge: true,
    dthRecharge: true,
    bbpsElectricity: true,
    bbpsWater: true,
    bbpsGas: true,
    bbpsFastag: true,
    aepsCashWithdrawal: false,
    aepsBalanceInquiry: true,
    walletTransfers: true,
  });

  const [limits, setLimits] = useState({
    adminMaxDaily: 1000000,
    adminMaxPerTxn: 100000,
    distributorMaxDaily: 500000,
    distributorMaxPerTxn: 50000,
    retailerMaxDaily: 100000,
    retailerMaxPerTxn: 10000,
  });

  const [security, setSecurity] = useState({
    sessionTimeoutMins: 60,
    mfaEnforcedForAdmins: true,
    mfaEnforcedForDistributors: false,
    maxLoginAttempts: 5,
    lockoutDurationMins: 30,
    rateLimitPerMin: 120,
  });

  const [notifications, setNotifications] = useState({
    emailAlertsOnFailure: true,
    smsAlertsOnHighValue: true,
    thresholdValueAlert: 50000,
    dailyReportWebhook: "https://api.rechargepro.in/webhooks/daily-summary",
  });

  const handleSave = (section: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(`${section} settings saved successfully.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
          Configuration &bull; System Controls
        </div>
        <h1 className="page-header mt-1">Platform Settings</h1>
        <p className="page-subheader">
          Manage white-label branding, active service gateways, risk thresholds, and compliance controls.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-semibold flex items-center justify-between">
          <span>✅ {saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)} className="text-green-600">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { key: "branding", label: "Branding & Identity", icon: "🎨" },
          { key: "services", label: "Service Gateways", icon: "🔌" },
          { key: "limits", label: "Transaction Limits", icon: "⚖️" },
          { key: "security", label: "Security & MFA", icon: "🔒" },
          { key: "notifications", label: "Alerts & Webhooks", icon: "🔔" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as SettingsTab)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-navy-600 text-navy-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Branding */}
      {activeTab === "branding" && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Portal Branding</h3>
              <p className="text-xs text-gray-500">
                Customize platform title, corporate identifiers, and customer support channels.
              </p>
            </div>
            <Button
              onClick={() => handleSave("Branding")}
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Branding
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Application Name</label>
              <input
                type="text"
                value={branding.appName}
                onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Logo Asset URL</label>
              <input
                type="text"
                value={branding.logoUrl}
                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Primary Navy Hex Code</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, primaryColor: e.target.value })
                  }
                  className="h-10 w-12 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, primaryColor: e.target.value })
                  }
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div>
              <label className="label">Accent Accent Color Hex</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, secondaryColor: e.target.value })
                  }
                  className="h-10 w-12 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, secondaryColor: e.target.value })
                  }
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div>
              <label className="label">Support Email Address</label>
              <input
                type="email"
                value={branding.supportEmail}
                onChange={(e) =>
                  setBranding({ ...branding, supportEmail: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Support Toll-Free Phone</label>
              <input
                type="tel"
                value={branding.supportPhone}
                onChange={(e) =>
                  setBranding({ ...branding, supportPhone: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Services */}
      {activeTab === "services" && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Service Switches</h3>
              <p className="text-xs text-gray-500">
                Instantly enable or isolate individual downstream transaction verticals.
              </p>
            </div>
            <Button
              onClick={() => handleSave("Services")}
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Service Flags
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "mobileRecharge", label: "Prepaid Mobile Recharge", desc: "Airtel, Jio, Vi, BSNL" },
              { key: "dthRecharge", label: "DTH Satellite TV", desc: "Tata Play, Sun, Dish TV" },
              { key: "bbpsElectricity", label: "BBPS Electricity", desc: "50+ state discoms" },
              { key: "bbpsWater", label: "BBPS Water Utility", desc: "Municipal supply boards" },
              { key: "bbpsGas", label: "BBPS Piped Gas & LPG", desc: "Indraprastha, Mahanagar Gas" },
              { key: "bbpsFastag", label: "FASTag Toll Recharge", desc: "NETC National Electronic Toll" },
              { key: "aepsCashWithdrawal", label: "AEPS Cash Out", desc: "Aadhaar biometrics (Maintenance)", badge: "Beta" },
              { key: "aepsBalanceInquiry", label: "AEPS Balance Inquiry", desc: "Instant bank balance fetch" },
              { key: "walletTransfers", label: "P2P Wallet Transfers", desc: "Downline float distribution" },
            ].map((item) => {
              const checked = services[item.key as keyof typeof services];
              return (
                <div
                  key={item.key}
                  className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                    checked ? "bg-navy-50/30 border-navy-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{item.label}</span>
                      {item.badge && <Badge variant="warning">{item.badge}</Badge>}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setServices({ ...services, [item.key]: e.target.checked })
                    }
                    className="h-5 w-5 rounded text-navy-600 focus:ring-navy-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Limits */}
      {activeTab === "limits" && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Velocity &amp; Exposure Limits</h3>
              <p className="text-xs text-gray-500">
                Default financial exposure limits configured per user tier in Indian Rupees (₹).
              </p>
            </div>
            <Button
              onClick={() => handleSave("Limits")}
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Limits
            </Button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-3">
                Regional Admins
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Daily Volume (₹)</label>
                  <input
                    type="number"
                    value={limits.adminMaxDaily}
                    onChange={(e) =>
                      setLimits({ ...limits, adminMaxDaily: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Max Single Txn Limit (₹)</label>
                  <input
                    type="number"
                    value={limits.adminMaxPerTxn}
                    onChange={(e) =>
                      setLimits({ ...limits, adminMaxPerTxn: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-3">
                Distributors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Daily Volume (₹)</label>
                  <input
                    type="number"
                    value={limits.distributorMaxDaily}
                    onChange={(e) =>
                      setLimits({
                        ...limits,
                        distributorMaxDaily: Number(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Max Single Txn Limit (₹)</label>
                  <input
                    type="number"
                    value={limits.distributorMaxPerTxn}
                    onChange={(e) =>
                      setLimits({
                        ...limits,
                        distributorMaxPerTxn: Number(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-3">
                Retail Merchants
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Daily Volume (₹)</label>
                  <input
                    type="number"
                    value={limits.retailerMaxDaily}
                    onChange={(e) =>
                      setLimits({
                        ...limits,
                        retailerMaxDaily: Number(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Max Single Txn Limit (₹)</label>
                  <input
                    type="number"
                    value={limits.retailerMaxPerTxn}
                    onChange={(e) =>
                      setLimits({
                        ...limits,
                        retailerMaxPerTxn: Number(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === "security" && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Security &amp; Hardening</h3>
              <p className="text-xs text-gray-500">
                Session lifetime, multi-factor enforcement, and DDoS rate throttling policies.
              </p>
            </div>
            <Button
              onClick={() => handleSave("Security")}
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Security
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={security.sessionTimeoutMins}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    sessionTimeoutMins: Number(e.target.value),
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">API Rate Limit (Requests / Minute / IP)</label>
              <input
                type="number"
                value={security.rateLimitPerMin}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    rateLimitPerMin: Number(e.target.value),
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Max Failed Logins Before Lockout</label>
              <input
                type="number"
                value={security.maxLoginAttempts}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    maxLoginAttempts: Number(e.target.value),
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Lockout Cooldown Period (Minutes)</label>
              <input
                type="number"
                value={security.lockoutDurationMins}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    lockoutDurationMins: Number(e.target.value),
                  })
                }
                className="input-field"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Enforce Two-Factor Authentication (MFA) for Admins
                </p>
                <p className="text-[11px] text-gray-500">
                  Requires TOTP authenticator code on each administrative sign-in.
                </p>
              </div>
              <input
                type="checkbox"
                checked={security.mfaEnforcedForAdmins}
                onChange={(e) =>
                  setSecurity({ ...security, mfaEnforcedForAdmins: e.target.checked })
                }
                className="h-5 w-5 rounded text-navy-600 focus:ring-navy-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Enforce Two-Factor Authentication for Distributors
                </p>
                <p className="text-[11px] text-gray-500">
                  Mandatory OTP verification for high-volume distributors.
                </p>
              </div>
              <input
                type="checkbox"
                checked={security.mfaEnforcedForDistributors}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    mfaEnforcedForDistributors: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded text-navy-600 focus:ring-navy-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === "notifications" && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Alerts &amp; Webhooks</h3>
              <p className="text-xs text-gray-500">
                Configure real-time notifications for transaction deviations and automated daily digests.
              </p>
            </div>
            <Button
              onClick={() => handleSave("Notifications")}
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Notifications
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Email Alerts on Provider Failures
                </p>
                <p className="text-[11px] text-gray-500">
                  Send immediate high-priority alerts to NOC when provider failure rate exceeds 5%.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlertsOnFailure}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    emailAlertsOnFailure: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded text-navy-600 focus:ring-navy-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  SMS / Webhook Alert on High-Value Top-ups
                </p>
                <p className="text-[11px] text-gray-500">
                  Trigger alert when single wallet deposit request exceeds configured threshold.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsAlertsOnHighValue}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    smsAlertsOnHighValue: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded text-navy-600 focus:ring-navy-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="label">High-Value Alert Threshold (₹)</label>
                <input
                  type="number"
                  value={notifications.thresholdValueAlert}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      thresholdValueAlert: Number(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Daily Reconciliation Webhook Endpoint</label>
                <input
                  type="url"
                  value={notifications.dailyReportWebhook}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      dailyReportWebhook: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
