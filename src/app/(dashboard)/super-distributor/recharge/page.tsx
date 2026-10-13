"use client";

import React from "react";
import { CustomerServicesView } from "@/components/services/CustomerServicesView";

export default function SuperDistributorRechargePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Recharge Terminal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Execute fast prepaid mobile top-ups with instant operator verification and receipt generation.
          </p>
        </div>
      </div>
      <CustomerServicesView initialService="mobile" userWalletBalance={150000} />
    </div>
  );
}
