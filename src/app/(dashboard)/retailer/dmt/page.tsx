"use client";

import React, { useState, useEffect } from "react";
import { Button, Badge, Modal } from "@/components/ui";
import { formatCurrency, isValidMobile } from "@/lib/utils";

interface Beneficiary {
  id: string;
  beneficiaryId: string;
  accountNumber: string;
  maskedAccount: string;
  ifsc: string;
  bankName: string;
  recipientName: string;
  isVerified: boolean;
  status: string;
}

interface SenderData {
  id: string;
  senderId: string;
  mobile: string;
  name: string;
  isKycVerified: boolean;
  monthlyLimitInr: number;
  usedLimitInr: number;
  remainingLimitInr: number;
  status: string;
  beneficiaries: Beneficiary[];
}

interface TransferReceipt {
  txnId: string;
  bankRrn: string;
  transferMode: string;
  amountInr: number;
  beneficiaryName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  remitterMobile: string;
  remitterName: string;
  timestamp: string;
  status: string;
  feeInr: number;
  retailerEarningInr: number;
}

export default function DmtRemittancePage() {
  // Remitter Search
  const [searchMobile, setSearchMobile] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sender, setSender] = useState<SenderData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Registration Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    mobile: "",
    name: "",
    address: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // OTP Modal
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("123456");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Add Beneficiary Modal
  const [isAddBenOpen, setIsAddBenOpen] = useState(false);
  const [benForm, setBenForm] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
    recipientName: "",
    relation: "Family",
  });
  const [isAddingBen, setIsAddingBen] = useState(false);
  const [benError, setBenError] = useState<string | null>(null);

  // Transfer Modal
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMode, setTransferMode] = useState<"IMPS" | "NEFT">("IMPS");
  const [transferRemarks, setTransferRemarks] = useState("Fund Transfer");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isExecutingTransfer, setIsExecutingTransfer] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Penny Drop State
  const [pennyDropLoadingId, setPennyDropLoadingId] = useState<string | null>(null);

  // Receipt Modal
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  // Wallet Balance
  const [walletBalance, setWalletBalance] = useState<number>(25480.0);

  // Fetch initial wallet balance
  useEffect(() => {
    fetch("/api/wallets")
      .then((res) => res.json())
      .then((data) => {
        if (data.wallet?.balance) {
          setWalletBalance(Number(data.wallet.balance));
        }
      })
      .catch((err) => console.error("Could not fetch balance:", err));
  }, []);

  // Quick Amount presets
  const quickAmounts = [1000, 2000, 5000, 10000, 15000, 25000];

  // Search Remitter
  const handleSearchRemitter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    setSender(null);

    if (!isValidMobile(searchMobile)) {
      setSearchError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/dmt/sender?mobile=${searchMobile}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to search remitter");
      }

      if (data.found && data.sender) {
        setSender(data.sender);
      } else {
        // Not found: prefill regForm and prompt registration
        setRegForm((prev) => ({ ...prev, mobile: searchMobile }));
        setIsRegisterOpen(true);
      }
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Submit Remitter Registration
  const handleRegisterSender = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsRegistering(true);

    try {
      const res = await fetch("/api/dmt/sender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setIsRegisterOpen(false);
      setIsOtpOpen(true);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setIsVerifyingOtp(true);

    try {
      const res = await fetch("/api/dmt/sender/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: regForm.mobile || searchMobile,
          otp: otpValue,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setIsOtpOpen(false);
      // Reload sender
      setSearchMobile(regForm.mobile || searchMobile);
      handleSearchRemitter();
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Add Beneficiary
  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setBenError(null);

    if (benForm.accountNumber !== benForm.confirmAccountNumber) {
      setBenError("Account numbers do not match.");
      return;
    }

    if (!sender) return;

    setIsAddingBen(true);
    try {
      const res = await fetch("/api/dmt/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderMobile: sender.mobile,
          accountNumber: benForm.accountNumber,
          ifsc: benForm.ifsc,
          bankName: benForm.bankName,
          recipientName: benForm.recipientName,
          relation: benForm.relation,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add beneficiary");
      }

      setIsAddBenOpen(false);
      setBenForm({
        accountNumber: "",
        confirmAccountNumber: "",
        ifsc: "",
        bankName: "",
        recipientName: "",
        relation: "Family",
      });
      // Refresh sender
      handleSearchRemitter();
    } catch (err: any) {
      setBenError(err.message);
    } finally {
      setIsAddingBen(false);
    }
  };

  // Penny Drop Verification
  const handlePennyDrop = async (ben: Beneficiary) => {
    setPennyDropLoadingId(ben.id);
    try {
      const res = await fetch(`/api/dmt/beneficiaries/${ben.id}/penny-drop`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Penny drop verification failed");
      }

      // Update state
      if (sender) {
        setSender({
          ...sender,
          beneficiaries: sender.beneficiaries.map((b) =>
            b.id === ben.id ? { ...b, isVerified: true } : b
          ),
        });
      }
    } catch (err: any) {
      alert(`Penny Drop Verification Error: ${err.message}`);
    } finally {
      setPennyDropLoadingId(null);
    }
  };

  // Open Transfer Modal
  const handleOpenTransfer = (ben: Beneficiary) => {
    setSelectedBen(ben);
    setTransferAmount("");
    setTransferError(null);
    setIsTransferModalOpen(true);
  };

  // Execute Transfer
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt < 100) {
      setTransferError("Minimum transfer amount is ₹100.");
      return;
    }

    if (!sender || !selectedBen) return;

    if (amt > sender.remainingLimitInr) {
      setTransferError(
        `Amount exceeds remaining monthly quota (₹${sender.remainingLimitInr.toLocaleString("en-IN")}).`
      );
      return;
    }

    const estimatedDebit = amt + Math.max(10, Math.round(amt * 0.01)) - (amt * 0.004);
    if (estimatedDebit > walletBalance) {
      setTransferError(
        `Insufficient retailer wallet balance (${formatCurrency(walletBalance)}).`
      );
      return;
    }

    setIsExecutingTransfer(true);
    try {
      const res = await fetch("/api/dmt/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderMobile: sender.mobile,
          beneficiaryId: selectedBen.id,
          amount: amt,
          transferMode,
          remarks: transferRemarks,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Money transfer failed");
      }

      setIsTransferModalOpen(false);
      setReceipt(data);
      // Update local wallet balance and remitter quota
      setWalletBalance((prev) => prev - estimatedDebit);
      handleSearchRemitter();
    } catch (err: any) {
      setTransferError(err.message);
    } finally {
      setIsExecutingTransfer(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Domestic Money Transfer (DMT)</h1>
          <p className="page-subheader">
            RBI-compliant instant IMPS & NEFT remittance with bank-grade ledger security
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-right shadow-sm">
            <span className="text-xs text-gray-500 block">Available Float</span>
            <span className="text-lg font-bold text-navy-500">
              {formatCurrency(walletBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Remitter Search Card */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>🔍</span> 1. Customer / Remitter Identification
        </h2>
        <form onSubmit={handleSearchRemitter} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="tel"
              maxLength={10}
              placeholder="Enter 10-digit Remitter Mobile Number"
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, ""))}
              className="input-field text-base font-mono tracking-wider"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSearching}
            disabled={searchMobile.length !== 10}
          >
            Find or Register Remitter
          </Button>
        </form>

        {searchError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {searchError}
          </div>
        )}
      </div>

      {/* Remitter Details Card & Monthly Limit Bar */}
      {sender && (
        <div className="card border-l-4 border-l-navy-500 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">{sender.name}</span>
                <Badge variant={sender.isKycVerified ? "success" : "neutral"}>
                  {sender.isKycVerified ? "KYC Verified" : "Non-KYC Remitter"}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                Mobile: <span className="font-mono font-medium text-gray-800">{sender.mobile}</span> | Remitter ID:{" "}
                <span className="font-mono text-gray-700">{sender.senderId}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddBenOpen(true)}
            >
              + Add New Beneficiary
            </Button>
          </div>

          {/* Monthly Remittance Quota */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1.5">
              <span>Monthly Remittance Limit</span>
              <span>
                Consumed: <strong className="text-gray-900">{formatCurrency(sender.usedLimitInr)}</strong> of{" "}
                <strong className="text-navy-500">{formatCurrency(sender.monthlyLimitInr)}</strong>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  (sender.usedLimitInr / sender.monthlyLimitInr) > 0.8 ? "bg-amber-500" : "bg-navy-500"
                }`}
                style={{
                  width: `${Math.min(100, (sender.usedLimitInr / sender.monthlyLimitInr) * 100)}%`,
                }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-green-700 font-medium">
                Remaining Limit: {formatCurrency(sender.remainingLimitInr)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary List */}
      {sender && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>🏦</span> 2. Select Beneficiary Account
            </h2>
            <span className="text-xs text-gray-500">
              {sender.beneficiaries.length} Linked Beneficiar{sender.beneficiaries.length === 1 ? "y" : "ies"}
            </span>
          </div>

          {sender.beneficiaries.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm font-medium text-gray-700">No beneficiaries linked yet</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Add a recipient bank account to begin sending money.
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsAddBenOpen(true)}>
                + Add Beneficiary
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sender.beneficiaries.map((ben) => (
                <div
                  key={ben.id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-navy-500/50 hover:shadow-md transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ben.recipientName}</h3>
                        <p className="text-xs text-gray-500">{ben.bankName}</p>
                      </div>
                      {ben.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePennyDrop(ben)}
                          disabled={pennyDropLoadingId === ben.id}
                          className="text-[11px] text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                        >
                          {pennyDropLoadingId === ben.id ? "Verifying..." : "Verify A/C (₹1)"}
                        </button>
                      )}
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-lg space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">A/C Number:</span>
                        <span className="font-mono font-medium text-gray-900">{ben.maskedAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">IFSC Code:</span>
                        <span className="font-mono font-medium text-gray-900">{ben.ifsc}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenTransfer(ben)}
                    >
                      Send Money →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Remitter Registration Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Remitter"
      >
        <form onSubmit={handleRegisterSender} className="space-y-4">
          <p className="text-xs text-gray-500">
            This customer is not yet registered. Enter customer details to create their remittance profile.
          </p>

          <div>
            <label className="label">Mobile Number</label>
            <input
              type="tel"
              value={regForm.mobile}
              disabled
              className="input-field bg-gray-100 font-mono"
            />
          </div>

          <div>
            <label className="label">Full Name (As per Aadhaar/PAN) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar Sharma"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                placeholder="Mumbai"
                value={regForm.city}
                onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input
                type="text"
                maxLength={6}
                placeholder="400001"
                value={regForm.pincode}
                onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value.replace(/\D/g, "") })}
                className="input-field"
              />
            </div>
          </div>

          {regError && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {regError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRegisterOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isRegistering}>
              Send Verification OTP
            </Button>
          </div>
        </form>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        title="Verify Remitter Mobile"
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-xs text-gray-500">
            Enter the 6-digit OTP sent to{" "}
            <strong className="font-mono text-gray-900">{regForm.mobile}</strong>. (For demo testing, use OTP:{" "}
            <span className="font-mono font-bold text-navy-500">123456</span>)
          </p>

          <div>
            <label className="label">One-Time Password (OTP)</label>
            <input
              type="text"
              maxLength={6}
              required
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className="input-field text-center font-mono tracking-widest text-lg"
            />
          </div>

          {otpError && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {otpError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOtpOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isVerifyingOtp}>
              Verify & Activate Remitter
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={isAddBenOpen}
        onClose={() => setIsAddBenOpen(false)}
        title="Add Recipient Beneficiary"
      >
        <form onSubmit={handleAddBeneficiary} className="space-y-3.5">
          <div>
            <label className="label">Beneficiary Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sunita Devi"
              value={benForm.recipientName}
              onChange={(e) => setBenForm({ ...benForm, recipientName: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Bank Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. State Bank of India, HDFC Bank"
              value={benForm.bankName}
              onChange={(e) => setBenForm({ ...benForm, bankName: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Account Number *</label>
            <input
              type="password"
              required
              placeholder="Enter Bank Account Number"
              value={benForm.accountNumber}
              onChange={(e) => setBenForm({ ...benForm, accountNumber: e.target.value.replace(/\s/g, "") })}
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="label">Confirm Account Number *</label>
            <input
              type="text"
              required
              placeholder="Re-enter Bank Account Number"
              value={benForm.confirmAccountNumber}
              onChange={(e) => setBenForm({ ...benForm, confirmAccountNumber: e.target.value.replace(/\s/g, "") })}
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="label">Bank IFSC Code *</label>
            <input
              type="text"
              maxLength={11}
              required
              placeholder="e.g. SBIN0001234"
              value={benForm.ifsc}
              onChange={(e) => setBenForm({ ...benForm, ifsc: e.target.value.toUpperCase() })}
              className="input-field font-mono uppercase"
            />
          </div>

          {benError && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {benError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddBenOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isAddingBen}>
              Register Beneficiary
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Execution Modal */}
      {selectedBen && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title="Instant Domestic Remittance"
        >
          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            {/* Beneficiary Badge */}
            <div className="bg-navy-50 border border-navy-100 p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-gray-600">Recipient:</span>
                <span className="text-navy-900 font-bold">{selectedBen.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bank & IFSC:</span>
                <span className="font-mono text-gray-800">
                  {selectedBen.bankName} ({selectedBen.ifsc})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-mono text-gray-800">{selectedBen.maskedAccount}</span>
              </div>
            </div>

            {/* Transfer Mode Toggle */}
            <div>
              <label className="label">Transfer Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransferMode("IMPS")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    transferMode === "IMPS"
                      ? "bg-navy-500 text-white border-navy-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ⚡ IMPS (Instant 24x7)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferMode("NEFT")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    transferMode === "NEFT"
                      ? "bg-navy-500 text-white border-navy-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  🏦 NEFT (Standard Batch)
                </button>
              </div>
            </div>

            {/* Transfer Amount Input */}
            <div>
              <label className="label">Remittance Amount (₹) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={100}
                  max={25000}
                  required
                  placeholder="Enter amount (₹100 - ₹25,000)"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="input-field pl-8 font-semibold text-lg"
                />
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((qAmt) => (
                  <button
                    key={qAmt}
                    type="button"
                    onClick={() => setTransferAmount(qAmt.toString())}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium transition-colors"
                  >
                    +₹{qAmt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Commercial Breakdown */}
            {transferAmount && !isNaN(parseFloat(transferAmount)) && parseFloat(transferAmount) >= 100 && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Transfer Principal:</span>
                  <span className="font-mono">{formatCurrency(parseFloat(transferAmount))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Customer Surcharge (1%):</span>
                  <span className="font-mono">
                    +{formatCurrency(Math.max(10, Math.round(parseFloat(transferAmount) * 0.01)))}
                  </span>
                </div>
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Your Net Commission (0.4%):</span>
                  <span className="font-mono">
                    +{formatCurrency(parseFloat(transferAmount) * 0.004)}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Net Wallet Debit:</span>
                  <span className="font-mono text-navy-600">
                    {formatCurrency(
                      parseFloat(transferAmount) +
                        Math.max(10, Math.round(parseFloat(transferAmount) * 0.01)) -
                        parseFloat(transferAmount) * 0.004
                    )}
                  </span>
                </div>
              </div>
            )}

            {transferError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {transferError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsTransferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isExecutingTransfer}
              >
                Confirm & Dispatch Transfer →
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Remittance Receipt Modal */}
      {receipt && (
        <Modal
          isOpen={Boolean(receipt)}
          onClose={() => setReceipt(null)}
          title="Bank Remittance Receipt"
        >
          <div className="space-y-4 text-xs">
            {/* Header Banner */}
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-3xl block mb-1">✅</span>
              <h3 className="text-base font-bold text-green-900">Transfer Successful</h3>
              <p className="text-green-700 text-xs mt-0.5">
                Funds dispatched via National Banking Switch ({receipt.transferMode})
              </p>
            </div>

            {/* Receipt Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              <div className="p-3 bg-gray-50 flex justify-between">
                <span className="text-gray-500">Bank RRN / UTR:</span>
                <span className="font-mono font-bold text-gray-900">{receipt.bankRrn}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Internal Reference:</span>
                <span className="font-mono text-gray-800">{receipt.txnId}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Transfer Amount:</span>
                <span className="font-bold text-navy-600 text-sm">{formatCurrency(receipt.amountInr)}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Beneficiary:</span>
                <span className="font-semibold text-gray-900">{receipt.beneficiaryName}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Account / IFSC:</span>
                <span className="font-mono text-gray-800">
                  {receipt.accountNumber} ({receipt.ifsc})
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Bank Name:</span>
                <span className="text-gray-800">{receipt.bankName}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Remitter:</span>
                <span className="text-gray-800">
                  {receipt.remitterName} ({receipt.remitterMobile})
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span className="text-gray-800">{new Date(receipt.timestamp).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 text-[10px]">
                Recharge Pro Central Switching Network • RBI DMT Framework Compliant
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handlePrint}>
                  🖨️ Print
                </Button>
                <Button variant="primary" size="sm" onClick={() => setReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
