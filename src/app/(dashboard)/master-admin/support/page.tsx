"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";

interface Ticket {
  id: string;
  ticketId: string;
  subject: string;
  creatorName: string;
  creatorRole: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
}

const SAMPLE_TICKETS: Ticket[] = [
  {
    id: "tk-01",
    ticketId: "TKT-20261012-001",
    subject: "Airtel Prepaid ₹299 recharge pending confirmation",
    creatorName: "Suresh Verma",
    creatorRole: "RETAILER",
    category: "TRANSACTION_DISPUTE",
    status: "OPEN",
    priority: "HIGH",
    createdAt: "2026-10-12T11:20:00Z",
  },
  {
    id: "tk-02",
    ticketId: "TKT-20261012-002",
    subject: "Bank Top-up UTR 4289100234 verification delay",
    creatorName: "Amit Kumar",
    creatorRole: "DISTRIBUTOR",
    category: "WALLET_FUNDING",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: "2026-10-12T09:40:00Z",
  },
  {
    id: "tk-03",
    ticketId: "TKT-20261012-003",
    subject: "Electricity bill paid but Biller receipt unverified",
    creatorName: "Rahul Sharma",
    creatorRole: "ADMIN",
    category: "BBPS_ISSUE",
    status: "RESOLVED",
    priority: "LOW",
    createdAt: "2026-10-11T16:15:00Z",
  },
];

export default function MasterAdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(SAMPLE_TICKETS);

  const resolveTicket = (id: string) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Support Desk &amp; Merchant Helpdesk</h1>
        <p className="page-subheader">
          Dispute resolution, recharge complaint tickets, and bank escalation tracking
        </p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Agent / Requester</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">{t.ticketId}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-xs">{t.subject}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800">{t.creatorName}</div>
                    <Badge variant="info">{t.creatorRole}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={t.priority === "HIGH" || t.priority === "URGENT" ? "danger" : "neutral"}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={t.status === "RESOLVED" ? "success" : t.status === "OPEN" ? "warning" : "info"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {t.status !== "RESOLVED" ? (
                      <Button variant="secondary" size="sm" onClick={() => resolveTicket(t.id)}>
                        Mark Resolved
                      </Button>
                    ) : (
                      <span className="text-xs text-green-700 font-medium">✓ Closed</span>
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
