"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";

export default function RetailerSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-header">Merchant Outlet Settings</h1>
        <p className="page-subheader">Receipt print customization, low-float warnings, and security preferences</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-bold text-gray-900">POS &amp; Receipt Configuration</h2>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Print store business name and contact number on customer recharge receipts</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Auto-prompt thermal Bluetooth printer print dialog after successful recharge</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Sound chime on successful wallet commission credit</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked className="rounded text-navy-600" />
            <span>Low float warning alert when wallet balance drops below ₹1,000</span>
          </label>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          {saved && <span className="text-xs text-green-700 font-medium">✓ Outlet settings saved</span>}
          <div className="ml-auto">
            <Button variant="primary" size="sm" onClick={() => setSaved(true)}>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
