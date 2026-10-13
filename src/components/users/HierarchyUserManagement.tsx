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
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

export interface ManagedUser {
  id: string;
  userId: string;
  distributorId?: string | null;
  parentId?: string | null;
  parentDistributorId?: string | null;
  username: string;
  email: string;
  mobile: string;
  fullName: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL" | "REJECTED";
  businessName?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  walletBalance?: number;
  walletAccount?: {
    id: string;
    balance: number;
    isActive: boolean;
  };
  createdAt?: string;
}

interface HierarchyUserManagementProps {
  targetRole: "ADMIN" | "SUPER_DISTRIBUTOR" | "MASTER_DISTRIBUTOR" | "DISTRIBUTOR" | "RETAILER";
  title: string;
  description: string;
  canCreate: boolean;
}

export function HierarchyUserManagement({
  targetRole,
  title,
  description,
  canCreate,
}: HierarchyUserManagementProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    mobile: "",
    password: "",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400001",
    address: "",
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?role=${targetRole}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${title}`);
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [targetRole]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        searchQuery === "" ||
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.distributorId && u.distributorId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile?.includes(searchQuery);

      const matchStatus =
        statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          username: formData.mobile.trim(), // auto-derived from mobile number
          role: targetRole,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to create user account");
      }

      setIsCreateModalOpen(false);
      setFormData({
        fullName: "",
        businessName: "",
        email: "",
        mobile: "",
        password: "",
        state: "Maharashtra",
        city: "Mumbai",
        pincode: "400001",
        address: "",
      });
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || "An error occurred while creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="danger">Suspended</Badge>;
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending Approval</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-700 border border-navy-200">
              {ROLE_LABELS[targetRole] || targetRole}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New {ROLE_LABELS[targetRole] || targetRole}
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder={`Search by name, ID, mobile...`}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 shrink-0">
            Status Filter:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 select text-xs py-2 bg-white border border-gray-200 rounded-lg text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="text-xs text-gray-500 mt-3 font-medium">
              Loading {title}...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchUsers}>
              Retry
            </Button>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={`No ${title} found`}
              description={
                searchQuery
                  ? "Try refining your search terms or filters."
                  : `Get started by onboarding your first ${ROLE_LABELS[targetRole] || targetRole}.`
              }
              action={
                canCreate ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create {ROLE_LABELS[targetRole] || targetRole}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-36">User ID &amp; Role</TableHead>
                  <TableHead className="w-36">Distributor ID</TableHead>
                  <TableHead className="w-48">Merchant Details</TableHead>
                  <TableHead className="w-52">Contact &amp; City</TableHead>
                  <TableHead className="w-44">Parent Hierarchy</TableHead>
                  <TableHead className="w-36 text-right">Wallet Balance</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const balance =
                    user.walletAccount?.balance ?? user.walletBalance ?? 0;
                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                          {user.userId}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          @{user.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.distributorId ? (
                          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                            {user.distributorId}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 text-xs">
                          {user.fullName}
                        </div>
                        {user.businessName && (
                          <div className="text-[11px] text-gray-500 truncate max-w-[180px]">
                            {user.businessName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-800 font-mono whitespace-nowrap">
                          {user.mobile}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[160px]">
                          {user.email}
                        </div>
                        <div className="text-[10px] text-gray-400 whitespace-nowrap">
                          {user.city || "Mumbai"}, {user.state || "Maharashtra"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono text-gray-700 whitespace-nowrap">
                          Parent: {user.parentId || "Root Platform"}
                        </div>
                        {user.parentDistributorId && (
                          <div className="text-[10px] text-gray-500 whitespace-nowrap">
                            Parent Dist: {user.parentDistributorId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-xs text-emerald-700 whitespace-nowrap">
                          {formatCurrency(balance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(user.status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                  {filteredUsers.length} accounts
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredUsers.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Onboarding Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Onboard New ${ROLE_LABELS[targetRole] || targetRole}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="input text-xs w-full"
                placeholder="e.g. Ramesh Chandra"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Shop / Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="input text-xs w-full"
                placeholder="e.g. Chandra Telecom Agency"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                name="mobile"
                required
                pattern="^[6-9]\d{9}$"
                value={formData.mobile}
                onChange={handleInputChange}
                className="input text-xs w-full"
                placeholder="e.g. 9811223344"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input text-xs w-full"
                placeholder="e.g. user@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Temporary Password *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleInputChange}
              className="input text-xs w-full"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="input text-xs w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="input text-xs w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="input text-xs w-full"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Complete Onboarding
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HierarchyUserManagement;
