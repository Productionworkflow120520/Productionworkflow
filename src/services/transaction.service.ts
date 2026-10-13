import { prisma } from "@/lib/db";
import { generateId, delay } from "@/lib/utils";
import { creditWallet, debitWallet } from "./wallet.service";
import { processCommission } from "./commission.service";
import {
  TransactionStatus,
  TransactionType,
  UserRole,
  Prisma,
} from "@prisma/client";

export interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  amount: number;
  serviceNumber?: string;
  operator?: string;
  circle?: string;
  planDetails?: Prisma.InputJsonValue;
  idempotencyKey?: string;
  providerId?: string;
  providerFee?: number;
}

export interface TransactionFilters {
  userId?: string;
  role?: UserRole;
  status?: TransactionStatus;
  type?: TransactionType;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Create a new transaction with idempotency check and unique internal txnId
 */
export async function createTransaction(data: CreateTransactionInput) {
  const {
    userId,
    type,
    amount,
    serviceNumber,
    operator,
    circle,
    planDetails,
    idempotencyKey = generateId("IDEMP"),
    providerId,
    providerFee = 0,
  } = data;

  // Check idempotency key first
  const existingTxn = await prisma.transaction.findUnique({
    where: { idempotencyKey },
  });

  if (existingTxn) {
    return existingTxn;
  }

  // Fetch user hierarchy for snapshots
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let retailerId: string | null = null;
  let distributorId: string | null = null;
  let masterDistributorId: string | null = null;
  let superDistributorId: string | null = null;
  let adminId: string | null = null;

  let curr: any = user;
  while (curr) {
    if (curr.role === UserRole.RETAILER && !retailerId) retailerId = curr.id;
    else if (curr.role === UserRole.DISTRIBUTOR && !distributorId) distributorId = curr.id;
    else if (curr.role === UserRole.MASTER_DISTRIBUTOR && !masterDistributorId) masterDistributorId = curr.id;
    else if (curr.role === UserRole.SUPER_DISTRIBUTOR && !superDistributorId) superDistributorId = curr.id;
    else if (curr.role === UserRole.ADMIN && !adminId) adminId = curr.id;
    curr = curr.parent;
  }

  const txnId = generateId("TXN");
  const decimalAmount = new Prisma.Decimal(amount);
  const decimalFee = new Prisma.Decimal(providerFee);
  const netAmount = decimalAmount.sub(decimalFee);

  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        txnId,
        idempotencyKey,
        userId,
        providerId: providerId || null,
        type,
        status: TransactionStatus.INITIATED,
        amount: decimalAmount,
        providerFee: decimalFee,
        netAmount,
        serviceNumber,
        operator,
        circle,
        planDetails: planDetails || Prisma.JsonNull,
        retailerId,
        distributorId,
        masterDistributorId,
        superDistributorId,
        adminId,
      },
    });

    // Record initial transaction event
    await tx.transactionEvent.create({
      data: {
        transactionId: transaction.id,
        fromStatus: TransactionStatus.INITIATED,
        toStatus: TransactionStatus.INITIATED,
        reason: "Transaction initiated",
        actor: userId,
      },
    });

    return transaction;
  });
}

/**
 * Update transaction status and record event
 */
export async function updateTransactionStatus(
  txnId: string,
  newStatus: TransactionStatus,
  reason?: string,
  actor?: string,
  metadata?: Prisma.InputJsonValue
) {
  const transaction = await prisma.transaction.findUnique({
    where: { txnId },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const oldStatus = transaction.status;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        failureReason: newStatus === TransactionStatus.FAILED ? reason : transaction.failureReason,
        completedAt:
          newStatus === TransactionStatus.SUCCESS || newStatus === TransactionStatus.FAILED
            ? new Date()
            : transaction.completedAt,
      },
    });

    await tx.transactionEvent.create({
      data: {
        transactionId: transaction.id,
        fromStatus: oldStatus,
        toStatus: newStatus,
        reason: reason || `Status changed from ${oldStatus} to ${newStatus}`,
        actor: actor || "SYSTEM",
        metadata: metadata || Prisma.JsonNull,
      },
    });

    return updated;
  });
}

/**
 * Get transactions with role-based scoping and filters
 */
export async function getTransactions(filters: TransactionFilters) {
  const {
    userId,
    role,
    status,
    type,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {};

  // Role scoping
  if (role === UserRole.RETAILER && userId) {
    where.userId = userId;
  } else if (role === UserRole.DISTRIBUTOR && userId) {
    where.OR = [{ userId }, { distributorId: userId }];
  } else if (role === UserRole.MASTER_DISTRIBUTOR && userId) {
    where.OR = [{ userId }, { masterDistributorId: userId }, { distributorId: userId }];
  } else if (role === UserRole.SUPER_DISTRIBUTOR && userId) {
    where.OR = [{ userId }, { superDistributorId: userId }, { masterDistributorId: userId }, { distributorId: userId }];
  } else if (role === UserRole.ADMIN && userId) {
    where.OR = [{ userId }, { adminId: userId }];
  } else if (role === UserRole.SUPER_ADMIN || role === UserRole.MASTER_ADMIN) {
    // Super Admin sees all system transactions
  }

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {}),
    };
  }

  if (search) {
    where.OR = [
      { txnId: { contains: search, mode: "insensitive" } },
      { serviceNumber: { contains: search, mode: "insensitive" } },
      { operator: { contains: search, mode: "insensitive" } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
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
          },
        },
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single transaction with authorization check
 */
export async function getTransactionById(
  txnIdOrId: string,
  userId: string,
  role: UserRole
) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [{ id: txnIdOrId }, { txnId: txnIdOrId }],
    },
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
      events: {
        orderBy: { createdAt: "desc" },
      },
      commissionEntries: {
        include: {
          user: {
            select: {
              userId: true,
              fullName: true,
              role: true,
            },
          },
        },
      },
      ledgerEntries: true,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Authorization check
  if (role === UserRole.RETAILER && transaction.userId !== userId) {
    throw new Error("Unauthorized to view this transaction");
  }

  if (
    role === UserRole.DISTRIBUTOR &&
    transaction.userId !== userId &&
    transaction.distributorId !== userId
  ) {
    throw new Error("Unauthorized to view this transaction");
  }

  if (
    role === UserRole.ADMIN &&
    transaction.userId !== userId &&
    transaction.adminId !== userId
  ) {
    throw new Error("Unauthorized to view this transaction");
  }

  return transaction;
}

/**
 * Process demo mode recharge or payment (simulate processing, random 80% success rate, commission/refund handling)
 */
export async function processRechargeDemo(txnId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { txnId },
    include: { user: true },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status !== TransactionStatus.INITIATED) {
    throw new Error(`Cannot process transaction in ${transaction.status} status`);
  }

  // Update to PROCESSING
  await updateTransactionStatus(
    txnId,
    TransactionStatus.PROCESSING,
    "Payment submitted to telecom gateway",
    "SYSTEM"
  );

  // Simulate network delay between 1 and 3 seconds
  const simulatedDelayMs = 1000 + Math.floor(Math.random() * 2000);
  await delay(simulatedDelayMs);

  // 80% success, 20% failure simulation
  const isSuccess = Math.random() < 0.8;
  const numAmount = Number(transaction.amount);

  if (isSuccess) {
    // Update status to SUCCESS
    const updated = await updateTransactionStatus(
      txnId,
      TransactionStatus.SUCCESS,
      "Transaction completed successfully",
      "SYSTEM",
      { gatewayRef: `OP-${Math.floor(10000000 + Math.random() * 90000000)}` }
    );

    // Process commissions
    try {
      await processCommission(
        transaction.id,
        transaction.userId,
        numAmount,
        transaction.type,
        transaction.operator || undefined
      );
    } catch (commErr) {
      console.error("Commission processing error:", commErr);
    }

    return {
      success: true,
      transaction: updated,
      message: "Transaction processed successfully",
    };
  } else {
    // Failure - refund wallet
    const failureReasons = [
      "Operator network timeout",
      "Invalid mobile/account number",
      "Circle mismatch or plan inactive",
      "Operator server down",
    ];
    const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

    const updated = await updateTransactionStatus(
      txnId,
      TransactionStatus.FAILED,
      reason,
      "SYSTEM"
    );

    // Refund wallet atomically
    await creditWallet(
      transaction.userId,
      transaction.amount,
      `Refund for failed transaction ${transaction.txnId}`,
      "REFUND",
      transaction.id,
      "SYSTEM",
      { failureReason: reason }
    );

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { refundStatus: "REFUNDED" },
    });

    return {
      success: false,
      transaction: updated,
      message: `Transaction failed: ${reason}. Wallet refunded.`,
    };
  }
}

/**
 * Aggregate transaction statistics
 */
export async function getTransactionStats(
  userId: string,
  role: UserRole,
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.TransactionWhereInput = {};

  if (role === UserRole.RETAILER) {
    where.userId = userId;
  } else if (role === UserRole.DISTRIBUTOR) {
    where.OR = [{ userId }, { distributorId: userId }];
  } else if (role === UserRole.MASTER_DISTRIBUTOR) {
    where.OR = [{ userId }, { masterDistributorId: userId }, { distributorId: userId }];
  } else if (role === UserRole.SUPER_DISTRIBUTOR) {
    where.OR = [{ userId }, { superDistributorId: userId }, { masterDistributorId: userId }, { distributorId: userId }];
  } else if (role === UserRole.ADMIN) {
    where.OR = [{ userId }, { adminId: userId }];
  }

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }

  const [totalCount, successfulCount, failedCount, pendingCount, sumAgg] =
    await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({
        where: { ...where, status: TransactionStatus.SUCCESS },
      }),
      prisma.transaction.count({
        where: { ...where, status: TransactionStatus.FAILED },
      }),
      prisma.transaction.count({
        where: {
          ...where,
          status: { in: [TransactionStatus.INITIATED, TransactionStatus.PROCESSING, TransactionStatus.PENDING] },
        },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: TransactionStatus.SUCCESS },
        _sum: { amount: true },
      }),
    ]);

  return {
    totalVolume: Number(sumAgg._sum.amount || 0),
    totalCount,
    successfulCount,
    failedCount,
    pendingCount,
    successRate: totalCount > 0 ? (successfulCount / totalCount) * 100 : 0,
  };
}
