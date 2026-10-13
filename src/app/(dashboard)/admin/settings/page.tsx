"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-header">Account Settings &amp; Preferences</h1>
        <p className="page-subheader">Manage notification preferences, PIN authentication, and regional operational alerts</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-bold text-gray-900">Security &amp; Notifications</h2>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Email notifications on large distributor wallet deposits (&gt; ₹25,000)</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Alert on downstream gateway downtime or degraded status</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Daily morning transaction summary on SMS</span>
          </label>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          {saved && <span className="text-xs text-green-700 font-medium">✓ Preferences updated successfully</span>}
          <div className="ml-auto">
            <Button variant="primary" size="sm" onClick={() => setSaved(true)}>
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
