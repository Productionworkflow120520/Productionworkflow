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

interface AdminUser {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  businessName?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL" | "REJECTED";
  createdAt: string;
}

const SAMPLE_ADMINS: AdminUser[] = [
  {
    id: "admin-1",
    userId: "RP-AD-0001",
    fullName: "Rajesh Kumar",
    email: "rajesh.admin@rechargepro.in",
    mobile: "9876543210",
    username: "rajesh_north",
    businessName: "North Zone Operations Hub",
    status: "ACTIVE",
    createdAt: "2026-01-15T09:30:00Z",
  },
  {
    id: "admin-2",
    userId: "RP-AD-0002",
    fullName: "Priya Sundaram",
    email: "priya.south@rechargepro.in",
    mobile: "9823456789",
    username: "priya_south",
    businessName: "Southern Apex Fintech",
    status: "ACTIVE",
    createdAt: "2026-02-10T14:20:00Z",
  },
  {
    id: "admin-3",
    userId: "RP-AD-0003",
    fullName: "Arunav Bose",
    email: "arunav.east@rechargepro.in",
    mobile: "9845123456",
    username: "arunav_east",
    businessName: "Eastern Regional Payments",
    status: "ACTIVE",
    createdAt: "2026-03-01T11:00:00Z",
  },
  {
    id: "admin-4",
    userId: "RP-AD-0004",
    fullName: "Devendra Mehta",
    email: "devendra.west@rechargepro.in",
    mobile: "9712345678",
    username: "devendra_west",
    businessName: "Western Corridor Network",
    status: "SUSPENDED",
    createdAt: "2026-03-12T16:45:00Z",
  },
  {
    id: "admin-5",
    userId: "RP-AD-0005",
    fullName: "Sunita Deshmukh",
    email: "sunita.central@rechargepro.in",
    mobile: "9988776655",
    username: "sunita_central",
    businessName: "Central Deccan Ventures",
    status: "PENDING_APPROVAL",
    createdAt: "2026-04-05T10:15:00Z",
  },
];

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(SAMPLE_ADMINS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Add Admin modal
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

  // Edit Admin modal
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Suspend/Activate Confirm
  const [toggleUser, setToggleUser] = useState<AdminUser | null>(null);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users?role=ADMIN");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.users) && data.users.length > 0) {
          setAdmins(data.users);
        }
      }
    } catch (err) {
      console.warn("Using sample admin users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filtered & Paginated
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchesSearch =
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.userId.toLowerCase().includes(search.toLowerCase()) ||
        a.username.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [admins, search, statusFilter]);

  const totalPages = Math.ceil(filteredAdmins.length / pageSize) || 1;
  const paginatedAdmins = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, page, pageSize]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, role: "ADMIN" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins((prev) => [data.user, ...prev]);
      } else {
        // Fallback simulate creation
        const newAdmin: AdminUser = {
          id: `admin-${Date.now()}`,
          userId: `PM-AD-00${admins.length + 1}`,
          fullName: addForm.fullName,
          email: addForm.email,
          mobile: addForm.mobile,
          username: addForm.username,
          businessName: addForm.businessName,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };
        setAdmins((prev) => [newAdmin, ...prev]);
      }
      setIsAddOpen(false);
      setAddForm({
        fullName: "",
        email: "",
        mobile: "",
        username: "",
        password: "",
        businessName: "",
      });
    } catch {
      // Simulate
      const newAdmin: AdminUser = {
        id: `admin-${Date.now()}`,
        userId: `PM-AD-00${admins.length + 1}`,
        fullName: addForm.fullName,
        email: addForm.email,
        mobile: addForm.mobile,
        username: addForm.username,
        businessName: addForm.businessName,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };
      setAdmins((prev) => [newAdmin, ...prev]);
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/users/${editAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAdmin),
      });
    } catch {
      // ignore
    } finally {
      setAdmins((prev) =>
        prev.map((a) => (a.id === editAdmin.id ? editAdmin : a))
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
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === toggleUser.id ? { ...a, status: newStatus } : a
        )
      );
      setToggleUser(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            User Management &bull; Admin Operations
          </div>
          <h1 className="page-header mt-1">Platform Regional Admins</h1>
          <p className="page-subheader">
            Supervise regional administrators, allocate territory quotas, and manage security access.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          className="shadow-sm"
        >
          + Add New Admin
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
          placeholder="Search by name, email, or user ID..."
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

      {/* Admins Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedAdmins.length === 0 ? (
        <EmptyState
          title="No Admins Found"
          description="No administrators match the search criteria or filter."
          action={
            <Button size="sm" variant="secondary" onClick={() => { setSearch(""); setStatusFilter("ALL"); }}>
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
                <TableHead>Administrator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {admin.userId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {admin.fullName}
                    </div>
                    {admin.businessName && (
                      <div className="text-[11px] text-gray-500">
                        {admin.businessName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {admin.email}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-600">
                    {maskMobile(admin.mobile)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.status === "ACTIVE"
                          ? "success"
                          : admin.status === "SUSPENDED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(admin.createdAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setEditAdmin(admin);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={admin.status === "ACTIVE" ? "danger" : "success"}
                      className="text-xs py-1 px-2.5"
                      onClick={() => setToggleUser(admin)}
                    >
                      {admin.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredAdmins.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Regional Administrator"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAdmin}
              isLoading={isSubmitting}
            >
              Create Administrator
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Mahindra"
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
                placeholder="admin@rechargepro.in"
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
                placeholder="10-digit mobile"
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
                placeholder="e.g. anand_north"
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
                placeholder="••••••••"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">Business / Entity Name</label>
            <input
              type="text"
              placeholder="e.g. Northern Apex Distribution Hub"
              value={addForm.businessName}
              onChange={(e) =>
                setAddForm({ ...addForm, businessName: e.target.value })
              }
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      {editAdmin && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Administrator (${editAdmin.userId})`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateAdmin}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdateAdmin} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={editAdmin.fullName}
                onChange={(e) =>
                  setEditAdmin({ ...editAdmin, fullName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={editAdmin.email}
                  onChange={(e) =>
                    setEditAdmin({ ...editAdmin, email: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Mobile</label>
                <input
                  type="tel"
                  value={editAdmin.mobile}
                  onChange={(e) =>
                    setEditAdmin({ ...editAdmin, mobile: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label">Business Name</label>
              <input
                type="text"
                value={editAdmin.businessName || ""}
                onChange={(e) =>
                  setEditAdmin({ ...editAdmin, businessName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Account Status</label>
              <select
                value={editAdmin.status}
                onChange={(e) =>
                  setEditAdmin({
                    ...editAdmin,
                    status: e.target.value as AdminUser["status"],
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

      {/* Suspend / Activate Confirm Dialog */}
      {toggleUser && (
        <ConfirmDialog
          isOpen={!!toggleUser}
          title={
            toggleUser.status === "ACTIVE"
              ? "Suspend Administrator Access"
              : "Activate Administrator Access"
          }
          message={`Are you sure you want to ${
            toggleUser.status === "ACTIVE" ? "suspend" : "reactivate"
          } administrator ${toggleUser.fullName} (${toggleUser.userId})? Suspended admins cannot authenticate or disburse downline wallet balances.`}
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
