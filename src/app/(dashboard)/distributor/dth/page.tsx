"use client";

import React from "react";
import { CustomerServicesView } from "@/components/services/CustomerServicesView";

export default function DistributorDthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DTH Satellite Recharge Terminal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Top up customer DTH packages with instant operator API verification.
          </p>
        </div>
      </div>
      <CustomerServicesView initialService="dth" userWalletBalance={50000} />
    </div>
  );
}
