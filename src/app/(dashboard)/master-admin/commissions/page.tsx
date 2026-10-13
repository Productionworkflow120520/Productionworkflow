"use client";

import React, { useState } from "react";
import { Button, Badge, Modal } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface CommissionRule {
  id: string;
  name: string;
  serviceType: string;
  commissionType: "PERCENTAGE" | "FIXED";
  retailerRate: number;
  distributorRate: number;
  adminRate: number;
  isActive: boolean;
  minAmount: number;
  maxAmount: number;
}

const DEFAULT_RULES: CommissionRule[] = [
  {
    id: "rule-mobile",
    name: "Mobile Prepaid Standard",
    serviceType: "MOBILE_RECHARGE",
    commissionType: "PERCENTAGE",
    retailerRate: 2.5,
    distributorRate: 0.5,
    adminRate: 0.25,
    isActive: true,
    minAmount: 10,
    maxAmount: 5000,
  },
  {
    id: "rule-dth",
    name: "DTH Satellite Standard",
    serviceType: "DTH_RECHARGE",
    commissionType: "PERCENTAGE",
    retailerRate: 3.0,
    distributorRate: 0.75,
    adminRate: 0.3,
    isActive: true,
    minAmount: 50,
    maxAmount: 10000,
  },
  {
    id: "rule-bbps",
    name: "BBPS Bharat Connect Utilities",
    serviceType: "BBPS_PAYMENT",
    commissionType: "FIXED",
    retailerRate: 5.0,
    distributorRate: 2.0,
    adminRate: 1.0,
    isActive: true,
    minAmount: 100,
    maxAmount: 50000,
  },
  {
    id: "rule-dmt",
    name: "Domestic Remittance (DMT)",
    serviceType: "DMT_TRANSFER",
    commissionType: "PERCENTAGE",
    retailerRate: 0.4,
    distributorRate: 0.15,
    adminRate: 0.1,
    isActive: true,
    minAmount: 100,
    maxAmount: 25000,
  },
];

export default function MasterAdminCommissionsPage() {
  const [rules, setRules] = useState<CommissionRule[]>(DEFAULT_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    serviceType: "MOBILE_RECHARGE",
    commissionType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    retailerRate: 2.0,
    distributorRate: 0.5,
    adminRate: 0.25,
    minAmount: 10,
    maxAmount: 50000,
  });

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CommissionRule = {
      id: `rule-${Date.now()}`,
      ...newRule,
      isActive: true,
    };
    setRules([...rules, created]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Commission Engine &amp; Pricing Rules</h1>
          <p className="page-subheader">
            Configure multi-tier commission margins across Retailers, Distributors, and Admins
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Add Commission Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Active Services</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">4</span>
          <span className="text-[11px] text-green-600 mt-1 block">Mobile, DTH, BBPS, DMT</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Avg Retailer Yield</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">2.48%</span>
          <span className="text-[11px] text-gray-500 mt-1 block">Telecom &amp; Remittance</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Distributor Spread</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">0.47%</span>
          <span className="text-[11px] text-gray-500 mt-1 block">Downline network</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 font-medium">Platform Margin</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">0.24%</span>
          <span className="text-[11px] text-gray-500 mt-1 block">Admin net retention</span>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Retailer Margin</th>
                <th className="py-3 px-4">Distributor Split</th>
                <th className="py-3 px-4">Admin Split</th>
                <th className="py-3 px-4">Min / Max</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{rule.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{rule.serviceType.replace("_", " ")}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{rule.commissionType}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {rule.commissionType === "PERCENTAGE" ? `${rule.retailerRate}%` : formatCurrency(rule.retailerRate)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-600">
                    {rule.commissionType === "PERCENTAGE" ? `${rule.distributorRate}%` : formatCurrency(rule.distributorRate)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-purple-600">
                    {rule.commissionType === "PERCENTAGE" ? `${rule.adminRate}%` : formatCurrency(rule.adminRate)}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {formatCurrency(rule.minAmount)} - {formatCurrency(rule.maxAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={rule.isActive ? "success" : "neutral"}>
                      {rule.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Commission Rule">
        <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
          <div>
            <label className="label">Rule Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Special Festival Commission"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Service Category</label>
              <select
                value={newRule.serviceType}
                onChange={(e) => setNewRule({ ...newRule, serviceType: e.target.value })}
                className="select-field"
              >
                <option value="MOBILE_RECHARGE">Mobile Recharge</option>
                <option value="DTH_RECHARGE">DTH Recharge</option>
                <option value="BBPS_PAYMENT">BBPS Payment</option>
                <option value="DMT_TRANSFER">DMT Money Transfer</option>
              </select>
            </div>
            <div>
              <label className="label">Commission Calculation</label>
              <select
                value={newRule.commissionType}
                onChange={(e) => setNewRule({ ...newRule, commissionType: e.target.value as any })}
                className="select-field"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat Fixed (₹)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Retailer Margin</label>
              <input
                type="number"
                step="0.01"
                required
                value={newRule.retailerRate}
                onChange={(e) => setNewRule({ ...newRule, retailerRate: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Distributor Margin</label>
              <input
                type="number"
                step="0.01"
                required
                value={newRule.distributorRate}
                onChange={(e) => setNewRule({ ...newRule, distributorRate: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Admin Margin</label>
              <input
                type="number"
                step="0.01"
                required
                value={newRule.adminRate}
                onChange={(e) => setNewRule({ ...newRule, adminRate: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
