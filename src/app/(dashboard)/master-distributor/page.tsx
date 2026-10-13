"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  StatCard,
  DateFilter,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface MasterDistStats {
  walletBalance: number;
  todayVolume: number;
  commissionEarned: number;
  todayTxnCount: number;
  totalDistributors: number;
  totalRetailers: number;
}

const DEFAULT_STATS: MasterDistStats = {
  walletBalance: 85000,
  todayVolume: 412000,
  commissionEarned: 7850,
  todayTxnCount: 520,
  totalDistributors: 14,
  totalRetailers: 120,
};

const SAMPLE_DOWNLINE_TXNS = [
  {
    id: "tx-md-1",
    txnId: "TXN-20261013-0611",
    agent: "Amit Kumar (PM-DT-0001)",
    role: "DISTRIBUTOR",
    service: "FLOAT_ALLOCATION",
    amount: 25000,
    commission: 0,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:12:00Z",
  },
  {
    id: "tx-md-2",
    txnId: "TXN-20261013-0608",
    agent: "Suresh Retailer (PM-RT-0001)",
    role: "RETAILER",
    service: "MOBILE_RECHARGE",
    amount: 479,
    commission: 3.59,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:08:00Z",
  },
  {
    id: "tx-md-3",
    txnId: "TXN-20261013-0604",
    agent: "Sri Balaji Communications (PM-RT-0012)",
    role: "RETAILER",
    service: "DTH_RECHARGE",
    amount: 350,
    commission: 2.8,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:01:00Z",
  },
];

export default function MasterDistributorDashboard() {
  const [stats, setStats] = useState<MasterDistStats>(DEFAULT_STATS);
  const [dateRange, setDateRange] = useState("TODAY");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/reports?type=MASTER_DISTRIBUTOR_OVERVIEW");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-navy-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500 text-white uppercase tracking-wider">
              💎 Master Distributor Hub
            </span>
            <span className="text-xs text-purple-200">DST-MD-0001 • Kulkarni Master Fintech Agency</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Territory Distribution &amp; Retail Network
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Create Distributors and Retailers, disburse float liquidity, and execute customer payment services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshData}
            isLoading={isRefreshing}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Downline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/master-distributor/distributors"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Tier 5 Downline</span>
            <span className="text-2xl">🏢</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalDistributors}</div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Assigned Distributors</div>
          <p className="text-[11px] text-gray-500 mt-1">Area distributors managing retailers</p>
        </Link>

        <Link
          href="/master-distributor/retailers"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tier 6 Downline</span>
            <span className="text-2xl">🏪</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalRetailers}</div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Retail Outlets</div>
          <p className="text-[11px] text-gray-500 mt-1">Direct and subordinate retail partners</p>
        </Link>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Float Wallet Balance"
          value={formatCurrency(stats.walletBalance)}
          subtitle="Available for transfers & recharge"
          iconColor="navy"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          title="Downline Volume (Today)"
          value={formatCurrency(stats.todayVolume)}
          subtitle={`${stats.todayTxnCount} transactions today`}
          trend={{ value: "12.5%", label: "vs yesterday", isPositive: true }}
          iconColor="green"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Master Dist Commission"
          value={formatCurrency(stats.commissionEarned)}
          subtitle="Multi-tier override margin"
          trend={{ value: "9.8%", label: "growth", isPositive: true }}
          iconColor="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Transaction Count"
          value={stats.todayTxnCount.toString()}
          subtitle="Aggregate network volume"
          iconColor="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Operational Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/master-distributor/recharge"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">📱</span>
            <div>
              <div>Mobile Recharge</div>
              <div className="text-[10px] text-gray-500 font-normal">Customer recharge</div>
            </div>
          </Link>
          <Link
            href="/master-distributor/dth"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">📺</span>
            <div>
              <div>DTH Recharge</div>
              <div className="text-[10px] text-gray-500 font-normal">Direct-to-home</div>
            </div>
          </Link>
          <Link
            href="/master-distributor/bbps"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">💡</span>
            <div>
              <div>BBPS Bill Payment</div>
              <div className="text-[10px] text-gray-500 font-normal">Electricity & utilities</div>
            </div>
          </Link>
          <Link
            href="/master-distributor/wallet"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">💳</span>
            <div>
              <div>Float Allocation</div>
              <div className="text-[10px] text-gray-500 font-normal">Transfer to downline</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Downline Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Downline Activity</h2>
            <p className="text-xs text-gray-500">Live transactions across your territory</p>
          </div>
          <Link href="/master-distributor/transactions">
            <Button variant="secondary" size="sm">
              All Downline Transactions
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Txn Reference</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">My Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_DOWNLINE_TXNS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-800">
                    {item.txnId}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-gray-900">
                    {item.agent}
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {item.role.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {item.service.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs text-gray-900">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs text-emerald-600">
                    {item.commission > 0 ? formatCurrency(item.commission) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "SUCCESS" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
