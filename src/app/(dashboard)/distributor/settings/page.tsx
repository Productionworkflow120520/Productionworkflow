"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";

export default function DistributorSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-header">Distributor Account Settings</h1>
        <p className="page-subheader">Notification thresholds, retailer onboarding notifications, and daily summaries</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-bold text-gray-900">Agency Preferences</h2>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Notify me via WhatsApp when a new retailer registers in my downline</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Low balance float warning alert when wallet balance is below ₹5,000</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Monthly commission earnings summary statement via email</span>
          </label>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          {saved && <span className="text-xs text-green-700 font-medium">✓ Settings saved</span>}
          <div className="ml-auto">
            <Button variant="primary" size="sm" onClick={() => setSaved(true)}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
