"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface LedgerItem {
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

interface TopupRequest {
  id: string;
  requestId: string;
  amount: number;
  paymentMethod: string;
  paymentRef: string;
  bankName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const SAMPLE_LEDGER: LedgerItem[] = [
  {
    id: "l-1",
    referenceId: "LED-20261012-0012",
    type: "CREDIT",
    amount: 50000,
    balanceBefore: 45400,
    balanceAfter: 95400,
    description: "Bank Deposit Approved (Ref: SBIN202610129841)",
    category: "TOPUP",
    createdAt: "2026-10-12T08:35:00Z",
  },
  {
    id: "l-2",
    referenceId: "LED-20261012-0011",
    type: "DEBIT",
    amount: 10000,
    balanceBefore: 55400,
    balanceAfter: 45400,
    description: "Float Allocation to Retailer Vikram Sharma (PM-RT-0120)",
    category: "TRANSFER",
    createdAt: "2026-10-12T07:40:00Z",
  },
  {
    id: "l-3",
    referenceId: "LED-20261011-0098",
    type: "CREDIT",
    amount: 4260,
    balanceBefore: 51140,
    balanceAfter: 55400,
    description: "Commission Credit for Retail Network Volume",
    category: "COMMISSION",
    createdAt: "2026-10-11T23:59:00Z",
  },
  {
    id: "l-4",
    referenceId: "LED-20261011-0082",
    type: "DEBIT",
    amount: 5000,
    balanceBefore: 56140,
    balanceAfter: 51140,
    description: "Float Allocation to Retailer Rajesh Rao (PM-RT-0194)",
    category: "TRANSFER",
    createdAt: "2026-10-11T16:15:00Z",
  },
];

const SAMPLE_PAST_REQUESTS: TopupRequest[] = [
  {
    id: "tr-1",
    requestId: "WR-20261012-0041",
    amount: 50000,
    paymentMethod: "NEFT",
    paymentRef: "SBIN202610129841",
    bankName: "State Bank of India",
    status: "APPROVED",
    createdAt: "2026-10-12T08:30:00Z",
  },
  {
    id: "tr-2",
    requestId: "WR-20261009-0019",
    amount: 100000,
    paymentMethod: "RTGS",
    paymentRef: "HDFC92819401924",
    bankName: "HDFC Bank",
    status: "APPROVED",
    createdAt: "2026-10-09T11:15:00Z",
  },
];

export default function DistributorWalletPage() {
  const [balance, setBalance] = useState({ available: 95400, reserved: 5000 });
  const [ledger, setLedger] = useState<LedgerItem[]>(SAMPLE_LEDGER);
  const [requests, setRequests] = useState<TopupRequest[]>(SAMPLE_PAST_REQUESTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [topupForm, setTopupForm] = useState({
    amount: "",
    paymentMethod: "NEFT",
    bankName: "State Bank of India",
    paymentRef: "",
    remarks: "",
  });

  const handleRequestTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(topupForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSubmitting(true);
    const newReq: TopupRequest = {
      id: `tr-${Date.now()}`,
      requestId: `WR-${Date.now().toString().slice(-6)}`,
      amount: amountNum,
      paymentMethod: topupForm.paymentMethod,
      paymentRef: topupForm.paymentRef,
      bankName: topupForm.bankName,
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
      setSuccessMessage(
        `Top-up claim of ${formatCurrency(amountNum)} submitted for Admin approval.`
      );
      setTopupForm({
        amount: "",
        paymentMethod: "NEFT",
        bankName: "State Bank of India",
        paymentRef: "",
        remarks: "",
      });
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
          Treasury &bull; Float Management
        </div>
        <h1 className="page-header mt-1">My Distributor Wallet</h1>
        <p className="page-subheader">
          Manage your working balance float, submit bank deposit claims, and monitor account ledger movements.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-semibold">
          ✅ {successMessage}
        </div>
      )}

      {/* Balances and Top-up Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balances Card */}
        <div className="space-y-4">
          <div className="card bg-navy-900 text-white p-6 flex flex-col justify-between h-52">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Available Float Balance
              </span>
              <div className="text-3xl font-extrabold text-white mt-2">
                {formatCurrency(balance.available)}
              </div>
              <p className="text-xs text-gray-300 mt-2">
                Available to distribute to your downline retail outlets.
              </p>
            </div>
            <div className="pt-3 border-t border-navy-800 flex justify-between text-xs text-gray-300">
              <span>Reserved Balance:</span>
              <span className="font-semibold text-yellow-400">
                {formatCurrency(balance.reserved)}
              </span>
            </div>
          </div>

          {/* Bank Transfer Instructions */}
          <div className="card p-5 text-xs space-y-2 bg-blue-50/50 border-blue-200">
            <h4 className="font-bold text-navy-900">Company Bank Details for Deposit</h4>
            <div className="space-y-1 text-gray-700">
              <p><span className="text-gray-500">Bank:</span> State Bank of India</p>
              <p><span className="text-gray-500">Account Name:</span> Recharge Pro Solutions Pvt Ltd</p>
              <p><span className="text-gray-500">Account No:</span> 4029103912903</p>
              <p><span className="text-gray-500">IFSC Code:</span> SBIN0001420</p>
              <p className="text-[11px] text-gray-500 mt-2">
                Please transfer funds via IMPS/NEFT/RTGS and submit UTR ref below.
              </p>
            </div>
          </div>
        </div>

        {/* Top-up Claim Form */}
        <div className="card lg:col-span-2 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Submit Wallet Top-up Claim
          </h3>
          <p className="text-xs text-gray-500 mb-5">
            After making a deposit to Recharge Pro nodal bank account, submit the transaction UTR number to credit your wallet float.
          </p>

          <form onSubmit={handleRequestTopup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Deposit Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="100"
                  placeholder="e.g. 50000"
                  value={topupForm.amount}
                  onChange={(e) =>
                    setTopupForm({ ...topupForm, amount: e.target.value })
                  }
                  className="input-field font-semibold text-base"
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
                  <option value="NEFT">NEFT Transfer</option>
                  <option value="IMPS">IMPS Immediate Transfer</option>
                  <option value="RTGS">RTGS High Value</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="BANK_DEPOSIT">Cash Deposit in CDM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Bank from which transferred"
                  value={topupForm.bankName}
                  onChange={(e) =>
                    setTopupForm({ ...topupForm, bankName: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">UTR / Reference Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBIN202610129841"
                  value={topupForm.paymentRef}
                  onChange={(e) =>
                    setTopupForm({ ...topupForm, paymentRef: e.target.value })
                  }
                  className="input-field font-mono"
                />
              </div>
            </div>

            <div>
              <label className="label">Notes / Remarks</label>
              <input
                type="text"
                placeholder="Optional deposit remarks"
                value={topupForm.remarks}
                onChange={(e) =>
                  setTopupForm({ ...topupForm, remarks: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="px-6 shadow-sm"
              >
                Submit Top-up Request &rarr;
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Top-up Claim History */}
      <div className="space-y-4">
        <h3 className="section-title">Top-up Claims History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>UTR / Reference</TableHead>
              <TableHead>Deposited Bank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submission Date</TableHead>
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
                <TableCell className="font-mono text-xs font-medium text-gray-800">
                  {r.paymentRef}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {r.bankName}
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

      {/* Account Ledger Section */}
      <div className="space-y-4">
        <h3 className="section-title">Account Ledger Statements</h3>
        <p className="text-xs text-gray-500">
          Complete debit and credit balance audit trails for your distributor account
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entry Ref</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance After</TableHead>
              <TableHead>Timestamp</TableHead>
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
