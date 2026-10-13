"use client";

import React from "react";
import { CustomerServicesView } from "@/components/services/CustomerServicesView";

export default function MasterDistributorDthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DTH Recharge Terminal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Recharge DTH accounts with instant operator API validation and confirmation.
          </p>
        </div>
      </div>
      <CustomerServicesView initialService="dth" userWalletBalance={85000} />
    </div>
  );
}
