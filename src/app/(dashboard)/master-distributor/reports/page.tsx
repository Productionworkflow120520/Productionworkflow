"use client";

import React from "react";
import { Button } from "@/components/ui";

export default function MasterDistributorReportsPage() {
  const reports = [
    { title: "Downline Network Turnover", desc: "Consolidated volume and count across assigned Distributors and Retailers." },
    { title: "Commission Margin Ledger", desc: "Master Distributor overrides earned on recharges, utility bill payments, and transfers." },
    { title: "Float Allocation Statements", desc: "History of float deposits disbursed to area distributors and retail outlets." },
    { title: "Agent Settlement Status", desc: "Daily closing balances and active agent transactions." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Distribution Reports &amp; Statements</h1>
        <p className="text-xs text-gray-500 mt-1">Download operational statements and commission ledger records for your network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="card p-5 bg-white border border-gray-200 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{r.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => alert(`Exporting ${r.title} (.CSV)...`)}
              className="w-full"
            >
              ⬇️ Export CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
