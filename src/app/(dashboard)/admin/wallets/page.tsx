"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface WalletRequest {
  id: string;
  requestId: string;
  userName: string;
  role: string;
  amount: number;
  paymentMethod: string;
  paymentRef: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const SAMPLE_REQUESTS: WalletRequest[] = [
  {
    id: "wr-01",
    requestId: "WR-20261012-001",
    userName: "Amit Kumar",
    role: "DISTRIBUTOR",
    amount: 50000,
    paymentMethod: "IMPS",
    paymentRef: "UTR42890123910",
    status: "PENDING",
    createdAt: "2026-10-12T11:00:00Z",
  },
  {
    id: "wr-02",
    requestId: "WR-20261012-002",
    userName: "Sanjay Gupta",
    role: "DISTRIBUTOR",
    amount: 25000,
    paymentMethod: "NEFT",
    paymentRef: "UTR88291039128",
    status: "PENDING",
    createdAt: "2026-10-12T10:15:00Z",
  },
];

export default function AdminWalletsPage() {
  const [requests, setRequests] = useState<WalletRequest[]>(SAMPLE_REQUESTS);

  const handleApprove = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Downline Float &amp; Wallet Approvals</h1>
          <p className="page-subheader">
            Verify bank deposits and credit wallet balance for your assigned distributors
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-4">Pending Top-Up Funding Requests</h2>
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Mode / UTR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">{r.requestId}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{r.userName}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{r.role}</Badge>
                  </td>
                  <td className="py-3 px-4 font-bold text-navy-900">{formatCurrency(r.amount)}</td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-600">
                    {r.paymentMethod} - {r.paymentRef}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={r.status === "APPROVED" ? "success" : r.status === "PENDING" ? "warning" : "danger"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleApprove(r.id)}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleReject(r.id)}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Processed</span>
                    )}
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
