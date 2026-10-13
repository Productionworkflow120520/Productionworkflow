"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";

export default function AdminSupportPage() {
  const [tickets] = useState([
    {
      id: "t-1",
      code: "TKT-ADM-01",
      title: "Mobile recharge operator timeout on Jio circle",
      from: "Amit Kumar (Distributor)",
      status: "OPEN",
    },
    {
      id: "t-2",
      code: "TKT-ADM-02",
      title: "Wallet top-up approval status confirmation",
      from: "Sanjay Gupta (Distributor)",
      status: "RESOLVED",
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Assigned Territory Support</h1>
        <p className="page-subheader">Helpdesk tickets and disputes submitted by your distributors</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">{t.code}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{t.title}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{t.from}</td>
                  <td className="py-3 px-4">
                    <Badge variant={t.status === "OPEN" ? "warning" : "success"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
