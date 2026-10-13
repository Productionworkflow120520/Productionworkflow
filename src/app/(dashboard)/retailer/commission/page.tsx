"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

export default function RetailerCommissionPage() {
  const commissions = [
    { type: "Mobile Recharge", plan: "Jio ₹299 Unlimited", margin: "2.5%", earned: 7.48, date: "12 Oct 2026, 04:12 PM" },
    { type: "DTH Recharge", plan: "Tata Play ₹500", margin: "3.0%", earned: 15.0, date: "12 Oct 2026, 03:30 PM" },
    { type: "BBPS Electricity", plan: "Mahavitaran ₹1,850", margin: "₹5.00 Flat", earned: 5.0, date: "12 Oct 2026, 01:45 PM" },
    { type: "Money Transfer (DMT)", plan: "IMPS ₹5,000", margin: "0.4%", earned: 20.0, date: "12 Oct 2026, 11:20 AM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Retailer Commission Passbook</h1>
        <p className="page-subheader">Instant commission credit ledger earned across all transactions at your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Today's Earnings</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">₹47.48</span>
          <span className="text-[11px] text-green-600 mt-1 block">Instantly credited to float</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">This Month (October)</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">₹1,248.50</span>
          <span className="text-[11px] text-gray-500 mt-1 block">Across 184 transactions</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Highest Margin Service</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">DTH (3.0%)</span>
          <span className="text-[11px] text-blue-600 mt-1 block">Satellite recharges</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-3">Recent Commission Entries</h2>
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Commission Margin</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Net Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{c.type}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{c.plan}</td>
                  <td className="py-3 px-4 text-xs font-medium text-blue-600">{c.margin}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{c.date}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 text-right">+{formatCurrency(c.earned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
