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

interface AdminStats {
  myDistributors: number;
  myRetailers: number;
  todayTransactions: number;
  todayGmv: number;
  pendingKyc: number;
  walletBalance: number;
  todayCommission: number;
  successRate: string;
}

interface AdminRecentTxn {
  id: string;
  txnId: string;
  retailerName: string;
  distributorName: string;
  type: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

const DEFAULT_ADMIN_STATS: AdminStats = {
  myDistributors: 14,
  myRetailers: 128,
  todayTransactions: 420,
  todayGmv: 489500,
  pendingKyc: 6,
  walletBalance: 245000,
  todayCommission: 11450,
  successRate: "98.7%",
};

const SAMPLE_ADMIN_TXNS: AdminRecentTxn[] = [
  {
    id: "tx-1",
    txnId: "TXN-20261012-1002",
    retailerName: "Vikram Sharma (PM-RT-0120)",
    distributorName: "Venkatesh Rao",
    type: "Mobile Recharge",
    amount: 499,
    status: "SUCCESS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx-2",
    txnId: "TXN-20261012-1001",
    retailerName: "Anita Patel (PM-RT-0082)",
    distributorName: "Mohanlal Sharma",
    type: "BBPS Electricity",
    amount: 1850,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 400000).toISOString(),
  },
  {
    id: "tx-3",
    txnId: "TXN-20261012-1000",
    retailerName: "Rajesh Rao (PM-RT-0194)",
    distributorName: "Venkatesh Rao",
    type: "DTH Recharge",
    amount: 350,
    status: "PENDING",
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "tx-4",
    txnId: "TXN-20261012-0999",
    retailerName: "Karan Johar (PM-RT-0044)",
    distributorName: "Mohanlal Sharma",
    type: "Mobile Recharge",
    amount: 299,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 1400000).toISOString(),
  },
  {
    id: "tx-5",
    txnId: "TXN-20261012-0998",
    retailerName: "Pooja Hegde (PM-RT-0031)",
    distributorName: "Venkatesh Rao",
    type: "Gas Utility",
    amount: 980,
    status: "FAILED",
    createdAt: new Date(Date.now() - 2000000).toISOString(),
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(DEFAULT_ADMIN_STATS);
  const [recentTxns, setRecentTxns] = useState<AdminRecentTxn[]>(SAMPLE_ADMIN_TXNS);
  const [dateFilter, setDateFilter] = useState("today");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard/stats?dateRange=${dateFilter}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.stats) {
            setStats((prev) => ({ ...prev, ...data.stats }));
          }
        }
      } catch (err) {
        console.warn("Using sample admin metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [dateFilter]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Regional Admin Portal
          </div>
          <h1 className="page-header mt-1">Zone Operations Dashboard</h1>
          <p className="page-subheader">
            Monitoring territory performance, downline distributors, and retail merchant networks.
          </p>
        </div>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Quick Action Panel */}
      <div className="bg-navy-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy-800 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <h4 className="font-semibold text-sm">Territory Management</h4>
            <p className="text-xs text-gray-400">
              Manage distributor onboarding and monitor retail network transactions.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/distributors">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              + Add Distributor
            </Button>
          </Link>
          <Link href="/admin/retailers">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              KYC Approvals ({stats.pendingKyc})
            </Button>
          </Link>
          <Link href="/admin/enquiries">
            <Button size="sm" variant="secondary" className="text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold border-amber-400">
              📩 Leads &amp; Enquiries
            </Button>
          </Link>
          <Link href="/admin/transactions">
            <Button size="sm" variant="primary" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700">
              Transaction Feed 💳
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Distributors"
          value={stats.myDistributors}
          icon="🏢"
          subtitle="Direct territorial partners"
        />
        <StatCard
          title="My Retailers"
          value={stats.myRetailers}
          icon="🏪"
          trend={{ value: "+8 this week", isPositive: true }}
        />
        <StatCard
          title="Today's Transactions"
          value={stats.todayTransactions}
          icon="📊"
          subtitle={`GMV: ${formatCurrency(stats.todayGmv)}`}
        />
        <StatCard
          title="Pending KYC"
          value={stats.pendingKyc}
          icon="🪪"
          subtitle="Requires document check"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Admin Wallet Float
            </p>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(stats.walletBalance)}
            </div>
          </div>
          <span className="text-2xl">💰</span>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Today's Net Commission
            </p>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              +{formatCurrency(stats.todayCommission)}
            </div>
          </div>
          <span className="text-2xl">💎</span>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Downline Success SLA
            </p>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.successRate}
            </div>
          </div>
          <span className="text-2xl">📈</span>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Downline Transactions</h3>
            <p className="text-xs text-gray-500">
              Real-time feed of recharges and bill payments in your territory
            </p>
          </div>
          <Link href="/admin/transactions">
            <Button variant="ghost" size="sm" className="text-navy-600 font-semibold text-xs">
              View All Transactions &rarr;
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Retailer</TableHead>
              <TableHead>Parent Distributor</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTxns.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs font-semibold text-navy-700">
                  {t.txnId}
                </TableCell>
                <TableCell className="text-xs font-medium text-gray-900">
                  {t.retailerName}
                </TableCell>
                <TableCell className="text-xs text-gray-600 font-medium">
                  {t.distributorName}
                </TableCell>
                <TableCell className="text-xs text-gray-700">
                  {t.type}
                </TableCell>
                <TableCell className="font-semibold text-gray-900 text-xs">
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.status === "SUCCESS"
                        ? "success"
                        : t.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDateTime(t.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
