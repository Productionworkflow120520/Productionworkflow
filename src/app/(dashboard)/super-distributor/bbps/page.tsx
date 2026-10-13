"use client";

import React from "react";
import { CustomerServicesView } from "@/components/services/CustomerServicesView";

export default function SuperDistributorBbpsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bharat Bill Payment System (BBPS)</h1>
          <p className="text-xs text-gray-500 mt-1">
            Collect electricity, water, gas, broadband, landline, and FASTag utility payments securely.
          </p>
        </div>
      </div>
      <CustomerServicesView initialService="bbps" userWalletBalance={150000} />
    </div>
  );
}
