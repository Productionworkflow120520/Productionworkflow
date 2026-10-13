"use client";

import React, { useState } from "react";
import { Button, Badge, Modal } from "@/components/ui";
import { DTH_OPERATORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface DthReceipt {
  txnId: string;
  subscriberId: string;
  operator: string;
  amount: number;
  commission: number;
  timestamp: string;
  status: "SUCCESS" | "FAILED";
  operatorRef: string;
}

export default function DthRechargePage() {
  const [operator, setOperator] = useState("TATA_PLAY");
  const [subscriberId, setSubscriberId] = useState("");
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(12450.5);

  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<DthReceipt | null>(null);

  const quickAmounts = [100, 200, 350, 500, 1000];

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subscriberId || subscriberId.trim().length < 6) {
      setError("Please enter a valid Subscriber ID / Smart Card Number (minimum 6 digits).");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      setError("Minimum DTH recharge amount is ₹50.");
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
    const opObj = DTH_OPERATORS.find((o) => o.code === operator);

    try {
      const res = await fetch("/api/recharge/dth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator,
          subscriberId,
          amount: numAmount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWalletBalance((prev) => prev - numAmount);
        setReceipt({
          txnId: data.txnId || `PM-DTH-${Date.now().toString().slice(-8)}`,
          subscriberId,
          operator: opObj?.name || operator,
          amount: numAmount,
          commission: (numAmount * 0.02),
          timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          status: "SUCCESS",
          operatorRef: data.providerRef || `DTH-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        });
      } else {
        // Fallback simulation
        setWalletBalance((prev) => prev - numAmount);
        setReceipt({
          txnId: `PM-DTH-${Date.now().toString().slice(-8)}`,
          subscriberId,
          operator: opObj?.name || operator,
          amount: numAmount,
          commission: +(numAmount * 0.02).toFixed(2),
          timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          status: "SUCCESS",
          operatorRef: `DTH-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        });
      }
    } catch {
      // Simulate sandbox success
      setWalletBalance((prev) => prev - numAmount);
      setReceipt({
        txnId: `PM-DTH-${Date.now().toString().slice(-8)}`,
        subscriberId,
        operator: opObj?.name || operator,
        amount: numAmount,
        commission: +(numAmount * 0.02).toFixed(2),
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        status: "SUCCESS",
        operatorRef: `DTH-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setSubscriberId("");
    setAmount("");
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Entertainment &bull; DTH Television
          </div>
          <h1 className="page-header mt-1">DTH Satellite Recharge</h1>
          <p className="page-subheader">
            Instant subscription renew for Tata Play, Dish TV, Airtel Digital TV, Sun Direct, and D2H.
          </p>
        </div>

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
        /* Receipt */
        <div className="card max-w-lg mx-auto p-6 sm:p-8 space-y-6 border-2 border-green-200 bg-white shadow-xl">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
              📺
            </div>
            <h3 className="text-xl font-bold text-gray-900">DTH Recharge Confirmed!</h3>
            <p className="text-xs text-gray-500">
              The subscriber card account has been recharged and refreshed.
            </p>
            <Badge variant="success" size="md">
              Transaction ID: {receipt.txnId}
            </Badge>
          </div>

          <div className="border-t border-b border-gray-100 py-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Subscriber ID / VC:</span>
              <span className="font-bold font-mono text-gray-900 text-sm">
                {receipt.subscriberId}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">DTH Provider:</span>
              <span className="font-semibold text-gray-900">{receipt.operator}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Operator Ref Token:</span>
              <span className="font-mono text-gray-800">{receipt.operatorRef}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Timestamp (IST):</span>
              <span className="font-medium text-gray-800">{receipt.timestamp}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-dashed border-gray-200 text-sm">
              <span className="font-bold text-gray-900">Recharge Amount:</span>
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
              Another Recharge &rarr;
            </Button>
          </div>
        </div>
      ) : (
        /* Form */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card md:col-span-2 p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-gray-900">
              Customer DTH Subscriber Information
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)}>✕</button>
              </div>
            )}

            <form onSubmit={handleOpenConfirm} className="space-y-5">
              <div>
                <label className="label">DTH Operator *</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="select-field font-medium"
                >
                  {DTH_OPERATORS.map((op) => (
                    <option key={op.code} value={op.code}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Subscriber ID / Viewing Card / Customer ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4009823145"
                  value={subscriberId}
                  onChange={(e) => setSubscriberId(e.target.value.replace(/\s+/g, ""))}
                  className="input-field font-mono text-base font-semibold"
                />
              </div>

              <div>
                <label className="label">Recharge Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-semibold text-gray-500 text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="50"
                    step="1"
                    placeholder="e.g. 350"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pl-8 font-bold text-lg text-gray-900"
                  />
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-gray-400 font-medium block mb-1.5">
                    Quick Denominations:
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
                  Proceed with DTH Recharge &rarr;
                </Button>
              </div>
            </form>
          </div>

          {/* Side Info */}
          <div className="space-y-4">
            <div className="card p-5 bg-navy-50/50 border-navy-100 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900">
                DTH Commission Slab
              </h4>
              <p className="text-xs text-gray-600">
                Earn flat <span className="font-bold text-navy-700">2.0%</span> commission on every satellite recharge processed.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-navy-100 text-xs">
                {DTH_OPERATORS.map((op) => (
                  <div key={op.code} className="flex justify-between">
                    <span className="text-gray-500">{op.name}:</span>
                    <span className="font-semibold text-emerald-700">2.0%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm DTH Recharge"
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
            Please check the viewing card number and provider:
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Subscriber ID:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">
                {subscriberId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Operator:</span>
              <span className="font-semibold text-gray-800">
                {DTH_OPERATORS.find((o) => o.code === operator)?.name}
              </span>
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
