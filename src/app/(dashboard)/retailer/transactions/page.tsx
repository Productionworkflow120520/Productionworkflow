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

interface OwnTransactionItem {
  id: string;
  txnId: string;
  type: string;
  serviceNumber: string;
  operator: string;
  amount: number;
  commission: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  providerRefId?: string | null;
  createdAt: string;
}

const SAMPLE_TXNS: OwnTransactionItem[] = [
  {
    id: "tx-1",
    txnId: "TXN-20261012-09411",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9876543210",
    operator: "Jio",
    amount: 499.0,
    commission: 9.98,
    status: "SUCCESS",
    providerRefId: "JIO-PAY-98234812",
    createdAt: "2026-10-12T09:41:00Z",
  },
  {
    id: "tx-2",
    txnId: "TXN-20261012-09255",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9822334455",
    operator: "Airtel",
    amount: 299.0,
    commission: 5.98,
    status: "SUCCESS",
    providerRefId: "AIR-TXN-1294012",
    createdAt: "2026-10-12T09:25:00Z",
  },
  {
    id: "tx-3",
    txnId: "TXN-20261012-09110",
    type: "BBPS_PAYMENT",
    serviceNumber: "03429811234",
    operator: "Adani Electricity Mumbai",
    amount: 1850.0,
    commission: 12.0,
    status: "SUCCESS",
    providerRefId: "BBPS-NP-23091823",
    createdAt: "2026-10-12T09:11:00Z",
  },
  {
    id: "tx-4",
    txnId: "TXN-20261012-08542",
    type: "DTH_RECHARGE",
    serviceNumber: "4009823145",
    operator: "Tata Play",
    amount: 350.0,
    commission: 7.0,
    status: "SUCCESS",
    providerRefId: "TP-ACK-881294",
    createdAt: "2026-10-12T08:54:00Z",
  },
  {
    id: "tx-5",
    txnId: "TXN-20261012-08100",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9910283411",
    operator: "Vi (Vodafone Idea)",
    amount: 199.0,
    commission: 0.0,
    status: "FAILED",
    providerRefId: "VI-FAIL-9102",
    createdAt: "2026-10-12T08:10:00Z",
  },
];

export default function RetailerTransactionsPage() {
  const [transactions, setTransactions] = useState<OwnTransactionItem[]>(SAMPLE_TXNS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedReceipt, setSelectedReceipt] = useState<OwnTransactionItem | null>(null);
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
        console.warn("Using sample retailer transactions:", err);
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
        t.serviceNumber.includes(search) ||
        t.operator.toLowerCase().includes(search.toLowerCase());

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
            Counter Sales &bull; Merchant Receipts
          </div>
          <h1 className="page-header mt-1">Transaction History</h1>
          <p className="page-subheader">
            Archive of mobile recharges, utility bill payments, and customer receipts.
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
          placeholder="Search by Txn ID, mobile, number..."
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
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs font-semibold text-navy-700 whitespace-nowrap">
                    {t.txnId}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-gray-800 whitespace-nowrap">—</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-gray-800">
                      {TRANSACTION_TYPE_LABELS[t.type] || t.type}
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

      {/* Customer Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Receipt: ${selectedReceipt.txnId}`}
          size="sm"
          footer={
            <div className="flex gap-2 w-full justify-between">
              <Button variant="secondary" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                className="text-xs"
              >
                🖨️ Print Receipt
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="text-center pb-2 border-b border-gray-100">
              <span className="font-bold text-sm tracking-tight text-navy-900 block">
                Recharge Pro Agent Receipt
              </span>
              <span className="text-[11px] text-gray-500">
                Authorized Merchant Service Outlet
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-gray-900">
                  {selectedReceipt.txnId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Category:</span>
                <span className="font-medium text-gray-900">
                  {TRANSACTION_TYPE_LABELS[selectedReceipt.type] || selectedReceipt.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Operator / Biller:</span>
                <span className="font-semibold text-gray-900">
                  {selectedReceipt.operator}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consumer Account / No.:</span>
                <span className="font-mono font-bold text-gray-900">
                  {selectedReceipt.serviceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider Ref:</span>
                <span className="font-mono text-gray-700">
                  {selectedReceipt.providerRefId || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date &amp; Time:</span>
                <span className="font-medium text-gray-800">
                  {formatDateTime(selectedReceipt.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge
                  variant={
                    selectedReceipt.status === "SUCCESS"
                      ? "success"
                      : selectedReceipt.status === "PENDING"
                      ? "warning"
                      : "danger"
                  }
                >
                  {selectedReceipt.status}
                </Badge>
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 text-sm">
                <span className="font-bold text-gray-900">Amount Paid:</span>
                <span className="font-extrabold text-navy-800">
                  {formatCurrency(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-100">
              Computer-generated acknowledgement &bull; Keep for your records
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
