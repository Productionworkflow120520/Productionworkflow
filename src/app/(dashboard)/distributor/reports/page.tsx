"use client";

import React from "react";
import { Button } from "@/components/ui";

export default function DistributorReportsPage() {
  const reports = [
    { title: "Retailer Sales Summary", desc: "Volume, count, and status breakdown across all your assigned retail outlets." },
    { title: "Distributor Commission Statement", desc: "Detailed margin report credited to your wallet per recharge and bill payment." },
    { title: "Float Allocation Passbook", desc: "Record of wallet float transfers granted to your subordinate retailers." },
    { title: "Daily Transaction Audit", desc: "Download day-wise detailed transactional audit log." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Distributor Reports &amp; Statements</h1>
        <p className="text-xs text-gray-500 mt-1">Generate performance reports, commission ledger statements, and retailer audits</p>
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
