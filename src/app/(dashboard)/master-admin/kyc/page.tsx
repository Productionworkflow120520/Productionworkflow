"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";

interface KycRecord {
  id: string;
  userId: string;
  name: string;
  businessName: string;
  role: string;
  panNumber: string;
  aadhaarNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

const SAMPLE_KYC: KycRecord[] = [
  {
    id: "kyc-01",
    userId: "PM-RT-0003",
    name: "Manoj Kumar Gupta",
    businessName: "Gupta General Stores & Telecom",
    role: "RETAILER",
    panNumber: "ABCDE1234F",
    aadhaarNumber: "XXXXXXXX4819",
    status: "PENDING",
    submittedAt: "2026-10-12T10:30:00Z",
  },
  {
    id: "kyc-02",
    userId: "PM-RT-0004",
    name: "Sunil Verma",
    businessName: "Verma Online Point",
    role: "RETAILER",
    panNumber: "BKMPA9821K",
    aadhaarNumber: "XXXXXXXX7721",
    status: "PENDING",
    submittedAt: "2026-10-12T11:45:00Z",
  },
  {
    id: "kyc-03",
    userId: "PM-DT-0003",
    name: "Meera Reddy",
    businessName: "Reddy Agency Hyderabad",
    role: "DISTRIBUTOR",
    panNumber: "ALOPR3312M",
    aadhaarNumber: "XXXXXXXX9910",
    status: "APPROVED",
    submittedAt: "2026-10-10T14:20:00Z",
  },
];

export default function MasterAdminKycPage() {
  const [records, setRecords] = useState<KycRecord[]>(SAMPLE_KYC);

  const handleApprove = (id: string) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)));
  };

  const handleReject = (id: string) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">KYC &amp; Compliance Queue</h1>
          <p className="page-subheader">
            Review identity documents, PAN, and Aadhaar verification for field retailers and distributors
          </p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Applicant &amp; Firm</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">PAN Number</th>
                <th className="py-3 px-4">Aadhaar (Masked)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">{r.userId}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.businessName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{r.role}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{r.panNumber}</td>
                  <td className="py-3 px-4 font-mono text-xs">{r.aadhaarNumber}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        r.status === "APPROVED" ? "success" : r.status === "PENDING" ? "warning" : "danger"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleApprove(r.id)}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleReject(r.id)}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
