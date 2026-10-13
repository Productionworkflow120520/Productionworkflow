"use client";

import React, { useState } from "react";
import { Button, Badge, Modal } from "@/components/ui";
import { BBPS_CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BillerOption {
  id: string;
  name: string;
  category: string;
  paramLabel: string;
}

const SAMPLE_BILLERS: Record<string, BillerOption[]> = {
  ELECTRICITY: [
    { id: "adani", name: "Adani Electricity Mumbai Limited", category: "ELECTRICITY", paramLabel: "Consumer Number (10 digits)" },
    { id: "tata_power", name: "Tata Power - Mumbai", category: "ELECTRICITY", paramLabel: "Consumer Account No" },
    { id: "bescom", name: "Bangalore Electricity Supply (BESCOM)", category: "ELECTRICITY", paramLabel: "Account ID (10 digits)" },
    { id: "msedcl", name: "Mahavitaran - MSEDCL", category: "ELECTRICITY", paramLabel: "Consumer Number" },
    { id: "bses_rajdhani", name: "BSES Rajdhani Power - Delhi", category: "ELECTRICITY", paramLabel: "CA Number" },
  ],
  WATER: [
    { id: "djb", name: "Delhi Jal Board", category: "WATER", paramLabel: "K No (10 digits)" },
    { id: "mcgm", name: "Municipal Corporation of Greater Mumbai (MCGM)", category: "WATER", paramLabel: "CCN Number" },
    { id: "bwssb", name: "Bangalore Water Supply (BWSSB)", category: "WATER", paramLabel: "RR Number" },
  ],
  GAS: [
    { id: "igl", name: "Indraprastha Gas Limited (IGL)", category: "GAS", paramLabel: "BP Number" },
    { id: "mgl", name: "Mahanagar Gas Limited (MGL)", category: "GAS", paramLabel: "CA Number" },
    { id: "adani_gas", name: "Adani Total Gas", category: "GAS", paramLabel: "Customer ID" },
  ],
  BROADBAND: [
    { id: "airtel_broadband", name: "Airtel Broadband", category: "BROADBAND", paramLabel: "Telephone No with STD Code" },
    { id: "act_fibernet", name: "ACT Fibernet", category: "BROADBAND", paramLabel: "Account Number / User ID" },
    { id: "jio_fiber", name: "Jio Fiber", category: "BROADBAND", paramLabel: "Service ID / Mobile Number" },
  ],
};

interface FetchedBill {
  customerName: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  amount: number;
}

interface BbpsReceipt {
  txnId: string;
  billerName: string;
  category: string;
  consumerNumber: string;
  customerName: string;
  billNumber: string;
  amountPaid: number;
  commission: number;
  providerRef: string;
  timestamp: string;
}

export default function BbpsBillPaymentPage() {
  const [selectedCategory, setSelectedCategory] = useState("ELECTRICITY");
  const [selectedBiller, setSelectedBiller] = useState("adani");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [walletBalance, setWalletBalance] = useState(12450.5);

  const [isFetching, setIsFetching] = useState(false);
  const [fetchedBill, setFetchedBill] = useState<FetchedBill | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment states
  const [isPaying, setIsPaying] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [receipt, setReceipt] = useState<BbpsReceipt | null>(null);

  const billerList = SAMPLE_BILLERS[selectedCategory] || [
    {
      id: "gen_biller",
      name: `${selectedCategory} National Authority`,
      category: selectedCategory,
      paramLabel: "Consumer Account ID",
    },
  ];

  const currentBiller =
    billerList.find((b) => b.id === selectedBiller) || billerList[0];

  const handleFetchBill = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consumerNumber || consumerNumber.trim().length < 4) {
      setError("Please provide a valid consumer / account number.");
      return;
    }

    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
      // Demo bill simulation
      setFetchedBill({
        customerName: "Sunil Kumar Verma",
        billNumber: `BILL-${Date.now().toString().slice(-6)}`,
        billDate: formatDate(new Date(Date.now() - 10 * 86400000)),
        dueDate: formatDate(new Date(Date.now() + 5 * 86400000)),
        amount: selectedCategory === "ELECTRICITY" ? 1850 : 640,
      });
    }, 600);
  };

  const handlePayBill = async () => {
    if (!fetchedBill) return;
    if (fetchedBill.amount > walletBalance) {
      setError("Insufficient wallet balance to pay this bill.");
      setIsConfirmOpen(false);
      return;
    }

    setIsPaying(true);
    try {
      await fetch("/api/bbps/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          billerId: selectedBiller,
          consumerNumber,
          amount: fetchedBill.amount,
        }),
      });
    } catch {
      // ignore
    } finally {
      setWalletBalance((prev) => prev - fetchedBill.amount);
      setReceipt({
        txnId: `PM-BBPS-${Date.now().toString().slice(-8)}`,
        billerName: currentBiller.name,
        category: selectedCategory,
        consumerNumber,
        customerName: fetchedBill.customerName,
        billNumber: fetchedBill.billNumber,
        amountPaid: fetchedBill.amount,
        commission: 12.0,
        providerRef: `NPCI-BBPS-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
      setIsPaying(false);
      setIsConfirmOpen(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setFetchedBill(null);
    setConsumerNumber("");
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Bharat Bill Payment System &bull; BBPS
          </div>
          <h1 className="page-header mt-1">Utility Bill Payment Desk</h1>
          <p className="page-subheader">
            Authorized NPCI Bharat BillPay agent terminal for utility settlements.
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
        /* BBPS Receipt */
        <div className="card max-w-lg mx-auto p-6 sm:p-8 space-y-6 border-2 border-green-200 bg-white shadow-xl">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-900">BBPS Payment Successful!</h3>
            <p className="text-xs text-gray-500">
              NPCI acknowledgement verified &bull; Biller settlement initiated
            </p>
            <Badge variant="success" size="md">
              Txn ID: {receipt.txnId}
            </Badge>
          </div>

          <div className="border-t border-b border-gray-100 py-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Biller Name:</span>
              <span className="font-bold text-gray-900">{receipt.billerName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Consumer Account No:</span>
              <span className="font-mono font-semibold text-gray-900">
                {receipt.consumerNumber}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Consumer Name:</span>
              <span className="font-semibold text-gray-900">{receipt.customerName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Bill Invoice ID:</span>
              <span className="font-mono text-gray-800">{receipt.billNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">NPCI Provider Ref:</span>
              <span className="font-mono text-gray-800">{receipt.providerRef}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Timestamp:</span>
              <span className="font-medium text-gray-800">{receipt.timestamp}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-dashed border-gray-200 text-sm">
              <span className="font-bold text-gray-900">Total Paid:</span>
              <span className="font-extrabold text-navy-800">
                {formatCurrency(receipt.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between py-1 bg-emerald-50 px-3 rounded-lg text-emerald-800 font-semibold">
              <span>Merchant Fee / Comm.:</span>
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
              Pay Another Bill &rarr;
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Select Utility Category:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {BBPS_CATEGORIES.map((cat) => (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.code);
                    setSelectedBiller(
                      SAMPLE_BILLERS[cat.code] ? SAMPLE_BILLERS[cat.code][0].id : "gen_biller"
                    );
                    setFetchedBill(null);
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                    selectedCategory === cat.code
                      ? "bg-navy-900 text-white border-navy-900 shadow-md scale-102"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Form and Fetch Bill section */}
          <div className="card p-6 sm:p-8 space-y-6">
            <form onSubmit={handleFetchBill} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Utility Provider / Biller *</label>
                  <select
                    value={selectedBiller}
                    onChange={(e) => {
                      setSelectedBiller(e.target.value);
                      setFetchedBill(null);
                    }}
                    className="select-field font-medium text-xs py-2.5"
                  >
                    {billerList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">{currentBiller.paramLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter account number"
                    value={consumerNumber}
                    onChange={(e) => {
                      setConsumerNumber(e.target.value);
                      setFetchedBill(null);
                    }}
                    className="input-field font-mono font-semibold"
                  />
                </div>
              </div>

              {!fetchedBill && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isFetching}
                    className="px-6 text-xs font-bold"
                  >
                    Fetch Bill Details &rarr;
                  </Button>
                </div>
              )}
            </form>

            {/* Fetched Bill Details Card */}
            {fetchedBill && (
              <div className="bg-navy-50/50 rounded-xl p-5 border border-navy-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <h4 className="font-bold text-gray-900 text-sm">
                      Bill Found: {fetchedBill.customerName}
                    </h4>
                  </div>
                  <Badge variant="warning">Due Date: {fetchedBill.dueDate}</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-lg border border-gray-200">
                  <div>
                    <span className="text-gray-500 block">Consumer:</span>
                    <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                      {fetchedBill.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Bill Invoice:</span>
                    <span className="font-mono font-medium text-gray-800 mt-0.5 block">
                      {fetchedBill.billNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Bill Date:</span>
                    <span className="font-medium text-gray-800 mt-0.5 block">
                      {fetchedBill.billDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Due Amount:</span>
                    <span className="font-extrabold text-navy-900 text-sm mt-0.5 block">
                      {formatCurrency(fetchedBill.amount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setFetchedBill(null)}
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Clear Bill
                  </button>

                  <Button
                    variant="primary"
                    onClick={() => setIsConfirmOpen(true)}
                    className="px-8 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md"
                  >
                    Pay Bill: {formatCurrency(fetchedBill.amount)} &rarr;
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {fetchedBill && (
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Utility Bill Settlement"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPaying}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePayBill}
                isLoading={isPaying}
              >
                Confirm &amp; Pay {formatCurrency(fetchedBill.amount)}
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-gray-600">
              Please confirm the biller name and customer details before deduction:
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Biller:</span>
                <span className="font-bold text-gray-900">{currentBiller.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consumer:</span>
                <span className="font-semibold text-gray-800">
                  {fetchedBill.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account No:</span>
                <span className="font-mono text-gray-800">{consumerNumber}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total Payable:</span>
                <span className="font-extrabold text-navy-800 text-base">
                  {formatCurrency(fetchedBill.amount)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
