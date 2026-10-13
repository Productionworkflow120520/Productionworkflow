"use client";

import React, { useState } from "react";
import { Button, Badge, Modal } from "@/components/ui";
import {
  MOBILE_OPERATORS,
  DTH_OPERATORS,
  BBPS_CATEGORIES,
  INDIAN_STATES,
} from "@/lib/constants";
import { formatCurrency, isValidMobile } from "@/lib/utils";

interface CustomerServicesViewProps {
  initialService?: "mobile" | "dth" | "bbps";
  userWalletBalance?: number;
}

const QUICK_AMOUNTS = [99, 149, 199, 299, 479, 719, 1000];

function CustomerServicesViewComponent({
  initialService = "mobile",
  userWalletBalance = 25000,
}: CustomerServicesViewProps) {
  const [activeTab, setActiveTab] = useState<"mobile" | "dth" | "bbps">(initialService);
  const [balance, setBalance] = useState(userWalletBalance);

  // Mobile Recharge State
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOperator, setMobileOperator] = useState("JIO");
  const [mobileCircle, setMobileCircle] = useState("Maharashtra");
  const [mobileAmount, setMobileAmount] = useState("");

  // DTH Recharge State
  const [dthCustomerId, setDthCustomerId] = useState("");
  const [dthOperator, setDthOperator] = useState("TATA_PLAY");
  const [dthAmount, setDthAmount] = useState("");

  // BBPS State
  const [bbpsCategory, setBbpsCategory] = useState("ELECTRICITY");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [billerName, setBillerName] = useState("Mahavitaran - MSEDCL");
  const [bbpsAmount, setBbpsAmount] = useState("");

  // Common UI State
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{
    txnId: string;
    service: string;
    targetNumber: string;
    provider: string;
    amount: number;
    commission: number;
    operatorRef: string;
    timestamp: string;
  } | null>(null);

  const quickAmounts = QUICK_AMOUNTS;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let numAmount = 0;
    if (activeTab === "mobile") {
      if (!isValidMobile(mobileNumber)) {
        setError("Please enter a valid 10-digit Indian mobile number (e.g. 98XXXXXXXX).");
        return;
      }
      numAmount = parseFloat(mobileAmount);
      if (isNaN(numAmount) || numAmount < 10) {
        setError("Minimum mobile recharge amount is ₹10.");
        return;
      }
    } else if (activeTab === "dth") {
      if (!dthCustomerId || dthCustomerId.length < 5) {
        setError("Please enter a valid DTH Subscriber ID / Smart Card Number.");
        return;
      }
      numAmount = parseFloat(dthAmount);
      if (isNaN(numAmount) || numAmount < 50) {
        setError("Minimum DTH recharge amount is ₹50.");
        return;
      }
    } else {
      if (!consumerNumber || consumerNumber.length < 4) {
        setError("Please enter a valid Consumer / Account Number.");
        return;
      }
      numAmount = parseFloat(bbpsAmount);
      if (isNaN(numAmount) || numAmount < 10) {
        setError("Minimum bill payment amount is ₹10.");
        return;
      }
    }

    if (numAmount > balance) {
      setError(`Insufficient wallet balance (${formatCurrency(balance)}). Please top up your wallet.`);
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let endpoint = "/api/recharge/mobile";
      let payload: any = {};

      if (activeTab === "mobile") {
        endpoint = "/api/recharge/mobile";
        payload = {
          mobile: mobileNumber,
          operator: mobileOperator,
          circle: mobileCircle,
          amount: parseFloat(mobileAmount),
        };
      } else if (activeTab === "dth") {
        endpoint = "/api/recharge/dth";
        payload = {
          customerId: dthCustomerId,
          operator: dthOperator,
          amount: parseFloat(dthAmount),
        };
      } else {
        endpoint = "/api/bbps/pay";
        payload = {
          category: bbpsCategory,
          billerId: billerName,
          consumerNumber,
          amount: parseFloat(bbpsAmount),
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment execution failed");
      }

      const txn = data.transaction || {};
      const amt = payload.amount;
      const comm = txn.commission || amt * 0.025;

      setReceipt({
        txnId: txn.txnId || `TXN-${Date.now()}`,
        service: activeTab.toUpperCase(),
        targetNumber: payload.mobile || payload.customerId || payload.consumerNumber,
        provider: payload.operator || payload.billerId || activeTab,
        amount: amt,
        commission: comm,
        operatorRef: data.operatorRef || `OP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        timestamp: new Date().toISOString(),
      });

      // Update remaining local balance
      setBalance((prev) => Math.max(0, prev - amt + comm));
      setIsConfirmOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to process payment");
      setIsConfirmOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 gpu-composite">
        <div>
          <span className="text-xs uppercase tracking-wider text-navy-300 font-semibold">
            ⚡ Transaction Terminal
          </span>
          <h2 className="text-xl font-bold mt-1">Recharge & BBPS Bill Payments</h2>
          <p className="text-xs text-navy-300 mt-0.5">
            Instant operator confirmation with automated commission crediting
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15">
          <span className="text-[11px] text-navy-200 block uppercase font-medium">
            Available Wallet Float
          </span>
          <span className="text-2xl font-black text-emerald-400">
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="flex border-b border-gray-200 gap-2 bg-white px-4 pt-2 rounded-t-xl select-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("mobile");
            setError(null);
            setReceipt(null);
          }}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all duration-150 flex items-center gap-2 border-b-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "mobile"
              ? "border-navy-600 text-navy-600 bg-navy-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📱 Mobile Recharge
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("dth");
            setError(null);
            setReceipt(null);
          }}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all duration-150 flex items-center gap-2 border-b-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "dth"
              ? "border-navy-600 text-navy-600 bg-navy-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📡 DTH Recharge
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("bbps");
            setError(null);
            setReceipt(null);
          }}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all duration-150 flex items-center gap-2 border-b-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "bbps"
              ? "border-navy-600 text-navy-600 bg-navy-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ⚡ BBPS Bill Payments
        </button>
      </div>

      {/* Main Service Card */}
      <div className="bg-white p-6 rounded-b-2xl border border-t-0 border-gray-100 shadow-xs">
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Receipt Banner */}
        {receipt && (
          <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="font-bold text-sm text-emerald-900">
                  Transaction Successful!
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-800">
                {receipt.txnId}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
              <div>
                <span className="text-gray-500 block">Service Number:</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {receipt.targetNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Operator / Biller:</span>
                <span className="font-semibold text-gray-900">
                  {receipt.provider}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Amount Paid:</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(receipt.amount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Operator Ref / UTR:</span>
                <span className="font-mono text-gray-800 font-medium">
                  {receipt.operatorRef}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleOpenConfirm} className="space-y-4 max-w-xl">
          {/* Mobile Recharge Form */}
          {activeTab === "mobile" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 9820112233"
                  className="input text-sm w-full font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Telecom Operator *
                  </label>
                  <select
                    value={mobileOperator}
                    onChange={(e) => setMobileOperator(e.target.value)}
                    className="select text-xs w-full"
                  >
                    {MOBILE_OPERATORS.map((op) => (
                      <option key={op.code} value={op.code}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Circle / Region *
                  </label>
                  <select
                    value={mobileCircle}
                    onChange={(e) => setMobileCircle(e.target.value)}
                    className="select text-xs w-full"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Recharge Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={mobileAmount}
                  onChange={(e) => setMobileAmount(e.target.value)}
                  placeholder="e.g. 299"
                  className="input text-sm w-full font-bold text-gray-900"
                />
              </div>
            </>
          )}

          {/* DTH Recharge Form */}
          {activeTab === "dth" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  DTH Subscriber ID / Smart Card Number *
                </label>
                <input
                  type="text"
                  required
                  value={dthCustomerId}
                  onChange={(e) => setDthCustomerId(e.target.value)}
                  placeholder="e.g. 1002345678"
                  className="input text-sm w-full font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  DTH Operator *
                </label>
                <select
                  value={dthOperator}
                  onChange={(e) => setDthOperator(e.target.value)}
                  className="select text-xs w-full"
                >
                  {DTH_OPERATORS.map((op) => (
                    <option key={op.code} value={op.code}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Recharge Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  value={dthAmount}
                  onChange={(e) => setDthAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="input text-sm w-full font-bold text-gray-900"
                />
              </div>
            </>
          )}

          {/* BBPS Form */}
          {activeTab === "bbps" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  BBPS Utility Category *
                </label>
                <select
                  value={bbpsCategory}
                  onChange={(e) => setBbpsCategory(e.target.value)}
                  className="select text-xs w-full"
                >
                  {BBPS_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Consumer / Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value)}
                  placeholder="e.g. 028510029381"
                  className="input text-sm w-full font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Biller / Board *
                </label>
                <input
                  type="text"
                  required
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  placeholder="e.g. Mahavitaran, BESCOM, Adani Gas"
                  className="input text-xs w-full"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Bill Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={bbpsAmount}
                  onChange={(e) => setBbpsAmount(e.target.value)}
                  placeholder="e.g. 1250"
                  className="input text-sm w-full font-bold text-gray-900"
                />
              </div>
            </>
          )}

          {/* Quick Amount Pills */}
          <div>
            <span className="text-[11px] font-medium text-gray-500 block mb-1.5">
              Quick Preset Amounts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    if (activeTab === "mobile") setMobileAmount(amt.toString());
                    else if (activeTab === "dth") setDthAmount(amt.toString());
                    else setBbpsAmount(amt.toString());
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-navy-50 hover:text-navy-700 rounded-md font-medium text-slate-700 border border-slate-200 transition-all duration-150 active:scale-95 fast-tap touch-manipulation select-none"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Proceed to Payment
          </Button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Payment Transaction"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Please verify the details below before authorizing wallet debit:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Service:</span>
              <span className="font-semibold text-gray-900 uppercase">
                {activeTab}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target / Account:</span>
              <span className="font-mono font-semibold text-gray-900">
                {activeTab === "mobile"
                  ? mobileNumber
                  : activeTab === "dth"
                  ? dthCustomerId
                  : consumerNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Operator / Board:</span>
              <span className="font-medium text-gray-900">
                {activeTab === "mobile"
                  ? mobileOperator
                  : activeTab === "dth"
                  ? dthOperator
                  : billerName}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-gray-700 font-semibold">Total Amount:</span>
              <span className="font-bold text-emerald-700 text-sm">
                ₹{activeTab === "mobile"
                  ? mobileAmount
                  : activeTab === "dth"
                  ? dthAmount
                  : bbpsAmount}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              onClick={handleExecutePayment}
            >
              Confirm & Debit Wallet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const CustomerServicesView = React.memo(CustomerServicesViewComponent);
export default CustomerServicesView;
