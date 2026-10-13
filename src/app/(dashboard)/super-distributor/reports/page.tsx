"use client";

import React from "react";
import { Button } from "@/components/ui";

export default function SuperDistributorReportsPage() {
  const reports = [
    { title: "Downline Network Turnover", desc: "Consolidated volume and count across Master Distributors, Distributors, and Retailers." },
    { title: "Multi-Tier Commission Statement", desc: "Super Distributor margin overrides earned on downline recharges and utility bills." },
    { title: "Float Allocation Passbook", desc: "Comprehensive capital movements, bank deposit allocations, and downstream float credits." },
    { title: "Hierarchy Sales Breakdown", desc: "Agent-wise performance matrix and outlet success ratios." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Distribution Reports &amp; Statements</h1>
        <p className="text-xs text-gray-500 mt-1">Export network audits, multi-tier commission statements, and transaction summaries</p>
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
