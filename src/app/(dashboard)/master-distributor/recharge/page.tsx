"use client";

import React from "react";
import { CustomerServicesView } from "@/components/services/CustomerServicesView";

export default function MasterDistributorRechargePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Recharge Terminal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Execute prepaid mobile recharges across all major operators with instant credit and receipts.
          </p>
        </div>
      </div>
      <CustomerServicesView initialService="mobile" userWalletBalance={85000} />
    </div>
  );
}
