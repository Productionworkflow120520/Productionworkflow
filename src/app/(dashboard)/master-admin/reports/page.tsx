"use client";

import React from "react";
import { Button } from "@/components/ui";

const REPORT_CARDS = [
  {
    title: "Daily Ledger Passbook & Reconciliation",
    desc: "Complete double-entry accounting ledger statements, debits, credits, and opening/closing float balance.",
    category: "Financial",
    format: "CSV / Excel",
  },
  {
    title: "Operator-Wise Telecom Sales Report",
    desc: "Transaction volume, gross sales, failure rate, and circle distribution across Jio, Airtel, Vi, and BSNL.",
    category: "Recharge",
    format: "CSV / PDF",
  },
  {
    title: "BBPS Bharat Connect Settlement Statement",
    desc: "Biller-wise payment success report, customer reference IDs, NPCI confirmation codes, and clearing reports.",
    category: "Billing",
    format: "CSV",
  },
  {
    title: "DMT Remittance & TDS Summary Report",
    desc: "Remitter-wise monthly remittance consumption, beneficiary account IFSCs, Bank RRNs, and TDS deductions.",
    category: "Remittance",
    format: "CSV / Excel",
  },
  {
    title: "Distributor & Retailer Commission Yield Statement",
    desc: "Downline network commission earnings, payout summaries, and margin splits.",
    category: "Commissions",
    format: "CSV",
  },
];

export default function MasterAdminReportsPage() {
  const handleExport = (title: string) => {
    alert(`Generating authorized export for: ${title} (Demo: Download simulated)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Financial &amp; Operational Reports</h1>
        <p className="page-subheader">
          Export double-entry ledger audits, TDS withholding summaries, and B2B gateway performance logs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CARDS.map((rpt, idx) => (
          <div key={idx} className="card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-navy-600 uppercase tracking-wider bg-navy-50 px-2 py-0.5 rounded">
                  {rpt.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">{rpt.format}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base">{rpt.title}</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{rpt.desc}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => handleExport(rpt.title)}>
                ⬇️ Download Statement (.CSV)
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
