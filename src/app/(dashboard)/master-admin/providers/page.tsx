"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";

interface ProviderGateway {
  id: string;
  name: string;
  code: string;
  category: string;
  endpoint: string;
  status: "ACTIVE" | "MAINTENANCE" | "DEGRADED";
  successRate: number;
  environment: "SANDBOX" | "PRODUCTION";
}

const SAMPLE_GATEWAYS: ProviderGateway[] = [
  {
    id: "gw-01",
    name: "PaySprint Switch Hub",
    code: "PAYSPRINT_PROD",
    category: "Recharge & BBPS",
    endpoint: "https://api.paysprint.in/v1/service",
    status: "ACTIVE",
    successRate: 99.4,
    environment: "SANDBOX",
  },
  {
    id: "gw-02",
    name: "Eko India Remittance Switch",
    code: "EKO_DMT_SWITCH",
    category: "Domestic Money Transfer (DMT)",
    endpoint: "https://api.eko.in/v2/remit",
    status: "ACTIVE",
    successRate: 98.9,
    environment: "SANDBOX",
  },
  {
    id: "gw-03",
    name: "Airtel Payments Bank Direct Aggregator",
    code: "APBL_AEPS_SWITCH",
    category: "AEPS & Micro ATM",
    endpoint: "https://partner.airtelbank.com/aeps/v2",
    status: "ACTIVE",
    successRate: 99.1,
    environment: "SANDBOX",
  },
  {
    id: "gw-04",
    name: "Bharat Connect (BBPS NPCI Direct)",
    code: "NPCI_BBPS_HUB",
    category: "Utility Bill Payments",
    endpoint: "https://bbps.npci.org.in/biller/fetch",
    status: "ACTIVE",
    successRate: 99.8,
    environment: "SANDBOX",
  },
];

export default function MasterAdminProvidersPage() {
  const [gateways, setGateways] = useState<ProviderGateway[]>(SAMPLE_GATEWAYS);

  const toggleStatus = (id: string) => {
    setGateways(
      gateways.map((g) =>
        g.id === id ? { ...g, status: g.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE" } : g
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Service Providers &amp; Gateway Adapters</h1>
          <p className="page-subheader">
            Manage upstream B2B APIs, sandbox switching credentials, and real-time SLA metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map((gw) => (
          <div key={gw.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{gw.name}</h3>
                <span className="text-xs text-gray-500 font-mono">{gw.code}</span>
              </div>
              <Badge variant={gw.status === "ACTIVE" ? "success" : "warning"}>
                {gw.status}
              </Badge>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Coverage:</span>
                <span className="font-medium text-gray-800">{gw.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway Environment:</span>
                <Badge variant="neutral">{gw.environment}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Live Uptime SLA:</span>
                <span className="font-bold text-green-700">{gw.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">API Endpoint:</span>
                <span className="font-mono text-gray-700 truncate max-w-[200px]">{gw.endpoint}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <Button
                variant={gw.status === "ACTIVE" ? "secondary" : "primary"}
                size="sm"
                onClick={() => toggleStatus(gw.id)}
              >
                {gw.status === "ACTIVE" ? "Put on Maintenance" : "Activate Gateway"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
