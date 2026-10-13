import { prisma } from "@/lib/db";
import { TransactionType, CommissionType, UserRole, Prisma } from "@prisma/client";

export interface CommissionCalculationResult {
  ruleId: string;
  retailerCommission: number;
  distributorCommission: number;
  masterDistributorCommission: number;
  superDistributorCommission: number;
  adminCommission: number;
  masterAdminCommission: number;
}

export interface CommissionFilters {
  startDate?: Date;
  endDate?: Date;
  role?: UserRole;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Calculate commission for a given transaction type, amount, and optional operator
 */
export async function calculateCommission(
  transactionType: TransactionType,
  amount: number,
  operator?: string
): Promise<CommissionCalculationResult | null> {
  const decimalAmount = new Prisma.Decimal(amount);

  // Find active commission rules matching the criteria, ordered by priority desc
  const rules = await prisma.commissionRule.findMany({
    where: {
      serviceType: transactionType,
      isActive: true,
      minAmount: { lte: decimalAmount },
      maxAmount: { gte: decimalAmount },
      OR: [
        { operator: operator || null },
        { operator: null },
      ],
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  if (rules.length === 0) {
    return null;
  }

  // Pick the most specific rule (prefer operator match if available)
  const rule = rules.find((r) => r.operator === operator) || rules[0];

  let retailerCommission = 0;
  let distributorCommission = 0;
  let masterDistributorCommission = 0;
  let superDistributorCommission = 0;
  let adminCommission = 0;
  let masterAdminCommission = 0;

  if (rule.commissionType === CommissionType.PERCENTAGE) {
    retailerCommission = (amount * Number(rule.retailerRate)) / 100;
    distributorCommission = (amount * Number(rule.distributorRate)) / 100;
    masterDistributorCommission = (amount * Number(rule.masterDistributorRate || 0)) / 100;
    superDistributorCommission = (amount * Number(rule.superDistributorRate || 0)) / 100;
    adminCommission = (amount * Number(rule.adminRate)) / 100;
    masterAdminCommission = (amount * Number(rule.masterAdminRate)) / 100;
  } else {
    // FIXED amount
    retailerCommission = Number(rule.retailerRate);
    distributorCommission = Number(rule.distributorRate);
    masterDistributorCommission = Number(rule.masterDistributorRate || 0);
    superDistributorCommission = Number(rule.superDistributorRate || 0);
    adminCommission = Number(rule.adminRate);
    masterAdminCommission = Number(rule.masterAdminRate);
  }

  return {
    ruleId: rule.id,
    retailerCommission: Math.round(retailerCommission * 100) / 100,
    distributorCommission: Math.round(distributorCommission * 100) / 100,
    masterDistributorCommission: Math.round(masterDistributorCommission * 100) / 100,
    superDistributorCommission: Math.round(superDistributorCommission * 100) / 100,
    adminCommission: Math.round(adminCommission * 100) / 100,
    masterAdminCommission: Math.round(masterAdminCommission * 100) / 100,
  };
}

/**
 * Process commissions down and up the hierarchy for a completed transaction
 */
export async function processCommission(
  transactionId: string,
  userId: string,
  amount: number,
  type: TransactionType,
  operator?: string
) {
  const calc = await calculateCommission(type, amount, operator);
  if (!calc) {
    return [];
  }

  // Fetch full user upline hierarchy (retailer -> distributor -> master dist -> super dist -> admin -> master admin)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parent: {
        include: {
          parent: {
            include: {
              parent: {
                include: {
                  parent: {
                    include: {
                      parent: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return [];
  }

  const entriesToCreate: Array<{
    transactionId: string;
    userId: string;
    ruleId: string;
    role: UserRole;
    commissionType: CommissionType;
    rate: Prisma.Decimal;
    baseAmount: Prisma.Decimal;
    commissionAmount: Prisma.Decimal;
    netAmount: Prisma.Decimal;
    status: string;
    creditedAt: Date;
  }> = [];

  const rule = await prisma.commissionRule.findUnique({
    where: { id: calc.ruleId },
  });
  if (!rule) return [];

  // 1. Retailer
  if (user.role === UserRole.RETAILER && calc.retailerCommission > 0) {
    entriesToCreate.push({
      transactionId,
      userId: user.id,
      ruleId: rule.id,
      role: UserRole.RETAILER,
      commissionType: rule.commissionType,
      rate: rule.retailerRate,
      baseAmount: new Prisma.Decimal(amount),
      commissionAmount: new Prisma.Decimal(calc.retailerCommission),
      netAmount: new Prisma.Decimal(calc.retailerCommission),
      status: "CREDITED",
      creditedAt: new Date(),
    });
  }

  // 2. Distributor
  const distributor = user.role === UserRole.RETAILER ? user.parent : (user.role === UserRole.DISTRIBUTOR ? user : null);
  if (distributor && distributor.role === UserRole.DISTRIBUTOR && calc.distributorCommission > 0) {
    entriesToCreate.push({
      transactionId,
      userId: distributor.id,
      ruleId: rule.id,
      role: UserRole.DISTRIBUTOR,
      commissionType: rule.commissionType,
      rate: rule.distributorRate,
      baseAmount: new Prisma.Decimal(amount),
      commissionAmount: new Prisma.Decimal(calc.distributorCommission),
      netAmount: new Prisma.Decimal(calc.distributorCommission),
      status: "CREDITED",
      creditedAt: new Date(),
    });
  }

  // 3. Master Distributor
  const masterDist = distributor ? distributor.parent : (user.role === UserRole.MASTER_DISTRIBUTOR ? user : null);
  if (masterDist && masterDist.role === UserRole.MASTER_DISTRIBUTOR && calc.masterDistributorCommission > 0) {
    entriesToCreate.push({
      transactionId,
      userId: masterDist.id,
      ruleId: rule.id,
      role: UserRole.MASTER_DISTRIBUTOR,
      commissionType: rule.commissionType,
      rate: rule.masterDistributorRate,
      baseAmount: new Prisma.Decimal(amount),
      commissionAmount: new Prisma.Decimal(calc.masterDistributorCommission),
      netAmount: new Prisma.Decimal(calc.masterDistributorCommission),
      status: "CREDITED",
      creditedAt: new Date(),
    });
  }

  // 4. Super Distributor
  const superDist = masterDist ? masterDist.parent : (user.role === UserRole.SUPER_DISTRIBUTOR ? user : null);
  if (superDist && superDist.role === UserRole.SUPER_DISTRIBUTOR && calc.superDistributorCommission > 0) {
    entriesToCreate.push({
      transactionId,
      userId: superDist.id,
      ruleId: rule.id,
      role: UserRole.SUPER_DISTRIBUTOR,
      commissionType: rule.commissionType,
      rate: rule.superDistributorRate,
      baseAmount: new Prisma.Decimal(amount),
      commissionAmount: new Prisma.Decimal(calc.superDistributorCommission),
      netAmount: new Prisma.Decimal(calc.superDistributorCommission),
      status: "CREDITED",
      creditedAt: new Date(),
    });
  }

  // Admin
  const admin = distributor ? distributor.parent : (user.role === UserRole.ADMIN ? user : null);
  if (admin && admin.role === UserRole.ADMIN && calc.adminCommission > 0) {
    entriesToCreate.push({
      transactionId,
      userId: admin.id,
      ruleId: rule.id,
      role: UserRole.ADMIN,
      commissionType: rule.commissionType,
      rate: rule.adminRate,
      baseAmount: new Prisma.Decimal(amount),
      commissionAmount: new Prisma.Decimal(calc.adminCommission),
      netAmount: new Prisma.Decimal(calc.adminCommission),
      status: "CREDITED",
      creditedAt: new Date(),
    });
  }

  // Master Admin
  const masterAdmin = admin ? admin.parent : (user.role === UserRole.MASTER_ADMIN ? user : null);
  if (masterAdmin && masterAdmin.role === UserRole.MASTER_ADMIN && calc.masterAdminCommission > 0) {
    entriesToCreate.push({
      transactionId,
      userId: masterAdmin.id,
      ruleId: rule.id,
      role: UserRole.MASTER_ADMIN,
      commissionType: rule.commissionType,
      rate: rule.masterAdminRate,
      baseAmount: new Prisma.Decimal(amount),
      commissionAmount: new Prisma.Decimal(calc.masterAdminCommission),
      netAmount: new Prisma.Decimal(calc.masterAdminCommission),
      status: "CREDITED",
      creditedAt: new Date(),
    });
  }

  const createdEntries = [];
  for (const entry of entriesToCreate) {
    const created = await prisma.commissionEntry.create({
      data: entry,
    });
    createdEntries.push(created);
  }

  return createdEntries;
}

/**
 * Get user commission entries with filters
 */
export async function getCommissionEntries(userId: string, filters: CommissionFilters = {}) {
  const { startDate, endDate, role, status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.CommissionEntryWhereInput = {
    userId,
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
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
    prisma.commissionEntry.findMany({
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
            amount: true,
            createdAt: true,
          },
        },
        rule: {
          select: {
            name: true,
            commissionType: true,
          },
        },
      },
    }),
    prisma.commissionEntry.count({ where }),
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
 * Aggregate commission stats
 */
export async function getCommissionStats(
  userId: string,
  role: UserRole,
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.CommissionEntryWhereInput = {
    ...(role === UserRole.MASTER_ADMIN ? {} : { userId }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };

  const [aggregations, count] = await Promise.all([
    prisma.commissionEntry.aggregate({
      where,
      _sum: {
        commissionAmount: true,
        netAmount: true,
        baseAmount: true,
      },
    }),
    prisma.commissionEntry.count({ where }),
  ]);

  return {
    totalCommission: Number(aggregations._sum.commissionAmount || 0),
    netCommission: Number(aggregations._sum.netAmount || 0),
    totalVolume: Number(aggregations._sum.baseAmount || 0),
    entryCount: count,
  };
}
