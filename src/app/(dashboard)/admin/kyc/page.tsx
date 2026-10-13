"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";

interface AdminKycItem {
  id: string;
  userId: string;
  name: string;
  firm: string;
  role: string;
  mobile: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const SAMPLE_DATA: AdminKycItem[] = [
  {
    id: "ak-01",
    userId: "PM-RT-0005",
    name: "Deepak Soni",
    firm: "Soni Digital Center",
    role: "RETAILER",
    mobile: "9811122334",
    status: "PENDING",
  },
  {
    id: "ak-02",
    userId: "PM-RT-0006",
    name: "Karan Johar Telecom",
    firm: "Karan Telecom Agency",
    role: "RETAILER",
    mobile: "9822233445",
    status: "PENDING",
  },
];

export default function AdminKycPage() {
  const [items, setItems] = useState<AdminKycItem[]>(SAMPLE_DATA);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Assigned Territory KYC Verification</h1>
        <p className="page-subheader">
          Review downline retailer identity submissions and approve commercial activation
        </p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Merchant Name</th>
                <th className="py-3 px-4">Firm</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">{i.userId}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{i.name}</td>
                  <td className="py-3 px-4 text-gray-600">{i.firm}</td>
                  <td className="py-3 px-4 font-mono text-xs">{i.mobile}</td>
                  <td className="py-3 px-4">
                    <Badge variant={i.status === "PENDING" ? "warning" : "success"}>{i.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          setItems(items.map((x) => (x.id === i.id ? { ...x, status: "APPROVED" } : x)))
                        }
                      >
                        Approve
                      </Button>
                    </div>
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
