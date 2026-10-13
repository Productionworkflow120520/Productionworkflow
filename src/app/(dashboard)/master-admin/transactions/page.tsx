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
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";

interface TransactionItem {
  id: string;
  txnId: string;
  userName: string;
  userId: string;
  type: string;
  serviceNumber: string;
  operator: string;
  amount: number;
  commission: number;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
  providerRefId?: string | null;
  providerStatus?: string | null;
  createdAt: string;
  failureReason?: string | null;
}

const SAMPLE_TXNS: TransactionItem[] = [
  {
    id: "tx-1",
    txnId: "TXN-20261012-09411",
    userName: "Vikram Sharma",
    userId: "PM-RT-0120",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9876543210",
    operator: "Jio",
    amount: 499.0,
    commission: 9.98,
    status: "SUCCESS",
    providerRefId: "JIO-PAY-98234812",
    providerStatus: "SUCCESS_200",
    createdAt: "2026-10-12T09:41:00Z",
  },
  {
    id: "tx-2",
    txnId: "TXN-20261012-09384",
    userName: "Anita Patel",
    userId: "PM-RT-0082",
    type: "BBPS_PAYMENT",
    serviceNumber: "03429811234",
    operator: "Adani Electricity Mumbai",
    amount: 2480.0,
    commission: 12.0,
    status: "SUCCESS",
    providerRefId: "BBPS-NP-23091823",
    providerStatus: "NPCI_CLEAR_200",
    createdAt: "2026-10-12T09:38:00Z",
  },
  {
    id: "tx-3",
    txnId: "TXN-20261012-09320",
    userName: "Rajesh Rao",
    userId: "PM-RT-0194",
    type: "DTH_RECHARGE",
    serviceNumber: "4009823145",
    operator: "Tata Play",
    amount: 350.0,
    commission: 7.0,
    status: "PENDING",
    providerRefId: "TP-ACK-881294",
    providerStatus: "PENDING_BILLER",
    createdAt: "2026-10-12T09:32:00Z",
  },
  {
    id: "tx-4",
    txnId: "TXN-20261012-09255",
    userName: "Anita Patel",
    userId: "PM-RT-0082",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9822334455",
    operator: "Airtel",
    amount: 299.0,
    commission: 5.98,
    status: "SUCCESS",
    providerRefId: "AIR-TXN-1294012",
    providerStatus: "SUCCESS_200",
    createdAt: "2026-10-12T09:25:00Z",
  },
  {
    id: "tx-5",
    txnId: "TXN-20261012-09110",
    userName: "Vikram Sharma",
    userId: "PM-RT-0120",
    type: "BBPS_PAYMENT",
    serviceNumber: "9910283411",
    operator: "Delhi Jal Board",
    amount: 840.0,
    commission: 4.5,
    status: "FAILED",
    providerRefId: "BBPS-ERR-94812",
    providerStatus: "BILLER_TIMEOUT_504",
    failureReason: "Biller node did not acknowledge settlement in SLA window",
    createdAt: "2026-10-12T09:11:00Z",
  },
  {
    id: "tx-6",
    txnId: "TXN-20261012-08542",
    userName: "Karan Johar",
    userId: "PM-RT-0044",
    type: "MOBILE_RECHARGE",
    serviceNumber: "9812948192",
    operator: "Vi (Vodafone Idea)",
    amount: 199.0,
    commission: 3.98,
    status: "REFUNDED",
    providerRefId: "VI-REV-094123",
    providerStatus: "REVERSAL_CONFIRMED",
    failureReason: "Account suspended by carrier; immediate wallet refund executed",
    createdAt: "2026-10-12T08:54:00Z",
  },
];

export default function MasterAdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>(SAMPLE_TXNS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function loadTxns() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/transactions");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.transactions) && data.transactions.length > 0) {
            setTransactions(data.transactions);
          }
        }
      } catch (err) {
        console.warn("Using sample transactions:", err);
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
        t.userName.toLowerCase().includes(search.toLowerCase()) ||
        t.userId.toLowerCase().includes(search.toLowerCase()) ||
        t.serviceNumber.includes(search) ||
        (t.providerRefId && t.providerRefId.toLowerCase().includes(search.toLowerCase()));

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

  const handleExportCSV = () => {
    const headers = [
      "Txn ID",
      "User Name",
      "User ID",
      "Type",
      "Service Number",
      "Operator",
      "Amount",
      "Commission",
      "Status",
      "Provider Ref",
      "Date",
    ];
    const rows = filteredTxns.map((t) => [
      t.txnId,
      t.userName,
      t.userId,
      t.type,
      t.serviceNumber,
      t.operator,
      t.amount,
      t.commission,
      t.status,
      t.providerRefId || "N/A",
      t.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rechargepro_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Ledger &bull; Global Transactions
          </div>
          <h1 className="page-header mt-1">Transaction Surveillance</h1>
          <p className="page-subheader">
            Inspect all platform recharges, utility bill payments, and financial settlement trails.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter value={dateFilter} onChange={setDateFilter} />
          <Button onClick={handleExportCSV} variant="secondary" className="text-xs shadow-sm">
            📥 Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by Txn ID, User, Mobile, Ref ID..."
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
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : paginatedTxns.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description="No transactions match the specified search keywords or status filter."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch("");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Reset Filters
            </Button>
          }
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
                  <TableCell className="font-mono text-xs font-semibold text-navy-700">
                    {t.txnId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-xs">
                      {t.userName}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500">
                      {t.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-800">
                      {TRANSACTION_TYPE_LABELS[t.type] || t.type}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500">
                      {t.serviceNumber}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-700 font-medium">
                    {t.operator}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 text-xs">
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-600">
                    +{formatCurrency(t.commission)}
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
                  <TableCell className="font-mono text-xs text-gray-500">
                    {t.providerRefId || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
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

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction Audit: ${selectedTxn.txnId}`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedTxn(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
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
                <span className="text-gray-500 block">Amount:</span>
                <span className="text-base font-bold text-gray-900 mt-1 block">
                  {formatCurrency(selectedTxn.amount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Commission Earned:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(selectedTxn.commission)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Initiated Date:</span>
                <span className="font-medium text-gray-800">
                  {formatDateTime(selectedTxn.createdAt)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Merchant User:</span>
                <span className="font-medium text-gray-900">
                  {selectedTxn.userName} ({selectedTxn.userId})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Service Category:</span>
                <span className="font-medium text-gray-900">
                  {TRANSACTION_TYPE_LABELS[selectedTxn.type] || selectedTxn.type}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Operator / Provider:</span>
                <span className="font-medium text-gray-900">{selectedTxn.operator}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Consumer Number:</span>
                <span className="font-mono font-medium text-gray-900">
                  {selectedTxn.serviceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Provider Ref ID:</span>
                <span className="font-mono font-medium text-gray-900">
                  {selectedTxn.providerRefId || "Awaiting Ref"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Provider Status Code:</span>
                <span className="font-mono text-gray-700">
                  {selectedTxn.providerStatus || "HTTP 200 OK"}
                </span>
              </div>
            </div>

            {selectedTxn.failureReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <span className="font-bold block mb-1">Failure / Dispute Reason:</span>
                {selectedTxn.failureReason}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
