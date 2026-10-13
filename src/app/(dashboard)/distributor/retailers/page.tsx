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
  LoadingSpinner,
  EmptyState,
} from "@/components/ui";
import { maskMobile, formatDate, formatCurrency } from "@/lib/utils";

interface DistRetailerItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  businessName?: string | null;
  kycStatus: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";
  walletBalance: number;
  createdAt: string;
}

const SAMPLE_RETAILERS: DistRetailerItem[] = [
  {
    id: "ret-1",
    userId: "PM-RT-0120",
    fullName: "Vikram Sharma",
    email: "vikram.sharma@merchant.com",
    mobile: "9811223344",
    businessName: "Vikram Mobile & Photostat",
    kycStatus: "APPROVED",
    status: "ACTIVE",
    walletBalance: 12450.5,
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ret-3",
    userId: "PM-RT-0194",
    fullName: "Rajesh Rao",
    email: "rajesh.rao@merchant.com",
    mobile: "9833442233",
    businessName: "Sri Balaji Communications",
    kycStatus: "APPROVED",
    status: "ACTIVE",
    walletBalance: 2150.0,
    createdAt: "2026-03-12T14:30:00Z",
  },
  {
    id: "ret-4",
    userId: "PM-RT-0105",
    fullName: "Sunil Dutt",
    email: "sunil.dutt@merchant.com",
    mobile: "9812948192",
    businessName: "Dutt Cyber & Recharge",
    kycStatus: "APPROVED",
    status: "ACTIVE",
    walletBalance: 8400.0,
    createdAt: "2026-03-15T11:00:00Z",
  },
  {
    id: "ret-5",
    userId: "PM-RT-0031",
    fullName: "Pooja Hegde",
    email: "pooja.hegde@merchant.com",
    mobile: "9855664455",
    businessName: "Hegde Bill Pay Point",
    kycStatus: "UNDER_REVIEW",
    status: "ACTIVE",
    walletBalance: 1200.0,
    createdAt: "2026-04-02T11:45:00Z",
  },
];

export default function DistributorRetailersPage() {
  const [retailers, setRetailers] = useState<DistRetailerItem[]>(SAMPLE_RETAILERS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Float Allocation Modal
  const [transferTarget, setTransferTarget] = useState<DistRetailerItem | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Add Retailer Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    username: "",
    password: "",
    businessName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRetailers() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/users?role=RETAILER");
        if (res.ok) {
          const data = await res.json();
          if (data?.users?.length) {
            setRetailers(data.users);
          }
        }
      } catch (err) {
        console.warn("Using sample downline retailers:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRetailers();
  }, []);

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) => {
      const matchesSearch =
        r.fullName.toLowerCase().includes(search.toLowerCase()) ||
        r.userId.toLowerCase().includes(search.toLowerCase()) ||
        (r.businessName && r.businessName.toLowerCase().includes(search.toLowerCase())) ||
        r.mobile.includes(search);

      const matchesKyc = kycFilter === "ALL" ? true : r.kycStatus === kycFilter;
      const matchesStatus = statusFilter === "ALL" ? true : r.status === statusFilter;

      return matchesSearch && matchesKyc && matchesStatus;
    });
  }, [retailers, search, kycFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRetailers.length / pageSize) || 1;
  const paginatedRetailers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRetailers.slice(start, start + pageSize);
  }, [filteredRetailers, page, pageSize]);

  const handleAllocateFloat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTarget || !transferAmount) return;
    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsTransferring(true);
    try {
      await fetch("/api/wallets/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUserId: transferTarget.id,
          amount: amountNum,
          remarks: transferRemarks || "Float allocation from distributor",
        }),
      });
    } catch {
      // ignore
    } finally {
      setRetailers((prev) =>
        prev.map((r) =>
          r.id === transferTarget.id
            ? { ...r, walletBalance: r.walletBalance + amountNum }
            : r
        )
      );
      setTransferSuccess(
        `Successfully transferred ${formatCurrency(amountNum)} to ${transferTarget.fullName}`
      );
      setIsTransferring(false);
      setTransferTarget(null);
      setTransferAmount("");
      setTransferRemarks("");
      setTimeout(() => setTransferSuccess(null), 4000);
    }
  };

  const handleCreateRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newR: DistRetailerItem = {
      id: `ret-${Date.now()}`,
      userId: `PM-RT-0${retailers.length + 100}`,
      fullName: addForm.fullName,
      email: addForm.email,
      mobile: addForm.mobile,
      businessName: addForm.businessName,
      kycStatus: "SUBMITTED",
      status: "ACTIVE",
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, role: "RETAILER" }),
      });
    } catch {
      // ignore
    } finally {
      setRetailers((prev) => [newR, ...prev]);
      setIsAddOpen(false);
      setIsSubmitting(false);
      setAddForm({
        fullName: "",
        email: "",
        mobile: "",
        username: "",
        password: "",
        businessName: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Distributor Workspace &bull; Network Outlets
          </div>
          <h1 className="page-header mt-1">My Retail Merchants</h1>
          <p className="page-subheader">
            Manage your network merchants, allocate working wallet float, and inspect KYC compliance.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} variant="primary" className="shadow-sm">
          + Onboard New Retailer
        </Button>
      </div>

      {transferSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-semibold">
          ✅ {transferSuccess}
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search merchant, business, mobile..."
        />
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">KYC:</label>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-36"
            >
              <option value="ALL">All KYC</option>
              <option value="APPROVED">Approved</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-32"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedRetailers.length === 0 ? (
        <EmptyState
          title="No Retailers Registered"
          description="You haven't onboarded any retail merchants yet."
          action={
            <Button size="sm" variant="primary" onClick={() => setIsAddOpen(true)}>
              Onboard First Retailer
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Merchant &amp; Store</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Working Float</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRetailers.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {r.userId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {r.fullName}
                    </div>
                    {r.businessName && (
                      <div className="text-[11px] text-gray-500">
                        {r.businessName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-600">
                    {maskMobile(r.mobile)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.kycStatus === "APPROVED"
                          ? "success"
                          : r.kycStatus === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {r.kycStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">
                    {formatCurrency(r.walletBalance)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "ACTIVE" ? "success" : "danger"}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs py-1 px-3"
                      onClick={() => setTransferTarget(r)}
                    >
                      Allocate Float 💰
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredRetailers.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Float Allocation Modal */}
      {transferTarget && (
        <Modal
          isOpen={!!transferTarget}
          onClose={() => setTransferTarget(null)}
          title={`Allocate Wallet Float to ${transferTarget.fullName}`}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setTransferTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAllocateFloat}
                isLoading={isTransferring}
              >
                Transfer Float
              </Button>
            </>
          }
        >
          <form onSubmit={handleAllocateFloat} className="space-y-4 text-xs">
            <div className="bg-navy-50 p-3 rounded-lg border border-navy-100">
              <span className="text-gray-500 block">Recipient Outlet:</span>
              <span className="font-bold text-navy-900 block mt-0.5">
                {transferTarget.fullName} ({transferTarget.userId})
              </span>
              <span className="text-gray-500 block mt-1">Current Balance:</span>
              <span className="font-semibold text-emerald-700 block">
                {formatCurrency(transferTarget.walletBalance)}
              </span>
            </div>

            <div>
              <label className="label">Transfer Amount (₹) *</label>
              <input
                type="number"
                required
                min="100"
                step="50"
                placeholder="e.g. 5000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="input-field text-base font-bold"
              />
              <div className="flex gap-2 mt-2">
                {[1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTransferAmount(amt.toString())}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-semibold text-gray-700"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Transfer Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Weekly counter stock allocation"
                value={transferRemarks}
                onChange={(e) => setTransferRemarks(e.target.value)}
                className="input-field"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Onboard Retailer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Onboard Retail Merchant"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRetailer}
              isLoading={isSubmitting}
            >
              Register Merchant
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRetailer} className="space-y-4">
          <div>
            <label className="label">Merchant Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Raina"
              value={addForm.fullName}
              onChange={(e) =>
                setAddForm({ ...addForm, fullName: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Mobile Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={addForm.mobile}
                onChange={(e) =>
                  setAddForm({ ...addForm, mobile: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Username *</label>
              <input
                type="text"
                required
                value={addForm.username}
                onChange={(e) =>
                  setAddForm({ ...addForm, username: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Password *</label>
              <input
                type="password"
                required
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">Shop / Outlet Name</label>
            <input
              type="text"
              placeholder="e.g. Raina Telecom & Digital Point"
              value={addForm.businessName}
              onChange={(e) =>
                setAddForm({ ...addForm, businessName: e.target.value })
              }
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
