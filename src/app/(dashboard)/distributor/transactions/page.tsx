"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SearchBar,
  DateFilter,
  Pagination,
  Modal,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";

interface DistTxnItem {
  id: string;
  txnId: string;
  retailerName: string;
  retailerUserId: string;
  type: string;
  serviceNumber: string;
  operator: string;
  amount: number;
  distCommission: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  providerRefId?: string | null;
  createdAt: string;
}

const SAMPLE_TXNS: DistTxnItem[] = [
  {
    id: "tx-1",
    txnId: "TXN-20261012-09411",
    retailerName: "Vikram Sharma",
    retailerUserId: "PM-RT-0120",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9876543210",
    operator: "Jio",
    amount: 499.0,
    distCommission: 4.99,
    status: "SUCCESS",
    providerRefId: "JIO-PAY-98234812",
    createdAt: "2026-10-12T09:41:00Z",
  },
  {
    id: "tx-2",
    txnId: "TXN-20261012-09320",
    retailerName: "Rajesh Rao",
    retailerUserId: "PM-RT-0194",
    type: "DTH_RECHARGE",
    serviceNumber: "4009823145",
    operator: "Tata Play",
    amount: 350.0,
    distCommission: 3.5,
    status: "PENDING",
    providerRefId: "TP-ACK-881294",
    createdAt: "2026-10-12T09:32:00Z",
  },
  {
    id: "tx-3",
    txnId: "TXN-20261012-09110",
    retailerName: "Vikram Sharma",
    retailerUserId: "PM-RT-0120",
    type: "BBPS_PAYMENT",
    serviceNumber: "9910283411",
    operator: "Delhi Jal Board",
    amount: 840.0,
    distCommission: 4.2,
    status: "FAILED",
    providerRefId: "BBPS-ERR-94812",
    createdAt: "2026-10-12T09:11:00Z",
  },
  {
    id: "tx-4",
    txnId: "TXN-20261012-08542",
    retailerName: "Sunil Dutt",
    retailerUserId: "PM-RT-0105",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9812948192",
    operator: "Vi (Vodafone Idea)",
    amount: 299.0,
    distCommission: 2.99,
    status: "SUCCESS",
    providerRefId: "VI-9842194",
    createdAt: "2026-10-12T08:54:00Z",
  },
  {
    id: "tx-5",
    txnId: "TXN-20261012-08200",
    retailerName: "Pooja Hegde",
    retailerUserId: "PM-RT-0031",
    type: "BBPS_PAYMENT",
    serviceNumber: "0239102391",
    operator: "Adani Electricity Mumbai",
    amount: 1450.0,
    distCommission: 7.25,
    status: "SUCCESS",
    providerRefId: "BBPS-AD-192031",
    createdAt: "2026-10-12T08:20:00Z",
  },
];

export default function DistributorTransactionsPage() {
  const [transactions, setTransactions] = useState<DistTxnItem[]>(SAMPLE_TXNS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedTxn, setSelectedTxn] = useState<DistTxnItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function loadTxns() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/transactions");
        if (res.ok) {
          const data = await res.json();
          if (data?.transactions?.length) {
            setTransactions(data.transactions);
          }
        }
      } catch (err) {
        console.warn("Using sample downline transactions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTxns();
  }, [dateFilter]);

  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.txnId.toLowerCase().includes(search.toLowerCase()) ||
        t.retailerName.toLowerCase().includes(search.toLowerCase()) ||
        t.serviceNumber.includes(search);

      const matchesType = typeFilter === "ALL" ? true : t.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" ? true : t.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTxns.length / pageSize) || 1;
  const paginatedTxns = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTxns.slice(start, start + pageSize);
  }, [filteredTxns, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Distributor Workspace &bull; Network Sales
          </div>
          <h1 className="page-header mt-1">Downline Merchant Transactions</h1>
          <p className="page-subheader">
            Audit and verify recharge and utility payments executed across your retail accounts.
          </p>
        </div>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by Txn ID, Retailer, Number..."
        />
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-40"
            >
              <option value="ALL">All Types</option>
              <option value="MOBILE_RECHARGE">Mobile Recharge</option>
              <option value="DTH_RECHARGE">DTH Recharge</option>
              <option value="BBPS_PAYMENT">BBPS Payment</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select-field text-xs py-2 w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedTxns.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description="No transactions match your search filter."
        />
      ) : (
        <div className="space-y-2">
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
              {paginatedTxns.map((t) => (
                <TableRow
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className="cursor-pointer hover:bg-navy-50/40"
                >
                  <TableCell className="font-mono text-xs font-semibold text-navy-700 whitespace-nowrap">
                    {t.txnId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                      {t.retailerName}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                      {t.retailerUserId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-800">
                      {TRANSACTION_TYPE_LABELS[t.type] || t.type}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
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
                  <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                    {t.providerRefId || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(t.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredTxns.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Details Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Downline Transaction: ${selectedTxn.txnId}`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedTxn(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 block">Status:</span>
                <Badge
                  variant={
                    selectedTxn.status === "SUCCESS"
                      ? "success"
                      : selectedTxn.status === "PENDING"
                      ? "warning"
                      : "danger"
                  }
                  className="mt-1"
                >
                  {selectedTxn.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 block">Transaction Value:</span>
                <span className="text-base font-bold text-gray-900 mt-1 block">
                  {formatCurrency(selectedTxn.amount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Distributor Margin:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(selectedTxn.distCommission)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Execution Time:</span>
                <span className="font-medium text-gray-800">
                  {formatDateTime(selectedTxn.createdAt)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Retail Merchant:</span>
                <span className="font-medium text-gray-900">
                  {selectedTxn.retailerName} ({selectedTxn.retailerUserId})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Service:</span>
                <span className="font-medium text-gray-900">
                  {TRANSACTION_TYPE_LABELS[selectedTxn.type] || selectedTxn.type}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Operator:</span>
                <span className="font-medium text-gray-900">{selectedTxn.operator}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Consumer Number:</span>
                <span className="font-mono font-medium text-gray-900">
                  {selectedTxn.serviceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Provider Ref:</span>
                <span className="font-mono text-gray-700">
                  {selectedTxn.providerRefId || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
