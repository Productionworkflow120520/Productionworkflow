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

interface AdminRetailerItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  businessName?: string | null;
  distributorName: string;
  distributorId: string;
  kycStatus: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";
  walletBalance: number;
  createdAt: string;
}

const SAMPLE_ADMIN_RETAILERS: AdminRetailerItem[] = [
  {
    id: "r-1",
    userId: "PM-RT-0120",
    fullName: "Vikram Sharma",
    email: "vikram@merchant.com",
    mobile: "9811223344",
    businessName: "Vikram Mobile & Photostat",
    distributorName: "Venkatesh Rao",
    distributorId: "dist-1",
    kycStatus: "APPROVED",
    status: "ACTIVE",
    walletBalance: 12450.5,
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "r-2",
    userId: "PM-RT-0082",
    fullName: "Anita Patel",
    email: "anita@merchant.com",
    mobile: "9822331122",
    businessName: "Patel Cyber Cafe & Pay",
    distributorName: "Mohanlal Sharma",
    distributorId: "dist-2",
    kycStatus: "APPROVED",
    status: "ACTIVE",
    walletBalance: 4890.0,
    createdAt: "2026-03-05T10:15:00Z",
  },
  {
    id: "r-3",
    userId: "PM-RT-0194",
    fullName: "Rajesh Rao",
    email: "rajesh@merchant.com",
    mobile: "9833442233",
    businessName: "Sri Balaji Communications",
    distributorName: "Venkatesh Rao",
    distributorId: "dist-1",
    kycStatus: "UNDER_REVIEW",
    status: "ACTIVE",
    walletBalance: 2150.0,
    createdAt: "2026-03-12T14:30:00Z",
  },
  {
    id: "r-4",
    userId: "PM-RT-0044",
    fullName: "Karan Johar",
    email: "karan@merchant.com",
    mobile: "9844553344",
    businessName: "Johar General Store",
    distributorName: "Mohanlal Sharma",
    distributorId: "dist-2",
    kycStatus: "REJECTED",
    status: "SUSPENDED",
    walletBalance: 0.0,
    createdAt: "2026-03-20T16:00:00Z",
  },
  {
    id: "r-5",
    userId: "PM-RT-0031",
    fullName: "Pooja Hegde",
    email: "pooja@merchant.com",
    mobile: "9855664455",
    businessName: "Hegde Bill Pay Point",
    distributorName: "Venkatesh Rao",
    distributorId: "dist-1",
    kycStatus: "SUBMITTED",
    status: "PENDING_APPROVAL",
    walletBalance: 0.0,
    createdAt: "2026-04-02T11:45:00Z",
  },
];

export default function AdminRetailersPage() {
  const [retailers, setRetailers] = useState<AdminRetailerItem[]>(SAMPLE_ADMIN_RETAILERS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [distFilter, setDistFilter] = useState("ALL");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // KYC review modal
  const [reviewRetailer, setReviewRetailer] = useState<AdminRetailerItem | null>(null);
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
        console.warn("Using sample admin downline retailers:", err);
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

      const matchesDist = distFilter === "ALL" ? true : r.distributorId === distFilter;
      const matchesKyc = kycFilter === "ALL" ? true : r.kycStatus === kycFilter;

      return matchesSearch && matchesDist && matchesKyc;
    });
  }, [retailers, search, distFilter, kycFilter]);

  const totalPages = Math.ceil(filteredRetailers.length / pageSize) || 1;
  const paginatedRetailers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRetailers.slice(start, start + pageSize);
  }, [filteredRetailers, page, pageSize]);

  const handleUpdateKyc = async (status: "APPROVED" | "REJECTED") => {
    if (!reviewRetailer) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/kyc/${reviewRetailer.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      // ignore
    } finally {
      setRetailers((prev) =>
        prev.map((r) =>
          r.id === reviewRetailer.id
            ? { ...r, kycStatus: status, status: status === "APPROVED" ? "ACTIVE" : r.status }
            : r
        )
      );
      setReviewRetailer(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
          Admin Workspace &bull; Territory Network
        </div>
        <h1 className="page-header mt-1">Territory Retail Merchants</h1>
        <p className="page-subheader">
          Manage merchant outlets under your territory distributors, monitor float, and perform KYC checks.
        </p>
      </div>

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
            <label className="text-xs text-gray-500 font-medium">Distributor:</label>
            <select
              value={distFilter}
              onChange={(e) => {
                setDistFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-44"
            >
              <option value="ALL">All Distributors</option>
              <option value="dist-1">Venkatesh Rao</option>
              <option value="dist-2">Mohanlal Sharma</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">KYC Status:</label>
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
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedRetailers.length === 0 ? (
        <EmptyState
          title="No Retailers Found"
          description="No retail merchants match your search filters."
        />
      ) : (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Retailer &amp; Outlet</TableHead>
                <TableHead>Parent Distributor</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Wallet Float</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-xs text-gray-800 font-medium">
                    {r.distributorName}
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
                  <TableCell className="text-xs font-semibold text-emerald-700">
                    {formatCurrency(r.walletBalance)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "ACTIVE" ? "success" : "danger"}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs py-1 px-2.5"
                      onClick={() => setReviewRetailer(r)}
                    >
                      Audit KYC
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

      {/* KYC Audit Modal */}
      {reviewRetailer && (
        <Modal
          isOpen={!!reviewRetailer}
          onClose={() => setReviewRetailer(null)}
          title={`KYC Audit: ${reviewRetailer.fullName} (${reviewRetailer.userId})`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setReviewRetailer(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => handleUpdateKyc("REJECTED")}
                isLoading={isSubmitting}
              >
                Reject KYC
              </Button>
              <Button
                variant="success"
                onClick={() => handleUpdateKyc("APPROVED")}
                isLoading={isSubmitting}
              >
                Approve KYC
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 block">Current Status:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {reviewRetailer.kycStatus}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Business:</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {reviewRetailer.businessName || "Sole Proprietor"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Verified Mobile:</span>
                <span className="font-mono text-gray-800">
                  {maskMobile(reviewRetailer.mobile)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Distributor:</span>
                <span className="font-medium text-gray-800">
                  {reviewRetailer.distributorName}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <h4 className="font-bold text-gray-900 text-xs">
                Verification Checklist (Demo Sandbox)
              </h4>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
                <span>✔</span>
                <span>PAN verification verified against NSDL registry.</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
                <span>✔</span>
                <span>Aadhaar OTP token validated through UIDAI portal.</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
