"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
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

interface StatsData {
  totalAdmins: number;
  totalSuperDistributors: number;
  totalMasterDistributors: number;
  totalDistributors: number;
  totalRetailers: number;
  activeUsers: number;
  todayTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  transactionValue: number;
  totalCommissions: number;
  walletLiabilities: number;
  pendingKyc: number;
  apiHealth: string;
}

interface RecentTxn {
  id: string;
  txnId: string;
  user: string;
  type: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

const DEFAULT_STATS: StatsData = {
  totalAdmins: 8,
  totalSuperDistributors: 16,
  totalMasterDistributors: 34,
  totalDistributors: 112,
  totalRetailers: 640,
  activeUsers: 810,
  todayTransactions: 2450,
  successfulTransactions: 2380,
  pendingTransactions: 38,
  failedTransactions: 32,
  transactionValue: 2850400,
  totalCommissions: 48950,
  walletLiabilities: 9420000,
  pendingKyc: 18,
  apiHealth: "99.99%",
};

const CHART_VOLUME_DATA = [
  { day: "Mon", count: 1880, amount: 1690000 },
  { day: "Tue", count: 2120, amount: 2040000 },
  { day: "Wed", count: 2300, amount: 2250000 },
  { day: "Thu", count: 2240, amount: 2180000 },
  { day: "Fri", count: 2680, amount: 2740000 },
  { day: "Sat", count: 2850, amount: 3120000 },
  { day: "Sun", count: 2450, amount: 2850400 },
];

const SERVICE_DISTRIBUTION = [
  { name: "Prepaid Mobile", value: 45, color: "#1e3a8a" },
  { name: "DTH Recharge", value: 20, color: "#2563eb" },
  { name: "BBPS Electricity", value: 22, color: "#38bdf8" },
  { name: "Gas, Water, FASTag", value: 13, color: "#93c5fd" },
];

const SUCCESS_RATE_DATA = [
  { service: "Prepaid Mobile", rate: 98.6 },
  { service: "DTH Recharge", rate: 99.1 },
  { service: "BBPS Electricity", rate: 97.8 },
  { service: "Water & Gas", rate: 98.4 },
];

const SAMPLE_TXNS: RecentTxn[] = [
  {
    id: "tx-1",
    txnId: "TXN-20261013-0091",
    user: "Suresh Retailer (PM-RT-0001)",
    type: "MOBILE_RECHARGE",
    amount: 299,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:14:00Z",
  },
  {
    id: "tx-2",
    txnId: "TXN-20261013-0090",
    user: "Balaji Store (PM-RT-0012)",
    type: "BBPS_ELECTRICITY",
    amount: 1420,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:11:00Z",
  },
  {
    id: "tx-3",
    txnId: "TXN-20261013-0089",
    user: "Rao Communications (PM-RT-0044)",
    type: "DTH_RECHARGE",
    amount: 450,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:08:00Z",
  },
  {
    id: "tx-4",
    txnId: "TXN-20261013-0088",
    user: "Amit Telecom Agency (PM-DT-0001)",
    type: "FLOAT_ALLOCATION",
    amount: 20000,
    status: "SUCCESS",
    createdAt: "2026-10-13T08:00:00Z",
  },
  {
    id: "tx-5",
    txnId: "TXN-20261013-0087",
    user: "Sharma Fast Point (PM-RT-0098)",
    type: "MOBILE_RECHARGE",
    amount: 719,
    status: "PENDING",
    createdAt: "2026-10-13T07:54:00Z",
  },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [recentTxns, setRecentTxns] = useState<RecentTxn[]>(SAMPLE_TXNS);
  const [dateRange, setDateRange] = useState("TODAY");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/reports?type=SUPER_ADMIN_OVERVIEW");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentTransactions) setRecentTxns(data.recentTransactions);
      }
    } catch {
      // Retain default stats on fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-navy-950 uppercase tracking-wider">
                👑 Super Admin
              </span>
              <span className="text-xs text-indigo-200">System Root Clearance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recharge Pro System Control Hub
            </h1>
            <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
              Complete administrative authority over 6-tier hierarchy, commission rules, service gateways, audit logs, and provider uplinks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateFilter value={dateRange} onChange={setDateRange} />
            <Link href="/super-admin/enquiries">
              <Button
                variant="secondary"
                size="sm"
                className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold border-amber-400"
              >
                📩 Partner Leads &amp; Enquiries
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              isLoading={isRefreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Sync Matrix
            </Button>
          </div>
        </div>
      </div>

      {/* 6-Tier Quick Navigation Grid */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Hierarchy Management Tiers
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/super-admin/admins"
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 group-hover:text-navy-600">Tier 2</span>
              <span className="text-base">🛡️</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalAdmins}</div>
            <div className="text-xs text-gray-500 font-medium">Admins</div>
          </Link>

          <Link
            href="/super-admin/super-distributors"
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 group-hover:text-navy-600">Tier 3</span>
              <span className="text-base">🌐</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalSuperDistributors}</div>
            <div className="text-xs text-gray-500 font-medium">Super Distributors</div>
          </Link>

          <Link
            href="/super-admin/master-distributors"
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 group-hover:text-navy-600">Tier 4</span>
              <span className="text-base">💎</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalMasterDistributors}</div>
            <div className="text-xs text-gray-500 font-medium">Master Distributors</div>
          </Link>

          <Link
            href="/super-admin/distributors"
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 group-hover:text-navy-600">Tier 5</span>
              <span className="text-base">🏢</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalDistributors}</div>
            <div className="text-xs text-gray-500 font-medium">Distributors</div>
          </Link>

          <Link
            href="/super-admin/retailers"
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-navy-500 hover:shadow-md transition-all group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 group-hover:text-navy-600">Tier 6</span>
              <span className="text-base">🏪</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalRetailers}</div>
            <div className="text-xs text-gray-500 font-medium">Retailers</div>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Transaction Value"
          value={formatCurrency(stats.transactionValue)}
          trend={{ value: "18.4%", label: "vs last week", isPositive: true }}
          iconColor="navy"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Today's Transactions"
          value={stats.todayTransactions.toLocaleString()}
          subtitle={`${stats.successfulTransactions} successful`}
          iconColor="green"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Network Commission Pool"
          value={formatCurrency(stats.totalCommissions)}
          subtitle="Multi-tier upline earned"
          trend={{ value: "12.2%", label: "vs yesterday", isPositive: true }}
          iconColor="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="System Wallet Float"
          value={formatCurrency(stats.walletLiabilities)}
          subtitle="Total circulating balance"
          iconColor="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
      </div>

      {/* Analytics Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Weekly Transaction Volume</h2>
              <p className="text-xs text-gray-500">Processed turnover across all operational branches</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
              Live Gateway Feed
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_VOLUME_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Volume"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="amount" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Service Breakdown</h2>
            <p className="text-xs text-gray-500 mb-4">Transaction proportion by payment category</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SERVICE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value">
                    {SERVICE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-gray-100">
            {SERVICE_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gateway Uptime & Success Rates */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Provider Gateway Health & Reliability</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUCCESS_RATE_DATA.map((item) => (
            <div key={item.service} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-gray-500 font-medium mb-1">{item.service}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-emerald-700">{item.rate}%</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  OPTIMAL
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${item.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Transaction Ledger Stream */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Network Transactions</h2>
            <p className="text-xs text-gray-500">Live operational transactions across all child accounts</p>
          </div>
          <Link href="/super-admin/transactions">
            <Button variant="secondary" size="sm">
              View All Transactions
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Txn Reference</TableHead>
                <TableHead>Account / User</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTxns.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-800">
                    {tx.txnId}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-gray-900">
                    {tx.user}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-gray-600">
                      {tx.type.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs text-gray-900">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "SUCCESS" ? "success" : tx.status === "PENDING" ? "warning" : "danger"}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDateTime(tx.createdAt)}
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
