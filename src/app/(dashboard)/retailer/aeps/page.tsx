"use client";

import React, { useState } from "react";
import { Button, Badge, Modal } from "@/components/ui";

export default function RetailerAepsPage() {
  const [deviceStatus] = useState({
    device: "Mantra MFS100 / Startek FM220",
    driverStatus: "RD Service Ready",
    bankSwitch: "Airtel Payments Bank / NPCI",
  });

  const [serviceType, setServiceType] = useState<"CW" | "BE" | "MS" | "AP">("BE");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("State Bank of India");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [customerConsent, setCustomerConsent] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  const handleScanAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerConsent) {
      alert("Please ensure customer consent is obtained as mandated by UIDAI guidelines.");
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setReceipt({
        status: "SUCCESS",
        txnId: `AEPS-${Date.now().toString().slice(-8)}`,
        rrn: `42910${Math.floor(1000000 + Math.random() * 9000000)}`,
        bank: selectedBank,
        aadhaarMasked: `XXXXXXXX${aadhaarNumber.slice(-4)}`,
        balance: "₹14,250.75",
        timestamp: new Date().toLocaleString("en-IN"),
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Aadhaar Enabled Payment System (AEPS)</h1>
          <p className="page-subheader">
            NPCI Banking Switch • Fingerprint Biometric RD Service Counter
          </p>
        </div>
        <Badge variant="info">Sandbox Mode • UIDAI RD Service Active</Badge>
      </div>

      {/* Terminal Hardware Status */}
      <div className="card bg-navy-900 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block">Biometric RD Service</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              🟢 {deviceStatus.device}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Sponsoring Bank Switch</span>
            <span className="font-semibold text-blue-300 mt-0.5 block">{deviceStatus.bankSwitch}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Terminal Status</span>
            <span className="font-semibold text-green-400 mt-0.5 block">Ready for Customer Biometric</span>
          </div>
        </div>
      </div>

      {/* Service Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "BE", label: "Balance Inquiry", icon: "💳" },
          { key: "CW", label: "Cash Withdrawal", icon: "💵" },
          { key: "MS", label: "Mini Statement", icon: "📜" },
          { key: "AP", label: "Aadhaar Pay", icon: "🏧" },
        ].map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setServiceType(s.key as any)}
            className={`p-4 rounded-xl border text-center transition-all ${
              serviceType === s.key
                ? "bg-navy-50 border-navy-500 shadow-sm text-navy-900 font-bold"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-2xl block mb-1">{s.icon}</span>
            <span className="text-xs">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Biometric Counter Form */}
      <div className="card max-w-2xl">
        <h2 className="text-base font-bold text-gray-900 mb-4">Customer Authentication Details</h2>
        <form onSubmit={handleScanAndSubmit} className="space-y-4 text-xs">
          <div>
            <label className="label">Customer Aadhaar Number (12 Digits) *</label>
            <input
              type="text"
              maxLength={12}
              required
              placeholder="e.g. 5489 1234 9812"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
              className="input-field font-mono text-base tracking-widest"
            />
          </div>

          <div>
            <label className="label">Select Customer Bank *</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="select-field text-sm"
            >
              <option value="State Bank of India">State Bank of India (SBI)</option>
              <option value="Bank of Baroda">Bank of Baroda (BOB)</option>
              <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Canara Bank">Canara Bank</option>
            </select>
          </div>

          {(serviceType === "CW" || serviceType === "AP") && (
            <div>
              <label className="label">Withdrawal Amount (₹) *</label>
              <input
                type="number"
                min={100}
                max={10000}
                step={100}
                required
                placeholder="Enter amount (₹100 - ₹10,000)"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="input-field text-lg font-bold"
              />
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
            <input
              type="checkbox"
              id="consent"
              checked={customerConsent}
              onChange={(e) => setCustomerConsent(e.target.checked)}
              className="mt-0.5"
              required
            />
            <label htmlFor="consent" className="text-gray-700 leading-relaxed text-[11px]">
              <strong>Customer Explicit Consent:</strong> I confirm that customer biometric authentication is
              being captured solely for this banking transaction with their verbal and signed consent in
              compliance with NPCI &amp; UIDAI guidelines.
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isScanning}
              disabled={aadhaarNumber.length !== 12 || !customerConsent}
            >
              👆 Capture Biometric &amp; Process Transaction
            </Button>
          </div>
        </form>
      </div>

      {/* AEPS Receipt Modal */}
      {receipt && (
        <Modal isOpen={Boolean(receipt)} onClose={() => setReceipt(null)} title="NPCI AEPS Transaction Receipt">
          <div className="space-y-4 text-xs">
            <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
              <span className="text-2xl block mb-1">✅</span>
              <span className="font-bold text-green-900 text-sm">NPCI Authorization Successful</span>
            </div>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 p-2 space-y-2">
              <div className="flex justify-between p-1">
                <span className="text-gray-500">Bank RRN:</span>
                <span className="font-mono font-bold text-gray-900">{receipt.rrn}</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-gray-500">Bank Name:</span>
                <span className="font-medium text-gray-900">{receipt.bank}</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-gray-500">Aadhaar Masked:</span>
                <span className="font-mono text-gray-800">{receipt.aadhaarMasked}</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-gray-500">Available Account Balance:</span>
                <span className="font-bold text-emerald-600 text-sm">{receipt.balance}</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-gray-500">Date &amp; Time:</span>
                <span className="text-gray-800">{receipt.timestamp}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                🖨️ Print
              </Button>
              <Button variant="primary" size="sm" onClick={() => setReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
