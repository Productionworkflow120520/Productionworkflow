"use client";

import React from "react";
import { CustomerServicesView } from "@/components/services/CustomerServicesView";

export default function SuperDistributorDthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DTH Recharge Terminal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Recharge Tata Play, Airtel DTH, Dish TV, Sun Direct, and D2H subscriptions instantly.
          </p>
        </div>
      </div>
      <CustomerServicesView initialService="dth" userWalletBalance={150000} />
    </div>
  );
}
