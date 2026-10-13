"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

export default function DistributorCommissionPage() {
  const earnings = [
    { service: "Prepaid Mobile Recharge", rate: "0.50%", volume: 32400, earned: 162.0 },
    { service: "DTH Satellite Recharge", rate: "0.75%", volume: 18500, earned: 138.75 },
    { service: "BBPS Bharat Connect", rate: "₹2.00 / txn", volume: 11200, earned: 120.0 },
    { service: "Domestic Remittance (DMT)", rate: "0.15%", volume: 45000, earned: 67.5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Commission Earnings &amp; Network Margin</h1>
        <p className="page-subheader">Review your earnings generated across all downline retailer transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Total Earned (This Month)</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">₹488.25</span>
          <span className="text-[11px] text-gray-500 mt-1 block">Credited to wallet passbook</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Downline Network Volume</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">₹1,07,100</span>
          <span className="text-[11px] text-gray-500 mt-1 block">Across assigned retailers</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Active Retailer Outlets</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">2 Outlets</span>
          <span className="text-[11px] text-green-600 mt-1 block">Transacting today</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-3">Service-Wise Commission Breakdown</h2>
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Distributor Split</th>
                <th className="py-3 px-4">Network Turnover</th>
                <th className="py-3 px-4 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earnings.map((e, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{e.service}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium">{e.rate}</td>
                  <td className="py-3 px-4 font-mono text-gray-800">{formatCurrency(e.volume)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 text-right">{formatCurrency(e.earned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
