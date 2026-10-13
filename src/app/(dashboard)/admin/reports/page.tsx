"use client";

import React from "react";
import { Button } from "@/components/ui";

export default function AdminReportsPage() {
  const reports = [
    { title: "Downline Sales Statement", desc: "Total transactions, volume, and success rate for assigned partners." },
    { title: "Commission Payout Ledger", desc: "Commission margins earned on telecom recharges, bill payments, and DMT." },
    { title: "Distributor Float Statements", desc: "Wallet balance adjustments and daily closing ledger audit." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Regional Reports &amp; Statements</h1>
        <p className="page-subheader">Download territory operational statements and commission ledger records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="card flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{r.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => alert("Downloading statement (.CSV)...")}>
              ⬇️ Export CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
