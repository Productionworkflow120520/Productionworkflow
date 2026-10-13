"use client";

import React, { useState, useEffect } from "react";
import { Button, Badge, Modal, LoadingSpinner } from "@/components/ui";
import { DTH_OPERATORS, MOBILE_OPERATORS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface DthResult {
  subscriberId: string;
  operator: string;
  operatorName: string;
  customerName: string;
  status: "ACTIVE" | "DEACTIVE" | "SUSPENDED" | "UNKNOWN";
  balance: number;
  monthlyRecharge: number;
  nextRechargeDate: string;
  planName: string;
  registeredMobile: string;
  providerReference: string;
  internalCaseReference: string;
  verificationStatus: "VERIFIED" | "INCONCLUSIVE" | "FAILED";
  isRegisteredNameAuthorized: boolean;
  disclaimer: string;
  verifiedAt: string;
}

interface MobileResult {
  mobile: string;
  operator: string;
  operatorName: string;
  circle: string;
  isPorted: boolean;
  transactionId?: string;
  rechargeStatus: "SUCCESS" | "PENDING" | "FAILED" | "NOT_FOUND";
  amount?: number;
  providerReference: string;
  internalCaseReference: string;
  verificationStatus: "VERIFIED" | "INCONCLUSIVE" | "FAILED";
  disclaimer: string;
  verifiedAt: string;
}

interface CaseItem {
  id: string;
  caseReference: string;
  service: "DTH" | "MOBILE";
  identifier: string;
  operator: string;
  customerName?: string;
  status: "PENDING_OPERATOR_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  priority: "NORMAL" | "HIGH" | "URGENT";
  referredReason: string;
  providerReference?: string;
  assignedOperator?: string;
  operatorNotes?: string;
  createdAt: string;
}

const SAMPLE_DTH_TEST_CASES = [
  { label: "Tata Play (Active)", op: "TATA_PLAY", id: "1002938475" },
  { label: "Tata Play (Family)", op: "TATA_PLAY", id: "1000123456" },
  { label: "Airtel DTH (Active)", op: "AIRTEL_DTH", id: "3002948172" },
  { label: "Dish TV (Inactive / Due)", op: "DISH_TV", id: "0251928374" },
  { label: "Sun Direct (Active)", op: "SUN_DIRECT", id: "4820193821" },
  { label: "D2H (Active)", op: "D2H", id: "1829384719" },
];

function OperatorVerificationTerminalComponent() {
  const [activeTab, setActiveTab] = useState<"dth" | "mobile" | "cases" | "providers">("dth");

  // DTH State
  const [dthOperator, setDthOperator] = useState("TATA_PLAY");
  const [dthSubscriberId, setDthSubscriberId] = useState("");
  const [dthLoading, setDthLoading] = useState(false);
  const [dthResult, setDthResult] = useState<DthResult | null>(null);
  const [dthError, setDthError] = useState<string | null>(null);

  // Mobile State
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOperator, setMobileOperator] = useState("JIO");
  const [mobileTxnId, setMobileTxnId] = useState("");
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileResult, setMobileResult] = useState<MobileResult | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);

  // Referral Modal State
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referReason, setReferReason] = useState("");
  const [referPriority, setReferPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("HIGH");
  const [isSubmittingRefer, setIsSubmittingRefer] = useState(false);
  const [referSuccessMsg, setReferSuccessMsg] = useState<string | null>(null);
  const [referErrorMsg, setReferErrorMsg] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Cases Queue State
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [caseFilterStatus, setCaseFilterStatus] = useState("ALL");

  const sampleDthTestCases = SAMPLE_DTH_TEST_CASES;

  // Fetch operator queue cases
  const fetchCases = async () => {
    setCasesLoading(true);
    try {
      const res = await fetch(`/api/verify/cases?status=${caseFilterStatus}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch {
      // retain local
    } finally {
      setCasesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "cases") {
      fetchCases();
    }
  }, [activeTab, caseFilterStatus]);

  // Handle DTH Verification
  const handleVerifyDth = async (e: React.FormEvent) => {
    e.preventDefault();
    setDthError(null);
    setDthResult(null);

    if (!dthSubscriberId || dthSubscriberId.trim().length < 5) {
      setDthError("Please enter a valid Subscriber ID / VC Number (minimum 5 digits).");
      return;
    }

    setDthLoading(true);
    try {
      const res = await fetch("/api/verify/dth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator: dthOperator,
          subscriberId: dthSubscriberId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify DTH subscriber with provider.");
      }
      setDthResult(data.data);
    } catch (err: any) {
      setDthError(err.message || "Failed to contact DTH provider gateway.");
    } finally {
      setDthLoading(false);
    }
  };

  // Handle Mobile Verification
  const handleVerifyMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError(null);
    setMobileResult(null);

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      setMobileError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setMobileLoading(true);
    try {
      const res = await fetch("/api/verify/mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobileNumber.trim(),
          operator: mobileOperator,
          transactionId: mobileTxnId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify mobile recharge details.");
      }
      setMobileResult(data.data);
    } catch (err: any) {
      setMobileError(err.message || "Failed to contact telecom gateway.");
    } finally {
      setMobileLoading(false);
    }
  };

  // Handle Refer to Operator
  const handleReferCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referReason.trim()) return;

    setIsSubmittingRefer(true);
    setReferErrorMsg(null);
    try {
      const payload = {
        service: dthResult ? "DTH" : "MOBILE",
        identifier: dthResult ? dthResult.subscriberId : mobileResult?.mobile || "",
        operator: dthResult ? dthResult.operator : mobileResult?.operator || "",
        caseReference: dthResult ? dthResult.internalCaseReference : mobileResult?.internalCaseReference,
        customerName: dthResult?.customerName,
        providerReference: dthResult ? dthResult.providerReference : mobileResult?.providerReference,
        reason: referReason.trim(),
        priority: referPriority,
      };

      const res = await fetch("/api/verify/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReferSuccessMsg("Account successfully routed to Operator Verification Desk!");
        setTimeout(() => {
          setIsReferModalOpen(false);
          setReferSuccessMsg(null);
          setReferErrorMsg(null);
          setReferReason("");
        }, 1500);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setReferErrorMsg(errJson.error || "Failed to escalate case to operator desk.");
      }
    } catch (err: any) {
      setReferErrorMsg(err.message || "Failed to communicate with operator escalation gateway.");
    } finally {
      setIsSubmittingRefer(false);
    }
  };

  // Update Case Status
  const handleUpdateCaseStatus = async (caseId: string, status: "IN_PROGRESS" | "RESOLVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/verify/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          operatorNotes: `Updated to ${status} by Operator on ${new Date().toLocaleTimeString()}`,
          assignedOperator: "OPR-Self",
        }),
      });
      if (res.ok) {
        fetchCases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-navy-950 uppercase tracking-wider">
              🛡️ Verification Gateway
            </span>
            <span className="text-xs text-indigo-200">Authorized Provider API Integration</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Mobile &amp; DTH Operator Verification System
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
            Real-time subscriber name validation, plan inquiry, HLR operator check, provider reference tracking, and operator routing desk.
          </p>
        </div>
      </div>

      {actionToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{actionToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2 gap-2 select-none">
        <button
          onClick={() => setActiveTab("dth")}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "dth"
              ? "border-navy-600 text-navy-900"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>📺</span>
          <span>DTH Customer Verification</span>
        </button>
        <button
          onClick={() => setActiveTab("mobile")}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "mobile"
              ? "border-navy-600 text-navy-900"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>📱</span>
          <span>Mobile Recharge Verification</span>
        </button>
        <button
          onClick={() => setActiveTab("cases")}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "cases"
              ? "border-navy-600 text-navy-900"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>📋</span>
          <span>Operator Review Queue</span>
          {cases.filter((c) => c.status === "PENDING_OPERATOR_REVIEW").length > 0 && (
            <span className="bg-amber-500 text-navy-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {cases.filter((c) => c.status === "PENDING_OPERATOR_REVIEW").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 fast-tap touch-manipulation active:scale-[0.98] ${
            activeTab === "providers"
              ? "border-navy-600 text-navy-900"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>🔌</span>
          <span>Provider API Spec</span>
        </button>
      </div>

      {/* TAB 1: DTH Customer Name & Account Verification */}
      {activeTab === "dth" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">DTH Account Verification</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Retrieve registered customer name, account balance, and plan details from the authorized provider.
              </p>
            </div>

            {/* Quick Test Chips */}
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                ⚡ Quick Test Sample Accounts
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {sampleDthTestCases.map((tc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDthOperator(tc.op);
                      setDthSubscriberId(tc.id);
                      setDthResult(null);
                      setDthError(null);
                    }}
                    className="text-left p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-navy-500 hover:bg-slate-100 transition-all text-xs font-medium text-slate-700 truncate"
                  >
                    <div className="text-[10px] text-gray-400 font-mono">{tc.id}</div>
                    <div className="truncate font-semibold">{tc.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleVerifyDth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  DTH Operator
                </label>
                <select
                  value={dthOperator}
                  onChange={(e) => setDthOperator(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {DTH_OPERATORS.map((op) => (
                    <option key={op.code} value={op.code}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subscriber ID / VC Number
                </label>
                <input
                  type="text"
                  value={dthSubscriberId}
                  onChange={(e) => setDthSubscriberId(e.target.value)}
                  placeholder="e.g. 1002938475"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500"
                />
              </div>

              {dthError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{dthError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={dthLoading}
                className="w-full"
              >
                🔍 Query Provider API &amp; Verify Name
              </Button>
            </form>
          </div>

          {/* Verification Results Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1">Provider Verification Response</h2>
            <p className="text-xs text-gray-500 mb-4">
              Real-time response returned by authorized operator switch
            </p>

            {dthLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <span className="text-xs text-gray-500 mt-3 font-medium">
                  Connecting to {DTH_OPERATORS.find((o) => o.code === dthOperator)?.name} gateway...
                </span>
              </div>
            ) : dthResult ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Customer Name Hero Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-navy-900 text-white shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
                      Registered Customer Name
                    </span>
                    <Badge variant={dthResult.status === "ACTIVE" ? "success" : "warning"}>
                      {dthResult.status === "ACTIVE"
                        ? "Active"
                        : dthResult.status === "DEACTIVE"
                        ? "Inactive"
                        : dthResult.status === "SUSPENDED"
                        ? "Suspended"
                        : dthResult.status}
                    </Badge>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight">
                    {dthResult.customerName}
                  </div>
                  <div className="text-xs text-indigo-200 mt-1 flex items-center gap-3">
                    <span>{dthResult.operatorName}</span>
                    <span>•</span>
                    <span className="font-mono">VC: {dthResult.subscriberId}</span>
                  </div>
                </div>

                {/* Account Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Account Balance</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(dthResult.balance)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Monthly Plan</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(dthResult.monthlyRecharge)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Next Due Date</span>
                    <span className="text-sm font-bold text-indigo-700">{dthResult.nextRechargeDate}</span>
                  </div>
                </div>

                {/* Plan Details Card */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase block mb-1">Subscribed Base Pack</span>
                  <div className="text-xs font-bold text-gray-800">{dthResult.planName}</div>
                </div>

                {/* References Box (Crucial Requirement) */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span>📑</span>
                    <span>Account Reference Handling</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block font-semibold">Provider API Reference:</span>
                      <span className="font-mono font-bold text-navy-900">{dthResult.providerReference}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-semibold">Internal Case Reference:</span>
                      <span className="font-mono font-bold text-indigo-700">{dthResult.internalCaseReference}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-800 leading-relaxed border-t border-amber-200/60 pt-2 italic">
                    ⚠️ {dthResult.disclaimer}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Verified on {formatDateTime(dthResult.verifiedAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsReferModalOpen(true)}
                      className="border-amber-300 text-amber-900 bg-amber-100/50 hover:bg-amber-100"
                    >
                      🚨 Route / Refer to Operator Desk
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActionToast(`Directing to transaction gateway for ${dthResult.customerName} (${dthResult.subscriberId})...`);
                        setTimeout(() => setActionToast(null), 4000);
                      }}
                    >
                      💳 Recharge Account
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-3xl mb-2">📡</div>
                <div className="text-xs font-bold text-gray-600">No Subscriber Queried Yet</div>
                <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                  Select an operator and enter a Subscriber ID on the left, or pick one of the quick test chips to fetch live customer verification.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Mobile Recharge Verification */}
      {activeTab === "mobile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Mobile Recharge Verification</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify mobile number HLR, active telecom operator, circle, and transaction reference.
              </p>
            </div>

            <form onSubmit={handleVerifyMobile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Expected Operator (Auto-detected if blank)
                </label>
                <select
                  value={mobileOperator}
                  onChange={(e) => setMobileOperator(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {MOBILE_OPERATORS.map((op) => (
                    <option key={op.code} value={op.code}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Recharge Transaction ID (Optional, to verify status)
                </label>
                <input
                  type="text"
                  value={mobileTxnId}
                  onChange={(e) => setMobileTxnId(e.target.value)}
                  placeholder="e.g. TXN-20261013-0091"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 font-mono"
                />
              </div>

              {mobileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{mobileError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={mobileLoading}
                className="w-full"
              >
                🔍 Query Mobile HLR &amp; Transaction
              </Button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1">Mobile Verification Response</h2>
            <p className="text-xs text-gray-500 mb-4">
              Real-time telecom operator gateway response
            </p>

            {mobileLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <span className="text-xs text-gray-500 mt-3 font-medium">
                  Querying telecom HLR gateway...
                </span>
              </div>
            ) : mobileResult ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-navy-900 text-white shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
                      HLR Verification
                    </span>
                    <Badge variant={mobileResult.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                      {mobileResult.rechargeStatus}
                    </Badge>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight font-mono">
                    +91 {mobileResult.mobile}
                  </div>
                  <div className="text-xs text-indigo-200 mt-1 flex items-center gap-3">
                    <span>{mobileResult.operatorName}</span>
                    <span>•</span>
                    <span>{mobileResult.circle}</span>
                    {mobileResult.isPorted && (
                      <span className="bg-amber-400 text-navy-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                        PORTED (MNP)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Operator Reference</span>
                    <span className="text-xs font-mono font-bold text-gray-900">{mobileResult.providerReference}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Internal Case ID</span>
                    <span className="text-xs font-mono font-bold text-indigo-700">{mobileResult.internalCaseReference}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Verified on {formatDateTime(mobileResult.verifiedAt)}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsReferModalOpen(true)}
                    className="border-amber-300 text-amber-900 bg-amber-100/50 hover:bg-amber-100"
                  >
                    🚨 Route / Refer to Operator Desk
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-3xl mb-2">📱</div>
                <div className="text-xs font-bold text-gray-600">No Mobile Number Queried Yet</div>
                <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                  Enter a 10-digit mobile number on the left to verify operator HLR, circle, and transaction status.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Operator Review Queue */}
      {activeTab === "cases" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Operator Verification Desk Queue</h2>
              <p className="text-xs text-gray-500">
                Accounts referred for manual intervention or verification resolution
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={caseFilterStatus}
                onChange={(e) => setCaseFilterStatus(e.target.value)}
                className="text-xs p-2 rounded-lg border border-gray-300 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_OPERATOR_REVIEW">Pending Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button variant="secondary" size="sm" onClick={fetchCases} isLoading={casesLoading}>
                Refresh Queue
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Case Ref</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Identifier / Customer</th>
                  <th className="p-3">Referred Reason</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-navy-800">{c.caseReference}</td>
                    <td className="p-3">
                      <span className="font-semibold text-gray-700">{c.service}</span>
                      <span className="text-[10px] text-gray-400 block">{c.operator}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">{c.customerName || "N/A"}</div>
                      <div className="font-mono text-gray-500 text-[11px]">{c.identifier}</div>
                    </td>
                    <td className="p-3 text-gray-600 max-w-xs truncate" title={c.referredReason}>
                      {c.referredReason}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={c.priority === "URGENT" ? "danger" : c.priority === "HIGH" ? "warning" : "default"}
                      >
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          c.status === "RESOLVED"
                            ? "success"
                            : c.status === "IN_PROGRESS"
                            ? "warning"
                            : c.status === "REJECTED"
                            ? "danger"
                            : "default"
                        }
                      >
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {c.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateCaseStatus(c.id, "RESOLVED")}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold"
                        >
                          Resolve
                        </button>
                      )}
                      {c.status === "PENDING_OPERATOR_REVIEW" && (
                        <button
                          onClick={() => handleUpdateCaseStatus(c.id, "IN_PROGRESS")}
                          className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-semibold"
                        >
                          Take Case
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Provider Integration Architecture */}
      {activeTab === "providers" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Authorized Provider Integration Architecture</h2>
            <p className="text-xs text-gray-500">
              Technical integration specifications for authorized DTH &amp; Mobile verification switches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">Option A: IMB Developer API</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">HLR &amp; RECHARGE</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Supports mobile recharge transaction status lookup and Mobile HLR circle/operator verification.
                Production endpoints require secure HTTP headers with authorized API token.
              </p>
              <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                POST https://api.imb.org.in/v1/mobile/hlr-check<br/>
                Headers: Authorization: Bearer &#123;IMB_API_KEY&#125;
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">Option B: ZuelPay DTH Info API</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">CUSTOMER NAME &amp; PLAN</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Provides real-time DTH subscriber info fetch: registered customer name, current balance, next recharge date, and base pack name.
              </p>
              <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                POST https://zuelpay.in/api/dth/info-fetch<br/>
                Payload: &#123; operator: &quot;TATA_PLAY&quot;, subscriber_id: &quot;...&quot; &#125;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refer Case Modal */}
      <Modal
        isOpen={isReferModalOpen}
        onClose={() => setIsReferModalOpen(false)}
        title="Escalate Account to Operator Desk"
      >
        <form onSubmit={handleReferCase} className="space-y-4">
          <p className="text-xs text-gray-600">
            Route this account to an authorized verification operator for manual inspection or provider callback resolution.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={referPriority}
              onChange={(e) => setReferPriority(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white"
            >
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority (Urgent Customer)</option>
              <option value="URGENT">Urgent (Transaction Mismatch / Dispute)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason for Escalation
            </label>
            <textarea
              required
              rows={3}
              value={referReason}
              onChange={(e) => setReferReason(e.target.value)}
              placeholder="e.g. Registered name does not match KYC document, or provider API returned unexpected timeout."
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {referSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              ✅ {referSuccessMsg}
            </div>
          )}

          {referErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              ⚠️ {referErrorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsReferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingRefer}
            >
              Confirm Escalation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export const OperatorVerificationTerminal = React.memo(OperatorVerificationTerminalComponent);
export default OperatorVerificationTerminal;
