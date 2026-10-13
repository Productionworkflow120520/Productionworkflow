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

interface AssignedDistributor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  businessName?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";
  retailersCount: number;
  walletBalance: number;
  createdAt: string;
}

const SAMPLE_DISTRIBUTORS: AssignedDistributor[] = [
  {
    id: "dist-1",
    userId: "RP-DT-0012",
    fullName: "Venkatesh Rao",
    email: "venkat.rao@dist.rechargepro.in",
    mobile: "9871122334",
    username: "venkat_dist",
    businessName: "Sri Krishna Telecom & Pay",
    status: "ACTIVE",
    retailersCount: 48,
    walletBalance: 95400.0,
    createdAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "dist-2",
    userId: "RP-DT-0015",
    fullName: "Mohanlal Sharma",
    email: "mohanlal@dist.rechargepro.in",
    mobile: "9822334455",
    username: "mohan_telecom",
    businessName: "Sharma Agency & Digital Services",
    status: "ACTIVE",
    retailersCount: 62,
    walletBalance: 142000.0,
    createdAt: "2026-02-25T11:20:00Z",
  },
  {
    id: "dist-3",
    userId: "RP-DT-0028",
    fullName: "Girish Kulkarni",
    email: "girish.k@dist.rechargepro.in",
    mobile: "9844556677",
    username: "girish_k",
    businessName: "Sahyadri FinPay Network",
    status: "SUSPENDED",
    retailersCount: 19,
    walletBalance: 15200.0,
    createdAt: "2026-03-18T14:30:00Z",
  },
];

export default function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState<AssignedDistributor[]>(SAMPLE_DISTRIBUTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
  });
  const [editDist, setEditDist] = useState<AssignedDistributor | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toggleUser, setToggleUser] = useState<AssignedDistributor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDistributors() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/users?role=DISTRIBUTOR");
        if (res.ok) {
          const data = await res.json();
          if (data?.users?.length) {
            setDistributors(data.users);
          }
        }
      } catch (err) {
        console.warn("Using sample assigned distributors:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDistributors();
  }, []);

  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      const matchesSearch =
        d.fullName.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()) ||
        d.userId.toLowerCase().includes(search.toLowerCase()) ||
        (d.businessName && d.businessName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ? true : d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [distributors, search, statusFilter]);

  const totalPages = Math.ceil(filteredDistributors.length / pageSize) || 1;
  const paginatedDistributors = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDistributors.slice(start, start + pageSize);
  }, [filteredDistributors, page, pageSize]);

  const handleCreateDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newDist: AssignedDistributor = {
      id: `dist-${Date.now()}`,
      userId: `PM-DT-00${distributors.length + 10}`,
      fullName: addForm.fullName,
      email: addForm.email,
      mobile: addForm.mobile,
      username: addForm.username,
      businessName: addForm.businessName,
      status: "ACTIVE",
      retailersCount: 0,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, role: "DISTRIBUTOR" }),
      });
    } catch {
      // ignore
    } finally {
      setDistributors((prev) => [newDist, ...prev]);
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

  const handleUpdateDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDist) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/users/${editDist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDist),
      });
    } catch {
      // ignore
    } finally {
      setDistributors((prev) =>
        prev.map((d) => (d.id === editDist.id ? editDist : d))
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
      setDistributors((prev) =>
        prev.map((d) =>
          d.id === toggleUser.id ? { ...d, status: newStatus } : d
        )
      );
      setToggleUser(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Admin Workspace &bull; Territory Distribution
          </div>
          <h1 className="page-header mt-1">My Territory Distributors</h1>
          <p className="page-subheader">
            Distributors assigned under your administrative management zone.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} variant="primary" className="shadow-sm">
          + Add New Distributor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name, business, mobile..."
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-gray-500 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="select-field text-xs py-2 w-full sm:w-40"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedDistributors.length === 0 ? (
        <EmptyState
          title="No Distributors Assigned"
          description="No distributors currently registered under your territory code."
        />
      ) : (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Distributor &amp; Business</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Downline Retailers</TableHead>
                <TableHead>Wallet Float</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDistributors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {d.userId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {d.fullName}
                    </div>
                    {d.businessName && (
                      <div className="text-[11px] text-gray-500">
                        {d.businessName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-600">
                    {maskMobile(d.mobile)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-gray-800">
                    {d.retailersCount} Merchants
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-700">
                    {formatCurrency(d.walletBalance)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        d.status === "ACTIVE"
                          ? "success"
                          : d.status === "SUSPENDED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(d.createdAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setEditDist(d);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={d.status === "ACTIVE" ? "danger" : "success"}
                      className="text-xs py-1 px-2.5"
                      onClick={() => setToggleUser(d)}
                    >
                      {d.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredDistributors.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Territory Distributor"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateDistributor}
              isLoading={isSubmitting}
            >
              Add Distributor
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDistributor} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
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
            <label className="label">Business Name</label>
            <input
              type="text"
              placeholder="e.g. Patel Telecom & FinServe"
              value={addForm.businessName}
              onChange={(e) =>
                setAddForm({ ...addForm, businessName: e.target.value })
              }
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editDist && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Distributor (${editDist.userId})`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateDistributor}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdateDistributor} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={editDist.fullName}
                onChange={(e) =>
                  setEditDist({ ...editDist, fullName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={editDist.email}
                  onChange={(e) =>
                    setEditDist({ ...editDist, email: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Mobile</label>
                <input
                  type="tel"
                  value={editDist.mobile}
                  onChange={(e) =>
                    setEditDist({ ...editDist, mobile: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label">Business Name</label>
              <input
                type="text"
                value={editDist.businessName || ""}
                onChange={(e) =>
                  setEditDist({ ...editDist, businessName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={editDist.status}
                onChange={(e) =>
                  setEditDist({
                    ...editDist,
                    status: e.target.value as AssignedDistributor["status"],
                  })
                }
                className="select-field"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Suspend / Activate Dialog */}
      {toggleUser && (
        <ConfirmDialog
          isOpen={!!toggleUser}
          title={
            toggleUser.status === "ACTIVE"
              ? "Suspend Distributor"
              : "Activate Distributor"
          }
          message={`Are you sure you want to ${
            toggleUser.status === "ACTIVE" ? "suspend" : "reactivate"
          } ${toggleUser.fullName}?`}
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
