"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface RetailerLedgerItem {
  id: string;
  referenceId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  category: string;
  createdAt: string;
}

interface RetailerTopupReq {
  id: string;
  requestId: string;
  amount: number;
  paymentMethod: string;
  paymentRef: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const SAMPLE_RETAILER_LEDGER: RetailerLedgerItem[] = [
  {
    id: "l-1",
    referenceId: "LED-20261012-0941",
    type: "DEBIT",
    amount: 499,
    balanceBefore: 12949.5,
    balanceAfter: 12450.5,
    description: "Mobile Recharge for 9876543210 (Jio)",
    category: "RECHARGE",
    createdAt: "2026-10-12T09:41:00Z",
  },
  {
    id: "l-2",
    referenceId: "LED-20261012-0941-C",
    type: "CREDIT",
    amount: 9.98,
    balanceBefore: 12450.5,
    balanceAfter: 12460.48,
    description: "Commission Credit for Jio Prepaid Recharge",
    category: "COMMISSION",
    createdAt: "2026-10-12T09:41:05Z",
  },
  {
    id: "l-3",
    referenceId: "LED-20261012-0810",
    type: "CREDIT",
    amount: 5000,
    balanceBefore: 7949.5,
    balanceAfter: 12949.5,
    description: "Float Transfer from Distributor Venkatesh Rao",
    category: "TRANSFER",
    createdAt: "2026-10-12T08:10:00Z",
  },
  {
    id: "l-4",
    referenceId: "LED-20261011-1920",
    type: "DEBIT",
    amount: 1850,
    balanceBefore: 9799.5,
    balanceAfter: 7949.5,
    description: "BBPS Electricity Payment (Adani Electricity)",
    category: "BBPS",
    createdAt: "2026-10-11T19:20:00Z",
  },
];

const SAMPLE_TOPUP_REQS: RetailerTopupReq[] = [
  {
    id: "req-1",
    requestId: "WR-20261010-0012",
    amount: 10000,
    paymentMethod: "UPI",
    paymentRef: "UPI/38291048194",
    status: "APPROVED",
    createdAt: "2026-10-10T14:30:00Z",
  },
  {
    id: "req-2",
    requestId: "WR-20261005-0008",
    amount: 5000,
    paymentMethod: "IMPS",
    paymentRef: "IMPS/9281948192",
    status: "APPROVED",
    createdAt: "2026-10-05T11:00:00Z",
  },
];

export default function RetailerWalletPage() {
  const [balance, setBalance] = useState({ available: 12450.5, reserved: 250.0 });
  const [ledger, setLedger] = useState<RetailerLedgerItem[]>(SAMPLE_RETAILER_LEDGER);
  const [requests, setRequests] = useState<RetailerTopupReq[]>(SAMPLE_TOPUP_REQS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [topupForm, setTopupForm] = useState({
    amount: "",
    paymentMethod: "UPI",
    paymentRef: "",
    bankName: "HDFC Bank",
  });

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(topupForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSubmitting(true);
    const newReq: RetailerTopupReq = {
      id: `req-${Date.now()}`,
      requestId: `WR-${Date.now().toString().slice(-6)}`,
      amount: amountNum,
      paymentMethod: topupForm.paymentMethod,
      paymentRef: topupForm.paymentRef,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/wallet-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topupForm),
      });
    } catch {
      // ignore
    } finally {
      setRequests((prev) => [newReq, ...prev]);
      setSuccessMsg(
        `Top-up claim of ${formatCurrency(amountNum)} sent to your Distributor for approval.`
      );
      setTopupForm({
        amount: "",
        paymentMethod: "UPI",
        paymentRef: "",
        bankName: "HDFC Bank",
      });
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
          Counter Operations &bull; Merchant Float
        </div>
        <h1 className="page-header mt-1">Merchant Wallet &amp; Ledger</h1>
        <p className="page-subheader">
          Check real-time counter float balance, submit deposit top-up claims, and verify transaction receipts.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-semibold">
          ✅ {successMsg}
        </div>
      )}

      {/* Grid: Balance & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="card bg-navy-900 text-white p-6 flex flex-col justify-between h-56">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Counter Available Float
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">
              {formatCurrency(balance.available)}
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Used instantly for consumer mobile, DTH, and utility bill collections.
            </p>
          </div>
          <div className="pt-3 border-t border-navy-800 flex justify-between text-xs text-gray-300">
            <span>Reserved Escrow:</span>
            <span className="font-semibold text-yellow-400">
              {formatCurrency(balance.reserved)}
            </span>
          </div>
        </div>

        {/* Top-up Claim Form */}
        <div className="card lg:col-span-2 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Request Float Top-up
          </h3>
          <p className="text-xs text-gray-500 mb-5">
            Submit your UPI / IMPS deposit details to request balance from your distributor.
          </p>

          <form onSubmit={handleTopupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  placeholder="e.g. 5000"
                  value={topupForm.amount}
                  onChange={(e) =>
                    setTopupForm({ ...topupForm, amount: e.target.value })
                  }
                  className="input-field font-bold text-base"
                />
              </div>

              <div>
                <label className="label">Payment Mode *</label>
                <select
                  value={topupForm.paymentMethod}
                  onChange={(e) =>
                    setTopupForm({ ...topupForm, paymentMethod: e.target.value })
                  }
                  className="select-field"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="IMPS">IMPS Immediate Transfer</option>
                  <option value="NEFT">NEFT Bank Transfer</option>
                  <option value="CASH">Cash Given to Distributor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">UTR / Transaction Reference No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. UPI/39102948194"
                value={topupForm.paymentRef}
                onChange={(e) =>
                  setTopupForm({ ...topupForm, paymentRef: e.target.value })
                }
                className="input-field font-mono"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="px-6 text-xs font-bold"
              >
                Submit Top-up Request &rarr;
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Top-up Claim Requests Table */}
      <div className="space-y-4">
        <h3 className="section-title">My Top-up Requests</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>UTR / Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs font-semibold text-navy-700">
                  {r.requestId}
                </TableCell>
                <TableCell className="font-bold text-gray-900 text-xs">
                  {formatCurrency(r.amount)}
                </TableCell>
                <TableCell className="text-xs text-gray-700">
                  {r.paymentMethod}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-800">
                  {r.paymentRef}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      r.status === "APPROVED"
                        ? "success"
                        : r.status === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDateTime(r.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Account Ledger Entries */}
      <div className="space-y-4">
        <h3 className="section-title">Counter Passbook &amp; Ledger</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance After</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-xs text-gray-500">
                  {entry.referenceId}
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{entry.category}</Badge>
                </TableCell>
                <TableCell className="text-xs font-medium text-gray-900">
                  {entry.description}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-bold text-xs ${
                      entry.type === "CREDIT"
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    {entry.type === "CREDIT" ? "+ CR" : "- DR"}
                  </span>
                </TableCell>
                <TableCell
                  className={`font-bold text-xs ${
                    entry.type === "CREDIT"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {formatCurrency(entry.amount)}
                </TableCell>
                <TableCell className="text-xs font-mono font-semibold text-gray-900">
                  {formatCurrency(entry.balanceAfter)}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDateTime(entry.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
