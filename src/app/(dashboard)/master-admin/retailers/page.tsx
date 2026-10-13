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
import { maskMobile, formatDate, formatCurrency } from "@/lib/utils";

interface RetailerUser {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  businessName?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL" | "REJECTED";
  kycStatus: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  parentId?: string | null;
  parentDistributorName?: string | null;
  walletBalance?: number;
  createdAt: string;
}

interface DistOption {
  id: string;
  fullName: string;
  userId: string;
}

const SAMPLE_DIST_OPTIONS: DistOption[] = [
  { id: "dist-1", fullName: "Venkatesh Rao", userId: "PM-DT-0012" },
  { id: "dist-2", fullName: "Mohanlal Sharma", userId: "PM-DT-0015" },
  { id: "dist-3", fullName: "Subhash Chatterjee", userId: "PM-DT-0021" },
];

const SAMPLE_RETAILERS: RetailerUser[] = [
  {
    id: "ret-1",
    userId: "PM-RT-0120",
    fullName: "Vikram Sharma",
    email: "vikram.sharma@merchant.com",
    mobile: "9811223344",
    username: "vikram_recharge",
    businessName: "Vikram Mobile & Photostat",
    status: "ACTIVE",
    kycStatus: "APPROVED",
    parentId: "dist-1",
    parentDistributorName: "Venkatesh Rao (PM-DT-0012)",
    walletBalance: 12450.5,
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ret-2",
    userId: "PM-RT-0082",
    fullName: "Anita Patel",
    email: "anita.patel@merchant.com",
    mobile: "9822331122",
    username: "anita_pay",
    businessName: "Patel Cyber Cafe & Pay",
    status: "ACTIVE",
    kycStatus: "APPROVED",
    parentId: "dist-2",
    parentDistributorName: "Mohanlal Sharma (PM-DT-0015)",
    walletBalance: 4890.0,
    createdAt: "2026-03-05T10:15:00Z",
  },
  {
    id: "ret-3",
    userId: "PM-RT-0194",
    fullName: "Rajesh Rao",
    email: "rajesh.rao@merchant.com",
    mobile: "9833442233",
    username: "rajesh_rao",
    businessName: "Sri Balaji Communications",
    status: "ACTIVE",
    kycStatus: "UNDER_REVIEW",
    parentId: "dist-1",
    parentDistributorName: "Venkatesh Rao (PM-DT-0012)",
    walletBalance: 2150.0,
    createdAt: "2026-03-12T14:30:00Z",
  },
  {
    id: "ret-4",
    userId: "PM-RT-0044",
    fullName: "Karan Johar",
    email: "karan.stores@merchant.com",
    mobile: "9844553344",
    username: "karan_stores",
    businessName: "Johar General Store",
    status: "SUSPENDED",
    kycStatus: "REJECTED",
    parentId: "dist-2",
    parentDistributorName: "Mohanlal Sharma (PM-DT-0015)",
    walletBalance: 0.0,
    createdAt: "2026-03-20T16:00:00Z",
  },
  {
    id: "ret-5",
    userId: "PM-RT-0031",
    fullName: "Pooja Hegde",
    email: "pooja.hegde@merchant.com",
    mobile: "9855664455",
    username: "pooja_fin",
    businessName: "Hegde Bill Pay Point",
    status: "PENDING_APPROVAL",
    kycStatus: "SUBMITTED",
    parentId: "dist-3",
    parentDistributorName: "Subhash Chatterjee (PM-DT-0021)",
    walletBalance: 0.0,
    createdAt: "2026-04-02T11:45:00Z",
  },
];

export default function MasterAdminRetailersPage() {
  const [retailers, setRetailers] = useState<RetailerUser[]>(SAMPLE_RETAILERS);
  const [distOptions, setDistOptions] = useState<DistOption[]>(SAMPLE_DIST_OPTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [distFilter, setDistFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Add / Edit / Actions
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    username: "",
    password: "",
    businessName: "",
    parentId: "",
  });
  const [editRet, setEditRet] = useState<RetailerUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toggleUser, setToggleUser] = useState<RetailerUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [retRes, distRes] = await Promise.all([
          fetch("/api/users?role=RETAILER"),
          fetch("/api/users?role=DISTRIBUTOR"),
        ]);
        if (retRes.ok) {
          const rData = await retRes.json();
          if (rData?.users?.length) setRetailers(rData.users);
        }
        if (distRes.ok) {
          const dData = await distRes.json();
          if (dData?.users?.length) setDistOptions(dData.users);
        }
      } catch (err) {
        console.warn("Using sample retailer data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) => {
      const matchesSearch =
        r.fullName.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.userId.toLowerCase().includes(search.toLowerCase()) ||
        (r.businessName && r.businessName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ? true : r.status === statusFilter;

      const matchesKyc =
        kycFilter === "ALL" ? true : r.kycStatus === kycFilter;

      const matchesDist =
        distFilter === "ALL" ? true : r.parentId === distFilter;

      return matchesSearch && matchesStatus && matchesKyc && matchesDist;
    });
  }, [retailers, search, statusFilter, kycFilter, distFilter]);

  const totalPages = Math.ceil(filteredRetailers.length / pageSize) || 1;
  const paginatedRetailers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRetailers.slice(start, start + pageSize);
  }, [filteredRetailers, page, pageSize]);

  const handleCreateRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parentDist = distOptions.find((d) => d.id === addForm.parentId);
    const newRetailer: RetailerUser = {
      id: `ret-${Date.now()}`,
      userId: `PM-RT-0${retailers.length + 100}`,
      fullName: addForm.fullName,
      email: addForm.email,
      mobile: addForm.mobile,
      username: addForm.username,
      businessName: addForm.businessName,
      status: "ACTIVE",
      kycStatus: "SUBMITTED",
      parentId: addForm.parentId || null,
      parentDistributorName: parentDist
        ? `${parentDist.fullName} (${parentDist.userId})`
        : "Unassigned",
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
      setRetailers((prev) => [newRetailer, ...prev]);
      setIsAddOpen(false);
      setIsSubmitting(false);
      setAddForm({
        fullName: "",
        email: "",
        mobile: "",
        username: "",
        password: "",
        businessName: "",
        parentId: "",
      });
    }
  };

  const handleUpdateRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRet) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/users/${editRet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRet),
      });
    } catch {
      // ignore
    } finally {
      setRetailers((prev) =>
        prev.map((r) => (r.id === editRet.id ? editRet : r))
      );
      setIsEditOpen(false);
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleUser) return;
    const newStatus = toggleUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setIsSubmitting(true);
    try {
      await fetch(`/api/users/${toggleUser.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // ignore
    } finally {
      setRetailers((prev) =>
        prev.map((r) =>
          r.id === toggleUser.id ? { ...r, status: newStatus } : r
        )
      );
      setToggleUser(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Network Hierarchy &bull; Retail Merchants
          </div>
          <h1 className="page-header mt-1">Platform Retailers</h1>
          <p className="page-subheader">
            Merchant terminal directory, downline link, and KYC verification status.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          className="shadow-sm"
        >
          + Add Retailer
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search retailer, mobile, business..."
        />
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Distributor Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Distributor:</label>
            <select
              value={distFilter}
              onChange={(e) => {
                setDistFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-40"
            >
              <option value="ALL">All Distributors</option>
              {distOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* KYC Filter */}
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
              <option value="NOT_SUBMITTED">Not Submitted</option>
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="PENDING_APPROVAL">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedRetailers.length === 0 ? (
        <EmptyState
          title="No Retailers Found"
          description="Try broadening your search or resetting KYC / Distributor filters."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setKycFilter("ALL");
                setDistFilter("ALL");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Merchant &amp; Business</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRetailers.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {ret.userId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {ret.fullName}
                    </div>
                    {ret.businessName && (
                      <div className="text-[11px] text-gray-500">
                        {ret.businessName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">
                    {ret.parentDistributorName || "Direct"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-600">
                    {maskMobile(ret.mobile)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ret.kycStatus === "APPROVED"
                          ? "success"
                          : ret.kycStatus === "REJECTED"
                          ? "danger"
                          : ret.kycStatus === "UNDER_REVIEW" || ret.kycStatus === "SUBMITTED"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {ret.kycStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-700">
                    {formatCurrency(ret.walletBalance ?? 0)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ret.status === "ACTIVE"
                          ? "success"
                          : ret.status === "SUSPENDED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {ret.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setEditRet(ret);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={ret.status === "ACTIVE" ? "danger" : "success"}
                      className="text-xs py-1 px-2.5"
                      onClick={() => setToggleUser(ret)}
                    >
                      {ret.status === "ACTIVE" ? "Suspend" : "Activate"}
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

      {/* Add Retailer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Retail Merchant"
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
              Create Retailer
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRetailer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Parent Distributor *</label>
              <select
                required
                value={addForm.parentId}
                onChange={(e) =>
                  setAddForm({ ...addForm, parentId: e.target.value })
                }
                className="select-field"
              >
                <option value="">Select Distributor</option>
                {distOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.userId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Merchant Contact Name"
                value={addForm.fullName}
                onChange={(e) =>
                  setAddForm({ ...addForm, fullName: e.target.value })
                }
                className="input-field"
              />
            </div>
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
              <label className="label">Initial Password *</label>
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
            <label className="label">Store / Business Name</label>
            <input
              type="text"
              placeholder="e.g. Star Mobile & Recharge Point"
              value={addForm.businessName}
              onChange={(e) =>
                setAddForm({ ...addForm, businessName: e.target.value })
              }
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Retailer Modal */}
      {editRet && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Retailer (${editRet.userId})`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateRetailer}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdateRetailer} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={editRet.fullName}
                onChange={(e) =>
                  setEditRet({ ...editRet, fullName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={editRet.email}
                  onChange={(e) =>
                    setEditRet({ ...editRet, email: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Mobile</label>
                <input
                  type="tel"
                  value={editRet.mobile}
                  onChange={(e) =>
                    setEditRet({ ...editRet, mobile: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label">Business Name</label>
              <input
                type="text"
                value={editRet.businessName || ""}
                onChange={(e) =>
                  setEditRet({ ...editRet, businessName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  value={editRet.status}
                  onChange={(e) =>
                    setEditRet({
                      ...editRet,
                      status: e.target.value as RetailerUser["status"],
                    })
                  }
                  className="select-field"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                </select>
              </div>
              <div>
                <label className="label">KYC Status</label>
                <select
                  value={editRet.kycStatus}
                  onChange={(e) =>
                    setEditRet({
                      ...editRet,
                      kycStatus: e.target.value as RetailerUser["kycStatus"],
                    })
                  }
                  className="select-field"
                >
                  <option value="NOT_SUBMITTED">Not Submitted</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Toggle Confirm Dialog */}
      {toggleUser && (
        <ConfirmDialog
          isOpen={!!toggleUser}
          title={
            toggleUser.status === "ACTIVE"
              ? "Suspend Retail Merchant"
              : "Activate Retail Merchant"
          }
          message={`Are you sure you want to ${
            toggleUser.status === "ACTIVE" ? "suspend" : "reactivate"
          } merchant ${toggleUser.fullName} (${toggleUser.userId})? Suspended retailers cannot initiate mobile recharge, BBPS, or AEPS transactions.`}
          confirmLabel={
            toggleUser.status === "ACTIVE" ? "Yes, Suspend" : "Yes, Activate"
          }
          variant={toggleUser.status === "ACTIVE" ? "danger" : "primary"}
          isLoading={isSubmitting}
          onConfirm={handleToggleStatus}
          onCancel={() => setToggleUser(null)}
        />
      )}
    </div>
  );
}
