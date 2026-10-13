import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { LedgerEntryType, WalletRequestStatus, WalletRequestType, Prisma } from "@prisma/client";

export interface WalletBalanceResult {
  balance: number;
  reservedBalance: number;
  availableBalance: number;
  currency: string;
  isActive: boolean;
}

export interface LedgerFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: LedgerEntryType;
  page?: number;
  limit?: number;
}

export interface WalletRequestFilters {
  status?: WalletRequestStatus;
  type?: WalletRequestType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Get wallet balance for a user
 */
export async function getWalletBalance(userId: string): Promise<WalletBalanceResult> {
  const wallet = await prisma.walletAccount.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Wallet account not found");
  }

  const balance = Number(wallet.balance);
  const reservedBalance = Number(wallet.reservedBalance);
  const availableBalance = balance - reservedBalance;

  return {
    balance,
    reservedBalance,
    availableBalance,
    currency: wallet.currency,
    isActive: wallet.isActive,
  };
}

/**
 * Credit wallet with atomic transaction and ledger entry
 */
export async function creditWallet(
  userId: string,
  amount: number | Prisma.Decimal,
  description: string,
  category: string,
  transactionId?: string,
  actor?: string,
  metadata?: Prisma.InputJsonValue
) {
  const decimalAmount = new Prisma.Decimal(amount.toString());
  if (decimalAmount.lte(0)) {
    throw new Error("Credit amount must be greater than zero");
  }

  const referenceId = generateId("LEDGER");

  return await prisma.$transaction(async (tx) => {
    // Check dedup / idempotency if referenceId or if caller provided one
    const existingEntry = await tx.ledgerEntry.findUnique({
      where: { referenceId },
    });
    if (existingEntry) {
      throw new Error(`Duplicate ledger entry reference: ${referenceId}`);
    }

    const wallet = await tx.walletAccount.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found for user");
    }

    if (!wallet.isActive) {
      throw new Error("Wallet account is inactive");
    }

    const balanceBefore = new Prisma.Decimal(wallet.balance.toString());
    const balanceAfter = balanceBefore.add(decimalAmount);

    const amountPaise = BigInt(Math.round(Number(decimalAmount) * 100));
    const balanceBeforePaise = wallet.balancePaise !== undefined && wallet.balancePaise !== null
      ? BigInt(wallet.balancePaise)
      : BigInt(Math.round(Number(balanceBefore) * 100));
    const balanceAfterPaise = balanceBeforePaise + amountPaise;

    const updatedWallet = await tx.walletAccount.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
        balancePaise: balanceAfterPaise,
        lastTxnAt: new Date(),
      },
    });

    const ledger = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        transactionId: transactionId || null,
        referenceId,
        type: LedgerEntryType.CREDIT,
        amount: decimalAmount,
        amountPaise,
        balanceBefore,
        balanceBeforePaise,
        balanceAfter,
        balanceAfterPaise,
        description,
        category,
        actor: actor || "SYSTEM",
        metadata: metadata || Prisma.JsonNull,
      },
    });

    return {
      wallet: updatedWallet,
      ledger,
    };
  });
}

/**
 * Debit wallet with balance check, atomic transaction and ledger entry
 */
export async function debitWallet(
  userId: string,
  amount: number | Prisma.Decimal,
  description: string,
  category: string,
  transactionId?: string,
  actor?: string,
  metadata?: Prisma.InputJsonValue,
  allowNegative = false
) {
  const decimalAmount = new Prisma.Decimal(amount.toString());
  if (decimalAmount.lte(0)) {
    throw new Error("Debit amount must be greater than zero");
  }

  const referenceId = generateId("LEDGER");

  return await prisma.$transaction(async (tx) => {
    const existingEntry = await tx.ledgerEntry.findUnique({
      where: { referenceId },
    });
    if (existingEntry) {
      throw new Error(`Duplicate ledger entry reference: ${referenceId}`);
    }

    const wallet = await tx.walletAccount.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found for user");
    }

    if (!wallet.isActive) {
      throw new Error("Wallet account is inactive");
    }

    const balanceBefore = new Prisma.Decimal(wallet.balance.toString());
    const balanceAfter = balanceBefore.sub(decimalAmount);

    const amountPaise = BigInt(Math.round(Number(decimalAmount) * 100));
    const balanceBeforePaise = wallet.balancePaise !== undefined && wallet.balancePaise !== null
      ? BigInt(wallet.balancePaise)
      : BigInt(Math.round(Number(balanceBefore) * 100));
    const balanceAfterPaise = balanceBeforePaise - amountPaise;

    // Prevent negative balance unless allowed (e.g. MASTER_ADMIN system adjustment)
    if (!allowNegative && (balanceAfter.lt(0) || balanceAfterPaise < BigInt(0))) {
      throw new Error("Insufficient wallet balance");
    }

    const updatedWallet = await tx.walletAccount.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
        balancePaise: balanceAfterPaise,
        lastTxnAt: new Date(),
      },
    });

    const ledger = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        transactionId: transactionId || null,
        referenceId,
        type: LedgerEntryType.DEBIT,
        amount: decimalAmount,
        amountPaise,
        balanceBefore,
        balanceBeforePaise,
        balanceAfter,
        balanceAfterPaise,
        description,
        category,
        actor: actor || "SYSTEM",
        metadata: metadata || Prisma.JsonNull,
      },
    });

    return {
      wallet: updatedWallet,
      ledger,
    };
  });
}

/**
 * Get wallet ledger entries with pagination & filters
 */
export async function getWalletLedger(userId: string, filters: LedgerFilters = {}) {
  const { startDate, endDate, category, type, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.LedgerEntryWhereInput = {
    userId,
    ...(category ? { category } : {}),
    ...(type ? { type } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        transaction: {
          select: {
            txnId: true,
            type: true,
            serviceNumber: true,
            operator: true,
          },
        },
      },
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Create a wallet request (e.g. top-up, credit/debit adjustment)
 */
export async function createWalletRequest(
  userId: string,
  type: WalletRequestType,
  amount: number | Prisma.Decimal,
  paymentMethod?: string,
  paymentRef?: string,
  bankName?: string,
  remarks?: string
) {
  const decimalAmount = new Prisma.Decimal(amount.toString());
  if (decimalAmount.lte(0)) {
    throw new Error("Request amount must be greater than zero");
  }

  const requestId = generateId("WR");

  return await prisma.walletRequest.create({
    data: {
      requestId,
      userId,
      type,
      amount: decimalAmount,
      paymentMethod,
      paymentRef,
      bankName,
      remarks,
      status: WalletRequestStatus.PENDING,
    },
  });
}

/**
 * Approve a wallet request and credit wallet atomically
 */
export async function approveWalletRequest(requestId: string, approverId: string) {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.walletRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new Error("Wallet request not found");
    }

    if (request.status !== WalletRequestStatus.PENDING) {
      throw new Error(`Wallet request cannot be approved in ${request.status} status`);
    }

    // Verify approver exists
    const approver = await tx.user.findUnique({
      where: { id: approverId },
    });
    if (!approver) {
      throw new Error("Approver user not found");
    }

    // Update request status
    const updatedRequest = await tx.walletRequest.update({
      where: { id: requestId },
      data: {
        status: WalletRequestStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });

    // Handle wallet credit / debit depending on request type
    const wallet = await tx.walletAccount.findUnique({
      where: { userId: request.userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found for requested user");
    }

    const referenceId = generateId("LEDGER");
    const balanceBefore = new Prisma.Decimal(wallet.balance.toString());

    if (request.type === WalletRequestType.TOPUP || request.type === WalletRequestType.CREDIT_ADJUSTMENT) {
      const balanceAfter = balanceBefore.add(request.amount);

      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          lastTxnAt: new Date(),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: request.userId,
          referenceId,
          type: LedgerEntryType.CREDIT,
          amount: request.amount,
          balanceBefore,
          balanceAfter,
          description: `Wallet ${request.type} approved by ${approver.fullName} (${approver.userId})`,
          category: request.type === WalletRequestType.TOPUP ? "TOPUP" : "ADJUSTMENT",
          actor: approver.userId,
          metadata: {
            requestId: request.requestId,
            paymentMethod: request.paymentMethod,
            paymentRef: request.paymentRef,
          },
        },
      });
    } else if (request.type === WalletRequestType.DEBIT_ADJUSTMENT) {
      const balanceAfter = balanceBefore.sub(request.amount);
      if (balanceAfter.lt(0)) {
        throw new Error("Insufficient balance to execute debit adjustment");
      }

      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          lastTxnAt: new Date(),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: request.userId,
          referenceId,
          type: LedgerEntryType.DEBIT,
          amount: request.amount,
          balanceBefore,
          balanceAfter,
          description: `Debit adjustment approved by ${approver.fullName} (${approver.userId})`,
          category: "ADJUSTMENT",
          actor: approver.userId,
          metadata: {
            requestId: request.requestId,
          },
        },
      });
    }

    return updatedRequest;
  });
}

/**
 * Reject a wallet request
 */
export async function rejectWalletRequest(
  requestId: string,
  approverId: string,
  reason: string
) {
  const request = await prisma.walletRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Wallet request not found");
  }

  if (request.status !== WalletRequestStatus.PENDING) {
    throw new Error(`Wallet request cannot be rejected in ${request.status} status`);
  }

  return await prisma.walletRequest.update({
    where: { id: requestId },
    data: {
      status: WalletRequestStatus.REJECTED,
      approvedBy: approverId,
      approvedAt: new Date(),
      rejectionReason: reason,
    },
  });
}

/**
 * Get wallet requests with filters & pagination
 */
export async function getWalletRequests(filters: WalletRequestFilters = {}) {
  const { status, type, userId, startDate, endDate, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.WalletRequestWhereInput = {
    ...(userId ? { userId } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const [requests, total] = await Promise.all([
    prisma.walletRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            role: true,
            mobile: true,
            businessName: true,
          },
        },
        approver: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            role: true,
          },
        },
      },
    }),
    prisma.walletRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
