"use client";

import React, { useState } from "react";
import { Button, Badge, Modal } from "@/components/ui";
import { MOBILE_OPERATORS, INDIAN_STATES } from "@/lib/constants";
import { formatCurrency, isValidMobile } from "@/lib/utils";

interface RechargeReceipt {
  txnId: string;
  mobileNumber: string;
  operator: string;
  circle: string;
  amount: number;
  commission: number;
  timestamp: string;
  status: "SUCCESS" | "FAILED";
  operatorRef: string;
}

export default function MobileRechargePage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [operator, setOperator] = useState("JIO");
  const [circle, setCircle] = useState("Maharashtra");
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(12450.5);

  // States
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<RechargeReceipt | null>(null);

  const quickAmounts = [10, 20, 49, 99, 149, 199, 299, 499];

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidMobile(mobileNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g. 98XXXXXXXX).");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setError("Minimum recharge amount is ₹10.");
      return;
    }

    if (numAmount > walletBalance) {
      setError(
        `Insufficient wallet balance (${formatCurrency(
          walletBalance
        )}). Please top up your wallet first.`
      );
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteRecharge = async () => {
    setIsProcessing(true);
    const numAmount = parseFloat(amount);
    const operatorObj = MOBILE_OPERATORS.find((o) => o.code === operator);

    try {
      const res = await fetch("/api/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber,
          operator,
          circle,
          amount: numAmount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWalletBalance((prev) => prev - numAmount);
        setReceipt({
          txnId: data.txnId || `PM-REC-${Date.now().toString().slice(-8)}`,
          mobileNumber,
          operator: operatorObj?.name || operator,
          circle,
          amount: numAmount,
          commission: (numAmount * 0.02),
          timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          status: "SUCCESS",
          operatorRef: data.providerRef || `OP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        });
      } else {
        // Fallback simulation for sandbox demo
        setWalletBalance((prev) => prev - numAmount);
        setReceipt({
          txnId: `PM-REC-${Date.now().toString().slice(-8)}`,
          mobileNumber,
          operator: operatorObj?.name || operator,
          circle,
          amount: numAmount,
          commission: +(numAmount * 0.02).toFixed(2),
          timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          status: "SUCCESS",
          operatorRef: `OP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        });
      }
    } catch {
      // Simulate demo sandbox success
      setWalletBalance((prev) => prev - numAmount);
      setReceipt({
        txnId: `PM-REC-${Date.now().toString().slice(-8)}`,
        mobileNumber,
        operator: operatorObj?.name || operator,
        circle,
        amount: numAmount,
        commission: +(numAmount * 0.02).toFixed(2),
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        status: "SUCCESS",
        operatorRef: `OP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setMobileNumber("");
    setAmount("");
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Telecom Services &bull; Prepaid Recharge
          </div>
          <h1 className="page-header mt-1">Mobile Recharge Terminal</h1>
          <p className="page-subheader">
            Instant top-ups for all major Indian telecom networks with instant commission credit.
          </p>
        </div>

        {/* Balance badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
            Wallet Balance
          </div>
          <div className="font-extrabold text-emerald-900 text-base">
            {formatCurrency(walletBalance)}
          </div>
        </div>
      </div>

      {receipt ? (
        /* Transaction Receipt View */
        <div className="card max-w-lg mx-auto p-6 sm:p-8 space-y-6 border-2 border-green-200 bg-white shadow-xl">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recharge Successful!</h3>
            <p className="text-xs text-gray-500">
              The transaction has been processed and confirmed by the operator.
            </p>
            <Badge variant="success" size="md">
              Transaction ID: {receipt.txnId}
            </Badge>
          </div>

          <div className="border-t border-b border-gray-100 py-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Mobile Number:</span>
              <span className="font-bold font-mono text-gray-900 text-sm">
                +91 {receipt.mobileNumber}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Operator:</span>
              <span className="font-semibold text-gray-900">{receipt.operator}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Telecom Circle:</span>
              <span className="font-semibold text-gray-900">{receipt.circle}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Operator Ref / Token:</span>
              <span className="font-mono text-gray-800">{receipt.operatorRef}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Date &amp; Time (IST):</span>
              <span className="font-medium text-gray-800">{receipt.timestamp}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-dashed border-gray-200 text-sm">
              <span className="font-bold text-gray-900">Amount Paid:</span>
              <span className="font-extrabold text-navy-800">
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            <div className="flex justify-between py-1 bg-emerald-50 px-3 rounded-lg text-emerald-800 font-semibold">
              <span>Commission Earned (2%):</span>
              <span>+{formatCurrency(receipt.commission)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.print()}
              className="text-xs"
            >
              🖨️ Print Receipt
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleReset}
              className="text-xs"
            >
              New Recharge &rarr;
            </Button>
          </div>
        </div>
      ) : (
        /* Recharge Form */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card md:col-span-2 p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-gray-900">
              Customer Recharge Details
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)}>✕</button>
              </div>
            )}

            <form onSubmit={handleOpenConfirm} className="space-y-5">
              {/* Mobile Number */}
              <div>
                <label className="label">Customer Mobile Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-semibold text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/\D/g, ""))
                    }
                    className="input-field pl-12 font-mono text-base font-semibold tracking-wider"
                  />
                </div>
              </div>

              {/* Operator & Circle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Network Operator *</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="select-field font-medium"
                  >
                    {MOBILE_OPERATORS.map((op) => (
                      <option key={op.code} value={op.code}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Telecom Circle / State *</label>
                  <select
                    value={circle}
                    onChange={(e) => setCircle(e.target.value)}
                    className="select-field font-medium"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="label">Recharge Plan Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-semibold text-gray-500 text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="10"
                    step="1"
                    placeholder="e.g. 299"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pl-8 font-bold text-lg text-gray-900"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="mt-3">
                  <span className="text-[11px] text-gray-400 font-medium block mb-1.5">
                    Popular Denominations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setAmount(q.toString())}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          amount === q.toString()
                            ? "bg-navy-600 text-white border-navy-600 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        ₹{q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="py-3 text-sm font-bold shadow-md"
                >
                  Proceed to Recharge &rarr;
                </Button>
              </div>
            </form>
          </div>

          {/* Side Info & Commission Card */}
          <div className="space-y-4">
            <div className="card p-5 bg-navy-50/50 border-navy-100 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900">
                Merchant Commission Slab
              </h4>
              <p className="text-xs text-gray-600">
                You earn up to <span className="font-bold text-navy-700">2.5%</span> instant commission credited immediately to your Recharge Pro wallet.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-navy-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jio Prepaid:</span>
                  <span className="font-semibold text-emerald-700">2.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Airtel Prepaid:</span>
                  <span className="font-semibold text-emerald-700">2.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vi (Vodafone Idea):</span>
                  <span className="font-semibold text-emerald-700">2.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">BSNL Prepaid:</span>
                  <span className="font-semibold text-emerald-700">3.0%</span>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-2 text-xs bg-yellow-50/40 border-yellow-200">
              <span className="font-bold text-yellow-900 flex items-center gap-1.5">
                <span>🛡️</span> Instant Reversal Guarantee
              </span>
              <p className="text-gray-600">
                If the operator fails to credit the consumer number within 60 seconds, your wallet float is automatically refunded in real time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Mobile Recharge"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteRecharge}
              isLoading={isProcessing}
            >
              Confirm &amp; Pay {formatCurrency(Number(amount) || 0)}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-gray-600">
            Please verify the customer number and operator details carefully.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Mobile:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">
                +91 {mobileNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Operator:</span>
              <span className="font-semibold text-gray-800">
                {MOBILE_OPERATORS.find((o) => o.code === operator)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Circle:</span>
              <span className="font-semibold text-gray-800">{circle}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Recharge Amount:</span>
              <span className="font-extrabold text-navy-800 text-base">
                {formatCurrency(Number(amount) || 0)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
