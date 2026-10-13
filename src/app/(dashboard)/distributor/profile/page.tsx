"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui";

export default function DistributorProfilePage() {
  const [user, setUser] = useState({
    userId: "PM-DT-0001",
    fullName: "Amit Kumar",
    email: "amit.kumar@example.com",
    mobile: "9777700001",
    role: "DISTRIBUTOR",
    businessName: "Amit Telecom Agency",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
    kycStatus: "APPROVED",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-header">Distributor Profile</h1>
        <p className="page-subheader">Agency network profile and downline distribution settings</p>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-navy-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
              <Badge variant="success">{user.kycStatus}</Badge>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{user.userId} • {user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-gray-500 block">Email</span>
            <span className="font-semibold text-gray-900 font-mono">{user.email}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-gray-500 block">Mobile</span>
            <span className="font-semibold text-gray-900 font-mono">+91 {user.mobile}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-gray-500 block">Agency Business Name</span>
            <span className="font-semibold text-gray-900">{user.businessName}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-gray-500 block">City &amp; State</span>
            <span className="font-semibold text-gray-900">{user.city}, {user.state} - {user.pincode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
