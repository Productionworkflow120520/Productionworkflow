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

interface DistStats {
  myRetailers: number;
  todayRevenue: number;
  walletBalance: number;
  commissionEarned: number;
  todayTxnCount: number;
}

interface RetailerPerf {
  id: string;
  name: string;
  userId: string;
  businessName: string;
  todayVolume: number;
  todayTxns: number;
  distCommission: number;
  status: "ACTIVE" | "SUSPENDED";
}

interface RecentDownlineTxn {
  id: string;
  txnId: string;
  retailerName: string;
  type: string;
  amount: number;
  distCommission: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

const DEFAULT_DIST_STATS: DistStats = {
  myRetailers: 48,
  todayRevenue: 284500,
  walletBalance: 95400,
  commissionEarned: 4260,
  todayTxnCount: 384,
};

const SAMPLE_RETAILER_PERF: RetailerPerf[] = [
  {
    id: "r-1",
    name: "Vikram Sharma",
    userId: "PM-RT-0120",
    businessName: "Vikram Mobile & Photostat",
    todayVolume: 82500,
    todayTxns: 112,
    distCommission: 1240,
    status: "ACTIVE",
  },
  {
    id: "r-2",
    name: "Rajesh Rao",
    userId: "PM-RT-0194",
    businessName: "Sri Balaji Communications",
    todayVolume: 54100,
    todayTxns: 78,
    distCommission: 810,
    status: "ACTIVE",
  },
  {
    id: "r-3",
    name: "Sunil Dutt",
    userId: "PM-RT-0105",
    businessName: "Dutt Cyber & Recharge",
    todayVolume: 41200,
    todayTxns: 64,
    distCommission: 620,
    status: "ACTIVE",
  },
  {
    id: "r-4",
    name: "Pooja Hegde",
    userId: "PM-RT-0031",
    businessName: "Hegde Bill Pay Point",
    todayVolume: 32400,
    todayTxns: 45,
    distCommission: 485,
    status: "ACTIVE",
  },
];

const SAMPLE_DOWNLINE_TXNS: RecentDownlineTxn[] = [
  {
    id: "t-1",
    txnId: "TXN-20261012-09411",
    retailerName: "Vikram Sharma",
    type: "Mobile Recharge",
    amount: 499,
    distCommission: 4.99,
    status: "SUCCESS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t-2",
    txnId: "TXN-20261012-09320",
    retailerName: "Rajesh Rao",
    type: "DTH Recharge",
    amount: 350,
    distCommission: 3.5,
    status: "PENDING",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "t-3",
    txnId: "TXN-20261012-09110",
    retailerName: "Vikram Sharma",
    type: "BBPS Electricity",
    amount: 1450,
    distCommission: 7.25,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "t-4",
    txnId: "TXN-20261012-08542",
    retailerName: "Sunil Dutt",
    type: "Mobile Recharge",
    amount: 299,
    distCommission: 2.99,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export default function DistributorDashboardPage() {
  const [stats, setStats] = useState<DistStats>(DEFAULT_DIST_STATS);
  const [performers, setPerformers] = useState<RetailerPerf[]>(SAMPLE_RETAILER_PERF);
  const [recentTxns, setRecentTxns] = useState<RecentDownlineTxn[]>(SAMPLE_DOWNLINE_TXNS);
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
        console.warn("Using sample distributor metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [dateFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Distributor Operations
          </div>
          <h1 className="page-header mt-1">Area Network Dashboard</h1>
          <p className="page-subheader">
            Retail merchant sales monitoring, float distribution, and downline commission yield.
          </p>
        </div>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Quick Action Banner */}
      <div className="bg-navy-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy-800 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <h4 className="font-semibold text-sm">Retailer Downline Operations</h4>
            <p className="text-xs text-gray-400">
              Manage wallet float, onboard retail merchants, and review performance reports.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/distributor/retailers">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              + Onboard Retailer
            </Button>
          </Link>
          <Link href="/distributor/wallet">
            <Button size="sm" variant="secondary" className="text-xs font-semibold">
              Top-up Float (₹)
            </Button>
          </Link>
          <Link href="/distributor/transactions">
            <Button size="sm" variant="primary" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700">
              Downline Feed 💳
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Retailers"
          value={stats.myRetailers}
          icon="🏪"
          subtitle="Active retail outlets"
        />
        <StatCard
          title="Today's GMV Revenue"
          value={formatCurrency(stats.todayRevenue)}
          icon="📊"
          trend={{ value: "+18%", isPositive: true, label: "volume growth" }}
        />
        <StatCard
          title="My Wallet Balance"
          value={formatCurrency(stats.walletBalance)}
          icon="💰"
          subtitle="Available for allocation"
        />
        <StatCard
          title="Commission Earned"
          value={formatCurrency(stats.commissionEarned)}
          icon="💎"
          trend={{ value: "4.2% margin", isPositive: true }}
        />
      </div>

      {/* Retailer Performance Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Top Retailer Outlets (Today)</h3>
            <p className="text-xs text-gray-500">
              High-volume merchants generating top revenue in your territory
            </p>
          </div>
          <Link href="/distributor/retailers">
            <Button variant="ghost" size="sm" className="text-navy-600 font-semibold text-xs">
              View All Retailers &rarr;
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Retailer &amp; Store</TableHead>
              <TableHead>Today Volume</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Distributor Cut</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs font-semibold text-navy-700">
                  {p.userId}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-gray-900 text-xs">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-gray-500">{p.businessName}</div>
                </TableCell>
                <TableCell className="font-bold text-gray-900 text-xs">
                  {formatCurrency(p.todayVolume)}
                </TableCell>
                <TableCell className="text-xs font-semibold text-gray-800">
                  {p.todayTxns} txns
                </TableCell>
                <TableCell className="text-xs font-semibold text-emerald-600">
                  +{formatCurrency(p.distCommission)}
                </TableCell>
                <TableCell>
                  <Badge variant="success">{p.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Recent Downline Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Recent Downline Activity</h3>
            <p className="text-xs text-gray-500">
              Transactions processed across your merchant network in real-time
            </p>
          </div>
          <Link href="/distributor/transactions">
            <Button variant="ghost" size="sm" className="text-navy-600 font-semibold text-xs">
              Full Transaction Log &rarr;
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Txn ID</TableHead>
              <TableHead className="w-40">User / Merchant</TableHead>
              <TableHead className="w-44">Service &amp; Number</TableHead>
              <TableHead className="w-32">Operator</TableHead>
              <TableHead className="w-28">Amount</TableHead>
              <TableHead className="w-24">Comm.</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-36">Provider Ref</TableHead>
              <TableHead className="w-36">Date (IST)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTxns.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs font-semibold text-navy-700 whitespace-nowrap">
                  {t.txnId}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                    {t.retailerName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-700">
                    {t.type}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-500 whitespace-nowrap">—</TableCell>
                <TableCell className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="text-xs font-semibold text-emerald-600 whitespace-nowrap">
                  +{formatCurrency(t.distCommission)}
                </TableCell>
                <TableCell className="text-center">
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
                <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">—</TableCell>
                <TableCell className="text-xs text-gray-500 whitespace-nowrap">
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
