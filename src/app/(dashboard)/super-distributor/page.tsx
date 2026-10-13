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

interface SuperDistStats {
  walletBalance: number;
  todayVolume: number;
  commissionEarned: number;
  todayTxnCount: number;
  totalMasterDistributors: number;
  totalDistributors: number;
  totalRetailers: number;
}

const DEFAULT_STATS: SuperDistStats = {
  walletBalance: 150000,
  todayVolume: 624500,
  commissionEarned: 11420,
  todayTxnCount: 842,
  totalMasterDistributors: 6,
  totalDistributors: 28,
  totalRetailers: 194,
};

const SAMPLE_DOWNLINE_TXNS = [
  {
    id: "tx-sd-1",
    txnId: "TXN-20261013-0801",
    agent: "Sunil Kulkarni (PM-MD-0001)",
    role: "MASTER_DISTRIBUTOR",
    service: "FLOAT_ALLOCATION",
    amount: 50000,
    commission: 0,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:15:00Z",
  },
  {
    id: "tx-sd-2",
    txnId: "TXN-20261013-0798",
    agent: "Suresh Retailer (PM-RT-0001)",
    role: "RETAILER",
    service: "MOBILE_RECHARGE",
    amount: 299,
    commission: 2.99,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:10:00Z",
  },
  {
    id: "tx-sd-3",
    txnId: "TXN-20261013-0792",
    agent: "Balaji Store (PM-RT-0012)",
    role: "RETAILER",
    service: "BBPS_ELECTRICITY",
    amount: 1450,
    commission: 7.25,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:04:00Z",
  },
  {
    id: "tx-sd-4",
    txnId: "TXN-20261013-0789",
    agent: "Amit Kumar (PM-DT-0001)",
    role: "DISTRIBUTOR",
    service: "FLOAT_ALLOCATION",
    amount: 25000,
    commission: 0,
    status: "SUCCESS",
    createdAt: "2026-10-13T07:55:00Z",
  },
];

export default function SuperDistributorDashboard() {
  const [stats, setStats] = useState<SuperDistStats>(DEFAULT_STATS);
  const [dateRange, setDateRange] = useState("TODAY");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/reports?type=SUPER_DISTRIBUTOR_OVERVIEW");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Retain default stats on fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-navy-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white uppercase tracking-wider">
              🌐 Super Distributor Hub
            </span>
            <span className="text-xs text-blue-200">DST-SD-0001 • Rao Mega Distribution Network</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Network Operations & Float Management
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Empowered to onboard Master Distributors, Distributors, Retailers, allocate floating capital, and perform customer services.
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

      {/* Downline Subordinate Hierarchy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/super-distributor/master-distributors"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tier 4 Downline</span>
            <span className="text-2xl">💎</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalMasterDistributors}</div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Master Distributors</div>
          <p className="text-[11px] text-gray-500 mt-1">Manage regional master partners & float</p>
        </Link>

        <Link
          href="/super-distributor/distributors"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Tier 5 Downline</span>
            <span className="text-2xl">🏢</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalDistributors}</div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Distributors</div>
          <p className="text-[11px] text-gray-500 mt-1">Area distributors across territories</p>
        </Link>

        <Link
          href="/super-distributor/retailers"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tier 6 Downline</span>
            <span className="text-2xl">🏪</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalRetailers}</div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Retail Outlets</div>
          <p className="text-[11px] text-gray-500 mt-1">Active customer transaction points</p>
        </Link>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Operational Wallet Balance"
          value={formatCurrency(stats.walletBalance)}
          subtitle="Available for downline float & recharge"
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
          subtitle={`${stats.todayTxnCount} transactions processed`}
          trend={{ value: "14.8%", label: "vs yesterday", isPositive: true }}
          iconColor="green"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Super Dist Commission"
          value={formatCurrency(stats.commissionEarned)}
          subtitle="Multi-tier override earnings"
          trend={{ value: "11.2%", label: "growth", isPositive: true }}
          iconColor="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Downline Transaction Count"
          value={stats.todayTxnCount.toString()}
          subtitle="Recharge, DTH, BBPS aggregate"
          iconColor="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Quick Services Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Operational Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/super-distributor/recharge"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-navy-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">📱</span>
            <div>
              <div>Mobile Recharge</div>
              <div className="text-[10px] text-gray-500 font-normal">Customer recharge</div>
            </div>
          </Link>
          <Link
            href="/super-distributor/dth"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-navy-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">📺</span>
            <div>
              <div>DTH Recharge</div>
              <div className="text-[10px] text-gray-500 font-normal">Direct-to-home</div>
            </div>
          </Link>
          <Link
            href="/super-distributor/bbps"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-navy-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">💡</span>
            <div>
              <div>BBPS Bill Payment</div>
              <div className="text-[10px] text-gray-500 font-normal">Electricity & utilities</div>
            </div>
          </Link>
          <Link
            href="/super-distributor/wallet"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-navy-500 hover:bg-slate-100 transition-all text-xs font-semibold text-gray-800"
          >
            <span className="text-xl">💳</span>
            <div>
              <div>Float Allocation</div>
              <div className="text-[10px] text-gray-500 font-normal">Fund downline wallets</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Downline Activity Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Downline Activity</h2>
            <p className="text-xs text-gray-500">Live transactions across your authorized network tree</p>
          </div>
          <Link href="/super-distributor/transactions">
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
                <TableHead>Agent / Downline User</TableHead>
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
