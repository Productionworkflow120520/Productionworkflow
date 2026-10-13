"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  StatCard,
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

interface RetailerStats {
  todayTransactions: number;
  walletBalance: number;
  todayCommission: number;
  successRate: string;
}

interface RetailerTxn {
  id: string;
  txnId: string;
  type: string;
  serviceNumber: string;
  operator: string;
  amount: number;
  commission: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

const DEFAULT_RETAILER_STATS: RetailerStats = {
  todayTransactions: 28,
  walletBalance: 12450.5,
  todayCommission: 348.5,
  successRate: "99.2%",
};

const SAMPLE_TXNS: RetailerTxn[] = [
  {
    id: "tx-1",
    txnId: "TXN-20261012-09411",
    type: "Mobile Recharge",
    serviceNumber: "9876543210",
    operator: "Jio",
    amount: 499,
    commission: 9.98,
    status: "SUCCESS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx-2",
    txnId: "TXN-20261012-09255",
    type: "Mobile Recharge",
    serviceNumber: "9822334455",
    operator: "Airtel",
    amount: 299,
    commission: 5.98,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "tx-3",
    txnId: "TXN-20261012-09110",
    type: "BBPS Electricity",
    serviceNumber: "03429811234",
    operator: "Adani Electricity Mumbai",
    amount: 1850,
    commission: 12.0,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "tx-4",
    txnId: "TXN-20261012-08542",
    type: "DTH Recharge",
    serviceNumber: "4009823145",
    operator: "Tata Play",
    amount: 350,
    commission: 7.0,
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: "tx-5",
    txnId: "TXN-20261012-08100",
    type: "Mobile Recharge",
    serviceNumber: "9910283411",
    operator: "Vi (Vodafone Idea)",
    amount: 199,
    commission: 3.98,
    status: "FAILED",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function RetailerDashboardPage() {
  const [stats, setStats] = useState<RetailerStats>(DEFAULT_RETAILER_STATS);
  const [recentTxns, setRecentTxns] = useState<RetailerTxn[]>(SAMPLE_TXNS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          if (data?.stats) {
            setStats((prev) => ({ ...prev, ...data.stats }));
          }
        }
      } catch (err) {
        console.warn("Using sample retailer stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with Prominent Balance Display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Merchant Point of Sale &bull; Retail Terminal
          </div>
          <h1 className="page-header mt-1">Merchant Counter Dashboard</h1>
          <p className="page-subheader">
            Instant bill payments, telecom recharge, and earnings report.
          </p>
        </div>

        {/* Prominent Wallet Balance Display */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-2xl p-4 sm:px-6 shadow-md flex items-center justify-between sm:gap-6 border border-navy-700">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase">
              Working Balance
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {formatCurrency(stats.walletBalance)}
            </div>
          </div>
          <Link href="/retailer/wallet">
            <Button size="sm" variant="secondary" className="text-xs font-semibold shrink-0">
              + Top-up
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Buttons for Services */}
      <div>
        <h3 className="section-title mb-3">Instant Customer Services</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link href="/retailer/recharge">
            <div className="card hover:border-navy-400 hover:shadow-card-hover transition-all p-5 flex flex-col items-center text-center group cursor-pointer">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-navy-600 group-hover:text-white transition-colors flex items-center justify-center text-2xl mb-3">
                📱
              </div>
              <span className="font-bold text-gray-900 text-sm">Mobile Recharge</span>
              <span className="text-[11px] text-gray-500 mt-1">Prepaid &amp; Postpaid</span>
            </div>
          </Link>

          <Link href="/retailer/dth">
            <div className="card hover:border-navy-400 hover:shadow-card-hover transition-all p-5 flex flex-col items-center text-center group cursor-pointer">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-navy-600 group-hover:text-white transition-colors flex items-center justify-center text-2xl mb-3">
                📺
              </div>
              <span className="font-bold text-gray-900 text-sm">DTH Recharge</span>
              <span className="text-[11px] text-gray-500 mt-1">All Satellite Providers</span>
            </div>
          </Link>

          <Link href="/retailer/bbps">
            <div className="card hover:border-navy-400 hover:shadow-card-hover transition-all p-5 flex flex-col items-center text-center group cursor-pointer">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-navy-600 group-hover:text-white transition-colors flex items-center justify-center text-2xl mb-3">
                ⚡
              </div>
              <span className="font-bold text-gray-900 text-sm">BBPS Utility Pay</span>
              <span className="text-[11px] text-gray-500 mt-1">Electricity, Gas &amp; Water</span>
            </div>
          </Link>

          <Link href="/retailer/dmt">
            <div className="card hover:border-navy-400 hover:shadow-card-hover transition-all p-5 flex flex-col items-center text-center group cursor-pointer">
              <div className="h-14 w-14 rounded-2xl bg-violet-50 text-violet-600 group-hover:bg-navy-600 group-hover:text-white transition-colors flex items-center justify-center text-2xl mb-3">
                💸
              </div>
              <span className="font-bold text-gray-900 text-sm">Money Transfer</span>
              <span className="text-[11px] text-gray-500 mt-1">IMPS &amp; NEFT Remittance</span>
            </div>
          </Link>

          <Link href="/retailer/wallet">
            <div className="card hover:border-navy-400 hover:shadow-card-hover transition-all p-5 flex flex-col items-center text-center group cursor-pointer">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-navy-600 group-hover:text-white transition-colors flex items-center justify-center text-2xl mb-3">
                💰
              </div>
              <span className="font-bold text-gray-900 text-sm">Float &amp; Wallet</span>
              <span className="text-[11px] text-gray-500 mt-1">Balance &amp; Ledger Log</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Transactions"
          value={stats.todayTransactions}
          icon="📊"
          subtitle="Processed at your counter"
        />
        <StatCard
          title="Wallet Balance"
          value={formatCurrency(stats.walletBalance)}
          icon="💳"
          subtitle="Available for instant transactions"
        />
        <StatCard
          title="Today's Commission"
          value={formatCurrency(stats.todayCommission)}
          icon="💎"
          trend={{ value: "+₹348", isPositive: true, label: "net profit" }}
        />
        <StatCard
          title="Success Rate"
          value={stats.successRate}
          icon="✅"
          trend={{ value: "Optimal", isPositive: true }}
        />
      </div>

      {/* Recent Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Latest Counter Transactions</h3>
            <p className="text-xs text-gray-500">
              Receipt log of recent customer bills and recharges
            </p>
          </div>
          <Link href="/retailer/transactions">
            <Button variant="ghost" size="sm" className="text-navy-600 font-semibold text-xs">
              View All Transactions &rarr;
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
                  <div className="text-xs font-medium text-gray-800 whitespace-nowrap">—</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-800">
                    {t.type}
                  </div>
                  <div className="font-mono text-[11px] text-gray-500 whitespace-nowrap">
                    {t.serviceNumber}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-700 whitespace-nowrap">
                  {t.operator || "—"}
                </TableCell>
                <TableCell className="font-bold text-gray-900 text-xs whitespace-nowrap">
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="text-xs font-semibold text-emerald-600 whitespace-nowrap">
                  +{formatCurrency(t.commission)}
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
