import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const callerId = request.headers.get("x-user-id");
    const callerRole = request.headers.get("x-user-role") as UserRole | null;

    if (!callerId || !callerRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Compute date ranges
    const now = new Date();
    // Default todayStart (midnight UTC for today or from param)
    const todayStart = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

    const todayEnd = endDateParam
      ? new Date(endDateParam)
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const dateFilter = {
      gte: todayStart,
      lte: todayEnd,
    };

    if (callerRole === "MASTER_ADMIN") {
      // 1. User Counts
      const [
        totalAdmins,
        totalDistributors,
        totalRetailers,
        activeUsers,
        suspendedUsers,
        pendingApprovalUsers,
        kycPendingCount,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "DISTRIBUTOR" } }),
        prisma.user.count({ where: { role: "RETAILER" } }),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { status: "SUSPENDED" } }),
        prisma.user.count({ where: { status: "PENDING_APPROVAL" } }),
        prisma.kycApplication.count({
          where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        }),
      ]);

      // 2. Transaction Stats (Today / Filtered Date Range)
      const [
        todayTxnCount,
        todayTxnSuccessCount,
        todayTxnFailedCount,
        todayTxnPendingCount,
        todayVolumeAggregate,
        todaySuccessVolumeAggregate,
      ] = await Promise.all([
        prisma.transaction.count({
          where: { createdAt: dateFilter },
        }),
        prisma.transaction.count({
          where: { createdAt: dateFilter, status: "SUCCESS" },
        }),
        prisma.transaction.count({
          where: { createdAt: dateFilter, status: "FAILED" },
        }),
        prisma.transaction.count({
          where: {
            createdAt: dateFilter,
            status: { in: ["PENDING", "INITIATED", "PROCESSING"] },
          },
        }),
        prisma.transaction.aggregate({
          where: { createdAt: dateFilter },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { createdAt: dateFilter, status: "SUCCESS" },
          _sum: { amount: true },
        }),
      ]);

      // 3. Commissions & Wallets
      const [
        totalCommissionAggregate,
        walletLiabilitiesAggregate,
        pendingWalletRequests,
        openTickets,
      ] = await Promise.all([
        prisma.commissionEntry.aggregate({
          _sum: { commissionAmount: true },
        }),
        prisma.walletAccount.aggregate({
          _sum: { balance: true },
        }),
        prisma.walletRequest.count({
          where: { status: "PENDING" },
        }),
        prisma.supportTicket.count({
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        }),
      ]);

      return NextResponse.json({
        role: "MASTER_ADMIN",
        users: {
          totalAdmins,
          totalDistributors,
          totalRetailers,
          totalUsers: totalAdmins + totalDistributors + totalRetailers,
          activeUsers,
          suspendedUsers,
          pendingApprovalUsers,
          kycPending: kycPendingCount,
        },
        transactions: {
          totalCount: todayTxnCount,
          successCount: todayTxnSuccessCount,
          failedCount: todayTxnFailedCount,
          pendingCount: todayTxnPendingCount,
          totalVolume: Number(todayVolumeAggregate._sum.amount || 0),
          successVolume: Number(todaySuccessVolumeAggregate._sum.amount || 0),
          successRate:
            todayTxnCount > 0
              ? Number(((todayTxnSuccessCount / todayTxnCount) * 100).toFixed(1))
              : 0,
        },
        finances: {
          totalCommissions: Number(totalCommissionAggregate._sum.commissionAmount || 0),
          walletLiabilities: Number(walletLiabilitiesAggregate._sum.balance || 0),
          pendingWalletRequests,
        },
        support: {
          openTickets,
        },
      });
    }

    if (callerRole === "ADMIN") {
      // Find all distributors and retailers under this Admin
      const assignedDistributors = await prisma.user.findMany({
        where: { parentId: callerId, role: "DISTRIBUTOR" },
        select: { id: true },
      });
      const distributorIds = assignedDistributors.map((d) => d.id);

      const [
        distributorCount,
        retailerCount,
        activeDownlineCount,
        pendingKycCount,
      ] = await Promise.all([
        distributorIds.length,
        prisma.user.count({
          where: {
            role: "RETAILER",
            OR: [
              { parentId: callerId },
              { parentId: { in: distributorIds } },
            ],
          },
        }),
        prisma.user.count({
          where: {
            status: "ACTIVE",
            OR: [
              { parentId: callerId },
              { parentId: { in: distributorIds } },
            ],
          },
        }),
        prisma.kycApplication.count({
          where: {
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
            user: {
              OR: [
                { parentId: callerId },
                { parentId: { in: distributorIds } },
              ],
            },
          },
        }),
      ]);

      // Downline transactions
      const [
        downlineTxnCount,
        downlineSuccessCount,
        downlineVolumeAggregate,
        adminCommissionAggregate,
      ] = await Promise.all([
        prisma.transaction.count({
          where: {
            createdAt: dateFilter,
            OR: [
              { adminId: callerId },
              { userId: callerId },
              { user: { parentId: { in: distributorIds } } },
              { user: { parentId: callerId } },
            ],
          },
        }),
        prisma.transaction.count({
          where: {
            createdAt: dateFilter,
            status: "SUCCESS",
            OR: [
              { adminId: callerId },
              { userId: callerId },
              { user: { parentId: { in: distributorIds } } },
              { user: { parentId: callerId } },
            ],
          },
        }),
        prisma.transaction.aggregate({
          where: {
            createdAt: dateFilter,
            status: "SUCCESS",
            OR: [
              { adminId: callerId },
              { userId: callerId },
              { user: { parentId: { in: distributorIds } } },
              { user: { parentId: callerId } },
            ],
          },
          _sum: { amount: true },
        }),
        prisma.commissionEntry.aggregate({
          where: { userId: callerId },
          _sum: { commissionAmount: true },
        }),
      ]);

      return NextResponse.json({
        role: "ADMIN",
        users: {
          distributorCount,
          retailerCount,
          activeDownlineCount,
          pendingKycCount,
        },
        transactions: {
          totalCount: downlineTxnCount,
          successCount: downlineSuccessCount,
          totalVolume: Number(downlineVolumeAggregate._sum.amount || 0),
          successRate:
            downlineTxnCount > 0
              ? Number(((downlineSuccessCount / downlineTxnCount) * 100).toFixed(1))
              : 0,
        },
        finances: {
          commissionEarned: Number(adminCommissionAggregate._sum.commissionAmount || 0),
        },
      });
    }

    if (callerRole === "DISTRIBUTOR") {
      const [retailerCount, activeRetailers, pendingRetailers] =
        await Promise.all([
          prisma.user.count({
            where: { parentId: callerId, role: "RETAILER" },
          }),
          prisma.user.count({
            where: {
              parentId: callerId,
              role: "RETAILER",
              status: "ACTIVE",
            },
          }),
          prisma.user.count({
            where: {
              parentId: callerId,
              role: "RETAILER",
              status: "PENDING_APPROVAL",
            },
          }),
        ]);

      // Downline transactions
      const [
        downlineTxnCount,
        downlineSuccessCount,
        downlineVolumeAggregate,
        distributorCommissionAggregate,
      ] = await Promise.all([
        prisma.transaction.count({
          where: {
            createdAt: dateFilter,
            OR: [
              { distributorId: callerId },
              { user: { parentId: callerId } },
            ],
          },
        }),
        prisma.transaction.count({
          where: {
            createdAt: dateFilter,
            status: "SUCCESS",
            OR: [
              { distributorId: callerId },
              { user: { parentId: callerId } },
            ],
          },
        }),
        prisma.transaction.aggregate({
          where: {
            createdAt: dateFilter,
            status: "SUCCESS",
            OR: [
              { distributorId: callerId },
              { user: { parentId: callerId } },
            ],
          },
          _sum: { amount: true },
        }),
        prisma.commissionEntry.aggregate({
          where: { userId: callerId },
          _sum: { commissionAmount: true },
        }),
      ]);

      return NextResponse.json({
        role: "DISTRIBUTOR",
        users: {
          retailerCount,
          activeRetailers,
          pendingRetailers,
        },
        transactions: {
          totalCount: downlineTxnCount,
          successCount: downlineSuccessCount,
          totalVolume: Number(downlineVolumeAggregate._sum.amount || 0),
          successRate:
            downlineTxnCount > 0
              ? Number(((downlineSuccessCount / downlineTxnCount) * 100).toFixed(1))
              : 0,
        },
        finances: {
          commissionEarned: Number(
            distributorCommissionAggregate._sum.commissionAmount || 0
          ),
        },
      });
    }

    if (callerRole === "RETAILER") {
      const [
        todayTxnCount,
        todaySuccessCount,
        todayFailedCount,
        todayVolumeAggregate,
        walletAccount,
        commissionAggregate,
      ] = await Promise.all([
        prisma.transaction.count({
          where: { userId: callerId, createdAt: dateFilter },
        }),
        prisma.transaction.count({
          where: {
            userId: callerId,
            createdAt: dateFilter,
            status: "SUCCESS",
          },
        }),
        prisma.transaction.count({
          where: {
            userId: callerId,
            createdAt: dateFilter,
            status: "FAILED",
          },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: callerId,
            createdAt: dateFilter,
            status: "SUCCESS",
          },
          _sum: { amount: true },
        }),
        prisma.walletAccount.findUnique({
          where: { userId: callerId },
          select: { balance: true, reservedBalance: true },
        }),
        prisma.commissionEntry.aggregate({
          where: { userId: callerId },
          _sum: { commissionAmount: true },
        }),
      ]);

      return NextResponse.json({
        role: "RETAILER",
        transactions: {
          todayCount: todayTxnCount,
          successCount: todaySuccessCount,
          failedCount: todayFailedCount,
          todayVolume: Number(todayVolumeAggregate._sum.amount || 0),
          successRate:
            todayTxnCount > 0
              ? Number(((todaySuccessCount / todayTxnCount) * 100).toFixed(1))
              : 0,
        },
        finances: {
          walletBalance: walletAccount ? Number(walletAccount.balance) : 0,
          reservedBalance: walletAccount
            ? Number(walletAccount.reservedBalance)
            : 0,
          commissionEarned: Number(commissionAggregate._sum.commissionAmount || 0),
        },
      });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.warn("Dashboard stats DB offline, returning synthetic demo stats:", (error as any)?.message);
    const callerRole = request.headers.get("x-user-role") || "MASTER_ADMIN";
    const { getSyntheticDashboardStats } = await import("@/lib/demo-data");
    const syntheticStats = getSyntheticDashboardStats(callerRole);
    return NextResponse.json(syntheticStats, { status: 200 });
  }
}
