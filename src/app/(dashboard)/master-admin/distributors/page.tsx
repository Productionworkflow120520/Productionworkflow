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
import { maskMobile, formatDate } from "@/lib/utils";

interface DistributorUser {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  businessName?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL" | "REJECTED";
  parentId?: string | null;
  parentAdminName?: string | null;
  retailerCount?: number;
  createdAt: string;
}

interface AdminOption {
  id: string;
  fullName: string;
  userId: string;
}

const SAMPLE_ADMIN_OPTIONS: AdminOption[] = [
  { id: "admin-1", fullName: "Rajesh Kumar", userId: "PM-AD-0001" },
  { id: "admin-2", fullName: "Priya Sundaram", userId: "PM-AD-0002" },
  { id: "admin-3", fullName: "Arunav Bose", userId: "PM-AD-0003" },
];

const SAMPLE_DISTRIBUTORS: DistributorUser[] = [
  {
    id: "dist-1",
    userId: "RP-DT-0012",
    fullName: "Venkatesh Rao",
    email: "venkat.rao@dist.rechargepro.in",
    mobile: "9871122334",
    username: "venkat_dist",
    businessName: "Sri Krishna Telecom & Pay",
    status: "ACTIVE",
    parentId: "admin-2",
    parentAdminName: "Priya Sundaram (RP-AD-0002)",
    retailerCount: 48,
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
    parentId: "admin-1",
    parentAdminName: "Rajesh Kumar (RP-AD-0001)",
    retailerCount: 62,
    createdAt: "2026-02-25T11:20:00Z",
  },
  {
    id: "dist-3",
    userId: "RP-DT-0021",
    fullName: "Subhash Chatterjee",
    email: "subhash.east@rechargepro.in",
    mobile: "9833445566",
    username: "subhash_chatt",
    businessName: "Kolkata Digital Hub",
    status: "ACTIVE",
    parentId: "admin-3",
    parentAdminName: "Arunav Bose (RP-AD-0003)",
    retailerCount: 34,
    createdAt: "2026-03-05T09:10:00Z",
  },
  {
    id: "dist-4",
    userId: "RP-DT-0028",
    fullName: "Girish Kulkarni",
    email: "girish.k@dist.rechargepro.in",
    mobile: "9844556677",
    username: "girish_k",
    businessName: "Sahyadri FinPay Network",
    status: "SUSPENDED",
    parentId: "admin-1",
    parentAdminName: "Rajesh Kumar (RP-AD-0001)",
    retailerCount: 19,
    createdAt: "2026-03-18T14:30:00Z",
  },
  {
    id: "dist-5",
    userId: "RP-DT-0033",
    fullName: "Naresh Gupta",
    email: "naresh.gupta@rechargepro.in",
    mobile: "9855667788",
    username: "naresh_g",
    businessName: "Gupta MultiServices",
    status: "PENDING_APPROVAL",
    parentId: "admin-2",
    parentAdminName: "Priya Sundaram (RP-AD-0002)",
    retailerCount: 0,
    createdAt: "2026-04-01T16:00:00Z",
  },
];

export default function MasterAdminDistributorsPage() {
  const [distributors, setDistributors] = useState<DistributorUser[]>(SAMPLE_DISTRIBUTORS);
  const [adminOptions, setAdminOptions] = useState<AdminOption[]>(SAMPLE_ADMIN_OPTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [adminFilter, setAdminFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
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
  const [editDist, setEditDist] = useState<DistributorUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toggleUser, setToggleUser] = useState<DistributorUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [distRes, adminRes] = await Promise.all([
          fetch("/api/users?role=DISTRIBUTOR"),
          fetch("/api/users?role=ADMIN"),
        ]);
        if (distRes.ok) {
          const dData = await distRes.json();
          if (dData?.users?.length) setDistributors(dData.users);
        }
        if (adminRes.ok) {
          const aData = await adminRes.json();
          if (aData?.users?.length) setAdminOptions(aData.users);
        }
      } catch (err) {
        console.warn("Using sample distributor data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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

      const matchesAdmin =
        adminFilter === "ALL" ? true : d.parentId === adminFilter;

      return matchesSearch && matchesStatus && matchesAdmin;
    });
  }, [distributors, search, statusFilter, adminFilter]);

  const totalPages = Math.ceil(filteredDistributors.length / pageSize) || 1;
  const paginatedDistributors = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDistributors.slice(start, start + pageSize);
  }, [filteredDistributors, page, pageSize]);

  const handleCreateDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parentAdmin = adminOptions.find((a) => a.id === addForm.parentId);
    const newDist: DistributorUser = {
      id: `dist-${Date.now()}`,
      userId: `PM-DT-00${distributors.length + 10}`,
      fullName: addForm.fullName,
      email: addForm.email,
      mobile: addForm.mobile,
      username: addForm.username,
      businessName: addForm.businessName,
      status: "ACTIVE",
      parentId: addForm.parentId || null,
      parentAdminName: parentAdmin
        ? `${parentAdmin.fullName} (${parentAdmin.userId})`
        : "Direct Master Network",
      retailerCount: 0,
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
        parentId: "",
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Network Hierarchy &bull; Distributors
          </div>
          <h1 className="page-header mt-1">Platform Distributors</h1>
          <p className="page-subheader">
            Oversee area distributors, parent admin assignments, and merchant network scale.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          className="shadow-sm"
        >
          + Add Distributor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name, business or user ID..."
        />
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Admin:</label>
            <select
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-44"
            >
              <option value="ALL">All Parent Admins</option>
              {adminOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
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
              className="select-field text-xs py-2 w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedDistributors.length === 0 ? (
        <EmptyState
          title="No Distributors Found"
          description="Try modifying search keywords or clearing parent admin filters."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setAdminFilter("ALL");
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
                <TableHead>Distributor &amp; Business</TableHead>
                <TableHead>Parent Admin</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Downline Retailers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDistributors.map((dist) => (
                <TableRow key={dist.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {dist.userId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {dist.fullName}
                    </div>
                    {dist.businessName && (
                      <div className="text-[11px] text-gray-500">
                        {dist.businessName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-navy-800">
                    {dist.parentAdminName || "Direct"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-600">
                    {maskMobile(dist.mobile)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-gray-800">
                    {dist.retailerCount ?? 0} Retailers
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        dist.status === "ACTIVE"
                          ? "success"
                          : dist.status === "SUSPENDED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {dist.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(dist.createdAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setEditDist(dist);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={dist.status === "ACTIVE" ? "danger" : "success"}
                      className="text-xs py-1 px-2.5"
                      onClick={() => setToggleUser(dist)}
                    >
                      {dist.status === "ACTIVE" ? "Suspend" : "Activate"}
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
        title="Add New Distributor"
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
              Register Distributor
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDistributor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Parent Admin *</label>
              <select
                required
                value={addForm.parentId}
                onChange={(e) =>
                  setAddForm({ ...addForm, parentId: e.target.value })
                }
                className="select-field"
              >
                <option value="">Select Parent Admin</option>
                {adminOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.userId})
                  </option>
                ))}
              </select>
            </div>
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
                    status: e.target.value as DistributorUser["status"],
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

      {/* Toggle Confirm Dialog */}
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
          } ${toggleUser.fullName} (${toggleUser.userId})?`}
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
