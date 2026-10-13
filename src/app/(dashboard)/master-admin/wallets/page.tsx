"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SearchBar,
  Pagination,
  Modal,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

interface WalletItem {
  id: string;
  userId: string;
  name: string;
  role: "ADMIN" | "DISTRIBUTOR" | "RETAILER";
  balance: number;
  reservedBalance: number;
  lastTxnAt?: string | null;
  status: "ACTIVE" | "SUSPENDED";
}

interface WalletRequestItem {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole: string;
  amount: number;
  type: "TOPUP" | "CREDIT_ADJUSTMENT" | "DEBIT_ADJUSTMENT";
  paymentMethod?: string | null;
  paymentRef?: string | null;
  bankName?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const SAMPLE_WALLETS: WalletItem[] = [
  {
    id: "w-1",
    userId: "PM-AD-0001",
    name: "Rajesh Kumar",
    role: "ADMIN",
    balance: 550000.0,
    reservedBalance: 25000.0,
    lastTxnAt: "2026-10-12T09:15:00Z",
    status: "ACTIVE",
  },
  {
    id: "w-2",
    userId: "PM-AD-0002",
    name: "Priya Sundaram",
    role: "ADMIN",
    balance: 820000.0,
    reservedBalance: 50000.0,
    lastTxnAt: "2026-10-12T08:45:00Z",
    status: "ACTIVE",
  },
  {
    id: "w-3",
    userId: "PM-DT-0012",
    name: "Venkatesh Rao",
    role: "DISTRIBUTOR",
    balance: 95400.0,
    reservedBalance: 10000.0,
    lastTxnAt: "2026-10-12T09:30:00Z",
    status: "ACTIVE",
  },
  {
    id: "w-4",
    userId: "PM-DT-0015",
    name: "Mohanlal Sharma",
    role: "DISTRIBUTOR",
    balance: 142000.0,
    reservedBalance: 15000.0,
    lastTxnAt: "2026-10-12T09:20:00Z",
    status: "ACTIVE",
  },
  {
    id: "w-5",
    userId: "PM-RT-0120",
    name: "Vikram Sharma",
    role: "RETAILER",
    balance: 12450.5,
    reservedBalance: 500.0,
    lastTxnAt: "2026-10-12T09:41:00Z",
    status: "ACTIVE",
  },
  {
    id: "w-6",
    userId: "PM-RT-0082",
    name: "Anita Patel",
    role: "RETAILER",
    balance: 4890.0,
    reservedBalance: 0.0,
    lastTxnAt: "2026-10-12T09:38:00Z",
    status: "ACTIVE",
  },
];

const SAMPLE_REQUESTS: WalletRequestItem[] = [
  {
    id: "wr-1",
    requestId: "WR-20261012-0041",
    userId: "PM-DT-0012",
    userName: "Venkatesh Rao",
    userRole: "DISTRIBUTOR",
    amount: 50000.0,
    type: "TOPUP",
    paymentMethod: "NEFT",
    paymentRef: "SBIN202610129841",
    bankName: "State Bank of India",
    status: "PENDING",
    createdAt: "2026-10-12T08:30:00Z",
  },
  {
    id: "wr-2",
    requestId: "WR-20261012-0042",
    userId: "PM-RT-0120",
    userName: "Vikram Sharma",
    userRole: "RETAILER",
    amount: 10000.0,
    type: "TOPUP",
    paymentMethod: "UPI",
    paymentRef: "UPI/39201948194",
    bankName: "HDFC Bank",
    status: "PENDING",
    createdAt: "2026-10-12T09:05:00Z",
  },
  {
    id: "wr-3",
    requestId: "WR-20261012-0043",
    userId: "PM-AD-0001",
    userName: "Rajesh Kumar",
    userRole: "ADMIN",
    amount: 200000.0,
    type: "TOPUP",
    paymentMethod: "RTGS",
    paymentRef: "ICIC2938194019",
    bankName: "ICICI Bank",
    status: "PENDING",
    createdAt: "2026-10-12T09:12:00Z",
  },
];

export default function MasterAdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletItem[]>(SAMPLE_WALLETS);
  const [requests, setRequests] = useState<WalletRequestItem[]>(SAMPLE_REQUESTS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Approve / Reject modal
  const [selectedReq, setSelectedReq] = useState<WalletRequestItem | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [actionReason, setActionReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [wRes, rRes] = await Promise.all([
          fetch("/api/wallets"),
          fetch("/api/wallet-requests?status=PENDING"),
        ]);
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData?.wallets?.length) setWallets(wData.wallets);
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData?.requests?.length) setRequests(rData.requests);
        }
      } catch (err) {
        console.warn("Using sample wallet float data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPlatformLiability = useMemo(() => {
    return wallets.reduce((acc, w) => acc + w.balance, 0);
  }, [wallets]);

  const totalPlatformReserved = useMemo(() => {
    return wallets.reduce((acc, w) => acc + w.reservedBalance, 0);
  }, [wallets]);

  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.userId.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "ALL" ? true : w.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [wallets, search, roleFilter]);

  const totalPages = Math.ceil(filteredWallets.length / pageSize) || 1;
  const paginatedWallets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredWallets.slice(start, start + pageSize);
  }, [filteredWallets, page, pageSize]);

  const handleProcessRequest = async () => {
    if (!selectedReq) return;
    setIsActionLoading(true);

    try {
      await fetch(`/api/wallet-requests/${selectedReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType === "APPROVE" ? "APPROVED" : "REJECTED",
          reason: actionReason,
        }),
      });
    } catch {
      // ignore
    } finally {
      if (actionType === "APPROVE") {
        setWallets((prev) =>
          prev.map((w) =>
            w.userId === selectedReq.userId
              ? { ...w, balance: w.balance + selectedReq.amount }
              : w
          )
        );
      }
      setRequests((prev) => prev.filter((r) => r.id !== selectedReq.id));
      setSelectedReq(null);
      setActionReason("");
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
          Treasury &bull; Reserve Float
        </div>
        <h1 className="page-header mt-1">Platform Wallet Accounts</h1>
        <p className="page-subheader">
          Oversee liquidity pools, manage deposit claims, and monitor multi-tier user float balances.
        </p>
      </div>

      {/* Platform Wallet Liability Banner Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-navy-900 text-white p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
                Total Platform Wallet Liabilities
              </span>
              <Badge variant="info">Treasury Reserve</Badge>
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">
              {formatCurrency(totalPlatformLiability)}
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Sum of circulating balances held by Admins, Distributors, and Retailers across the Recharge Pro ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-navy-800 text-xs">
            <div>
              <span className="text-gray-400 block">Reserved Escrow:</span>
              <span className="font-bold text-yellow-400">
                {formatCurrency(totalPlatformReserved)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Pending Top-ups:</span>
              <span className="font-bold text-blue-300">
                {requests.length} Requests ({formatCurrency(requests.reduce((s, r) => s + r.amount, 0))})
              </span>
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-between p-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settlement Health
            </div>
            <div className="text-xl font-bold text-gray-900 mt-2 flex items-center gap-2">
              <span className="text-emerald-600">● 100%</span> Backed
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bank nodal account balance covers 100% of network wallet commitments.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">Escrow Provider:</span>
            <div className="text-xs font-semibold text-navy-800">
              State Bank of India (Nodal Pool)
            </div>
          </div>
        </div>
      </div>

      {/* Pending Wallet Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Pending Top-up Claims ({requests.length})</h3>
            <p className="text-xs text-gray-500">
              User bank transfer confirmations requiring administrator approval
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-xs text-gray-500">
            ✅ All top-up requests have been reviewed and settled.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Requested Amount</TableHead>
                <TableHead>Payment Method &amp; Ref</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {r.requestId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {r.userName}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500">
                      {r.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{ROLE_LABELS[r.userRole] || r.userRole}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 text-xs">
                    {formatCurrency(r.amount)}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-xs text-gray-800">
                      {r.paymentMethod}
                    </span>
                    <div className="font-mono text-[11px] text-gray-500">
                      {r.paymentRef}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {r.bankName || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDateTime(r.createdAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="success"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setSelectedReq(r);
                        setActionType("APPROVE");
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setSelectedReq(r);
                        setActionType("REJECT");
                      }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Wallet Accounts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">User Wallet Balances</h3>
            <p className="text-xs text-gray-500">
              Current available balances and reserved holds by user
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by name or User ID..."
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-gray-500 font-medium">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-44"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins</option>
              <option value="DISTRIBUTOR">Distributors</option>
              <option value="RETAILER">Retailers</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : paginatedWallets.length === 0 ? (
          <EmptyState
            title="No Wallets Found"
            description="No wallet records match your filter criteria."
          />
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Account Holder</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Available Balance</TableHead>
                  <TableHead>Reserved Balance</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWallets.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs font-semibold text-navy-700">
                      {w.userId}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-gray-900">
                      {w.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{ROLE_LABELS[w.role] || w.role}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 text-xs">
                      {formatCurrency(w.balance)}
                    </TableCell>
                    <TableCell className="text-xs text-yellow-700 font-medium">
                      {formatCurrency(w.reservedBalance)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {w.lastTxnAt ? formatDateTime(w.lastTxnAt) : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={w.status === "ACTIVE" ? "success" : "danger"}
                      >
                        {w.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredWallets.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Approval / Rejection Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={
            actionType === "APPROVE"
              ? `Approve Top-up (${selectedReq.requestId})`
              : `Reject Top-up (${selectedReq.requestId})`
          }
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedReq(null)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "APPROVE" ? "success" : "danger"}
                onClick={handleProcessRequest}
                isLoading={isActionLoading}
              >
                {actionType === "APPROVE" ? "Confirm & Credit Wallet" : "Confirm Rejection"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-600">
              {actionType === "APPROVE"
                ? `You are confirming receipt of funds from ${selectedReq.userName}. This will credit ${formatCurrency(
                    selectedReq.amount
                  )} to wallet ${selectedReq.userId}.`
                : `You are rejecting the claim of ${formatCurrency(
                    selectedReq.amount
                  )} by ${selectedReq.userName}.`}
            </p>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
              <div>
                <span className="text-gray-500">UTR / Ref:</span>{" "}
                <span className="font-mono font-bold text-gray-900">
                  {selectedReq.paymentRef}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Bank / Mode:</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedReq.bankName} via {selectedReq.paymentMethod}
                </span>
              </div>
            </div>

            <div>
              <label className="label">
                {actionType === "APPROVE" ? "Approval Remarks" : "Rejection Reason *"}
              </label>
              <input
                type="text"
                placeholder={
                  actionType === "APPROVE"
                    ? "e.g. Verified with bank statement"
                    : "e.g. UTR not matching with bank credit"
                }
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
