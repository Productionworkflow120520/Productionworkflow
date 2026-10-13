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
  AreaChart,
  Area,
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
  pendingWalletRequests: number;
  pendingKyc: number;
  openTickets: number;
  pendingRefunds: number;
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
  totalDistributors: 42,
  totalRetailers: 385,
  activeUsers: 412,
  todayTransactions: 1240,
  successfulTransactions: 1188,
  pendingTransactions: 28,
  failedTransactions: 24,
  transactionValue: 1450200,
  totalCommissions: 29850,
  walletLiabilities: 6420500,
  pendingWalletRequests: 7,
  pendingKyc: 14,
  openTickets: 5,
  pendingRefunds: 3,
  apiHealth: "99.98%",
};

const CHART_VOLUME_DATA = [
  { day: "Mon", count: 980, amount: 890000 },
  { day: "Tue", count: 1120, amount: 1040000 },
  { day: "Wed", count: 1300, amount: 1250000 },
  { day: "Thu", count: 1240, amount: 1180000 },
  { day: "Fri", count: 1480, amount: 1540000 },
  { day: "Sat", count: 1650, amount: 1820000 },
  { day: "Sun", count: 1240, amount: 1450200 },
];

const SERVICE_DISTRIBUTION = [
  { name: "Mobile Recharge", value: 45, color: "#1e3a8a" },
  { name: "DTH Recharge", value: 20, color: "#2563eb" },
  { name: "BBPS Electricity/Water", value: 25, color: "#38bdf8" },
  { name: "AEPS & Others", value: 10, color: "#93c5fd" },
];

const SUCCESS_RATE_DATA = [
  { time: "06:00", successRate: 98.2, failRate: 1.8 },
  { time: "09:00", successRate: 96.5, failRate: 3.5 },
  { time: "12:00", successRate: 97.4, failRate: 2.6 },
  { time: "15:00", successRate: 95.8, failRate: 4.2 },
  { time: "18:00", successRate: 98.6, failRate: 1.4 },
  { time: "21:00", successRate: 99.1, failRate: 0.9 },
];

const COMMISSION_DATA = [
  { month: "Day 1", adminCommission: 3200, distCommission: 4800, retCommission: 11200 },
  { month: "Day 2", adminCommission: 3800, distCommission: 5400, retCommission: 12400 },
  { month: "Day 3", adminCommission: 3400, distCommission: 5100, retCommission: 11800 },
  { month: "Day 4", adminCommission: 4100, distCommission: 6200, retCommission: 13900 },
  { month: "Day 5", adminCommission: 4600, distCommission: 6900, retCommission: 15400 },
  { month: "Day 6", adminCommission: 5200, distCommission: 7600, retCommission: 16800 },
  { month: "Day 7", adminCommission: 4900, distCommission: 7100, retCommission: 15900 },
];

const SAMPLE_TXNS: RecentTxn[] = [
  { id: "1", txnId: "TXN-20261012-0091", user: "Vikram Sharma (PM-RT-0120)", type: "Mobile Recharge", amount: 499, status: "SUCCESS", createdAt: new Date().toISOString() },
  { id: "2", txnId: "TXN-20261012-0090", user: "Anita Patel (PM-RT-0082)", type: "BBPS Bill Pay", amount: 1850, status: "SUCCESS", createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: "3", txnId: "TXN-20261012-0089", user: "Rajesh Rao (PM-RT-0194)", type: "DTH Recharge", amount: 350, status: "PENDING", createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: "4", txnId: "TXN-20261012-0088", user: "Karan Johar (PM-RT-0044)", type: "Mobile Recharge", amount: 299, status: "SUCCESS", createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: "5", txnId: "TXN-20261012-0087", user: "Pooja Hegde (PM-RT-0031)", type: "Electricity Bill", amount: 3420, status: "FAILED", createdAt: new Date(Date.now() - 1200000).toISOString() },
  { id: "6", txnId: "TXN-20261012-0086", user: "Amit Verma (PM-RT-0077)", type: "Mobile Recharge", amount: 199, status: "SUCCESS", createdAt: new Date(Date.now() - 1500000).toISOString() },
  { id: "7", txnId: "TXN-20261012-0085", user: "Sanjay Singhania (PM-RT-0211)", type: "DTH Recharge", amount: 500, status: "SUCCESS", createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "8", txnId: "TXN-20261012-0084", user: "Ritu Nambiar (PM-RT-0099)", type: "Water Bill", amount: 620, status: "SUCCESS", createdAt: new Date(Date.now() - 2100000).toISOString() },
  { id: "9", txnId: "TXN-20261012-0083", user: "Manoj Tiwari (PM-RT-0155)", type: "Mobile Recharge", amount: 719, status: "SUCCESS", createdAt: new Date(Date.now() - 2400000).toISOString() },
  { id: "10", txnId: "TXN-20261012-0082", user: "Sunil Dutt (PM-RT-0105)", type: "Mobile Recharge", amount: 239, status: "SUCCESS", createdAt: new Date(Date.now() - 2700000).toISOString() },
];

export default function MasterAdminDashboard() {
  const [dateFilter, setDateFilter] = useState("today");
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [recentTxns, setRecentTxns] = useState<RecentTxn[]>(SAMPLE_TXNS);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard/stats?dateRange=${dateFilter}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.stats) {
            setStats({ ...DEFAULT_STATS, ...data.stats });
          }
          if (data && data.recentTransactions) {
            setRecentTxns(data.recentTransactions);
          }
        }
      } catch (err) {
        console.warn("Using sample fintech stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [dateFilter]);

  return (
    <div className="space-y-8">
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Portal Control &bull; Master Administrator
          </div>
          <h1 className="page-header mt-1">Platform Command Center</h1>
          <p className="page-subheader">
            Real-time analytics, user hierarchy surveillance, and service routing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-navy-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy-800 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <h4 className="font-semibold text-sm">System Operations Hub</h4>
            <p className="text-xs text-gray-400">
              Direct access to administrative workflows and critical platform queues.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link href="/master-admin/admins">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              + Add Admin
            </Button>
          </Link>
          <Link href="/master-admin/retailers">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              KYC Queue ({stats.pendingKyc})
            </Button>
          </Link>
          <Link href="/master-admin/wallets">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              Wallet Requests ({stats.pendingWalletRequests})
            </Button>
          </Link>
          <Link href="/master-admin/settings">
            <Button size="sm" variant="primary" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700">
              System Settings ⚙️
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Row Stat Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100 flex flex-col justify-between" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: Users Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Admins"
              value={stats.totalAdmins}
              icon="🛡️"
              subtitle="Regional super-partners"
            />
            <StatCard
              title="Total Distributors"
              value={stats.totalDistributors}
              icon="🏢"
              subtitle="Area network distributors"
            />
            <StatCard
              title="Total Retailers"
              value={stats.totalRetailers}
              icon="🏪"
              subtitle="Frontline merchant points"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon="🟢"
              trend={{ value: "96.4%", isPositive: true, label: "portal engagement" }}
            />
          </div>

          {/* Row 2: Transactions Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Transactions"
              value={stats.todayTransactions}
              icon="📊"
              trend={{ value: "+12%", isPositive: true, label: "vs yesterday" }}
            />
            <StatCard
              title="Successful Transactions"
              value={stats.successfulTransactions}
              icon="✅"
              subtitle="Processed smoothly"
            />
            <StatCard
              title="Pending Transactions"
              value={stats.pendingTransactions}
              icon="⏳"
              subtitle="Awaiting provider webhook"
            />
            <StatCard
              title="Failed Transactions"
              value={stats.failedTransactions}
              icon="❌"
              subtitle="Failed / Reversed"
            />
          </div>

          {/* Row 3: Financials & Wallets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Transaction Value"
              value={formatCurrency(stats.transactionValue)}
              icon="💳"
              subtitle="Total GMV processed"
            />
            <StatCard
              title="Total Commissions"
              value={formatCurrency(stats.totalCommissions)}
              icon="💎"
              subtitle="Gross platform payout"
            />
            <StatCard
              title="Wallet Liabilities"
              value={formatCurrency(stats.walletLiabilities)}
              icon="🏦"
              subtitle="Total network float"
            />
            <StatCard
              title="Pending Wallet Requests"
              value={stats.pendingWalletRequests}
              icon="📑"
              subtitle="Requires approval"
            />
          </div>

          {/* Row 4: Platform Health & Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending KYC"
              value={stats.pendingKyc}
              icon="🪪"
              subtitle="Retailers awaiting review"
            />
            <StatCard
              title="Open Support Tickets"
              value={stats.openTickets}
              icon="🎫"
              subtitle="Needs resolution"
            />
            <StatCard
              title="Pending Refunds"
              value={stats.pendingRefunds}
              icon="↩️"
              subtitle="Disputed chargebacks"
            />
            <StatCard
              title="API Gateway Health"
              value={stats.apiHealth}
              icon="📡"
              trend={{ value: "Optimal", isPositive: true }}
            />
          </div>
        </div>
      )}

      {/* Interactive Charts Section */}
      {isClient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Bar Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Transaction Volume (Last 7 Days)
                </h3>
                <p className="text-xs text-gray-500">
                  Daily processed volume &amp; ticket counts
                </p>
              </div>
              <Badge variant="info">Daily Run Rate</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_VOLUME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [`${val.toLocaleString()} txns`, "Transactions"]}
                  />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Pie Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Service-wise Distribution
                </h3>
                <p className="text-xs text-gray-500">
                  Recharge vs BBPS vs Financial Services share
                </p>
              </div>
              <Badge variant="neutral">Service Mix</Badge>
            </div>
            <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SERVICE_DISTRIBUTION}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {SERVICE_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 sm:mt-0 text-xs">
                {SERVICE_DISTRIBUTION.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-gray-600 font-medium">{s.name}:</span>
                    <span className="font-bold text-gray-900">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Success/Failure Rate Line Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Success vs Failure Trajectory
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time SLA tracking across intraday periods
                </p>
              </div>
              <Badge variant="success">98.4% Average</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SUCCESS_RATE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Rate"]} />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Success Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="failRate"
                    stroke="#dc2626"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                    name="Failure Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Commission Trends Area Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Tiered Commission Distribution
                </h3>
                <p className="text-xs text-gray-500">
                  Retailer, Distributor &amp; Admin commissions (₹)
                </p>
              </div>
              <Badge variant="info">Multi-Tier Float</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={COMMISSION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip formatter={(val: number) => [formatCurrency(val), ""]} />
                  <Area
                    type="monotone"
                    dataKey="retCommission"
                    stackId="1"
                    stroke="#1d4ed8"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                    name="Retailers"
                  />
                  <Area
                    type="monotone"
                    dataKey="distCommission"
                    stackId="1"
                    stroke="#0284c7"
                    fill="#38bdf8"
                    fillOpacity={0.3}
                    name="Distributors"
                  />
                  <Area
                    type="monotone"
                    dataKey="adminCommission"
                    stackId="1"
                    stroke="#0f172a"
                    fill="#1e293b"
                    fillOpacity={0.2}
                    name="Admins"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Latest Network Transactions</h3>
            <p className="text-xs text-gray-500">
              Surveillance log of recent operations processed on Recharge Pro
            </p>
          </div>
          <Link href="/master-admin/transactions">
            <Button variant="ghost" size="sm" className="text-navy-600 font-semibold text-xs">
              View All Transactions &rarr;
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Agent / User</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time (IST)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTxns.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-xs font-semibold text-navy-700">
                  {txn.txnId}
                </TableCell>
                <TableCell className="text-xs font-medium text-gray-900">
                  {txn.user}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {txn.type}
                </TableCell>
                <TableCell className="font-semibold text-gray-900 text-xs">
                  {formatCurrency(txn.amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      txn.status === "SUCCESS"
                        ? "success"
                        : txn.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDateTime(txn.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
