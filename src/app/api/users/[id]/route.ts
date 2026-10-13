import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UserRole, UserStatus, KycStatus, Prisma } from "@prisma/client";
import { getDemoUserById, updateDemoUser } from "@/lib/demo-data";
import { z } from "zod";

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  businessName: z.string().optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_APPROVAL", "REJECTED"]).optional(),
  statusReason: z.string().optional(),
  kycStatus: z.enum(["NOT_SUBMITTED", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"]).optional(),
  maxDailyLimit: z.number().positive().optional(),
  maxPerTxnLimit: z.number().positive().optional(),
  servicesAllowed: z.array(z.string()).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper to verify authorization to view or edit target user
async function checkUserAccess(
  callerId: string,
  callerRole: UserRole,
  targetUserId: string
) {
  if (callerRole === "MASTER_ADMIN") return true;
  if (callerId === targetUserId) return true;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { parentId: true, parent: { select: { parentId: true } } },
  });

  if (!target) return false;

  if (callerRole === "ADMIN") {
    // Admin can access their direct children or downline retailers
    return (
      target.parentId === callerId ||
      target.parent?.parentId === callerId
    );
  }

  if (callerRole === "DISTRIBUTOR") {
    // Distributor can only access their direct retailers
    return target.parentId === callerId;
  }

  return false;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const callerId = request.headers.get("x-user-id");
    const callerRole = request.headers.get("x-user-role") as UserRole | null;
    const { id } = params;

    if (!callerId || !callerRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAccess = await checkUserAccess(callerId, callerRole, id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Forbidden: Access to this user is restricted" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        username: true,
        email: true,
        mobile: true,
        fullName: true,
        role: true,
        status: true,
        kycStatus: true,
        businessName: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        panNumber: true,
        maxDailyLimit: true,
        maxPerTxnLimit: true,
        servicesAllowed: true,
        mfaEnabled: true,
        lastLoginAt: true,
        lastLoginIp: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            businessName: true,
            role: true,
          },
        },
        walletAccount: {
          select: {
            id: true,
            balance: true,
            reservedBalance: true,
            currency: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        maxDailyLimit: Number(user.maxDailyLimit),
        maxPerTxnLimit: Number(user.maxPerTxnLimit),
        walletBalance: user.walletAccount
          ? Number(user.walletAccount.balance)
          : 0,
      },
    });
  } catch (error) {
    console.warn("Prisma offline in GET /api/users/[id], falling back to demo store:", (error as any)?.message);
    const demoUser = getDemoUserById(params.id);
    if (demoUser) {
      return NextResponse.json({
        user: {
          ...demoUser,
          maxDailyLimit: 100000,
          maxPerTxnLimit: 50000,
          walletBalance: demoUser.walletBalance || 0,
        },
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const callerId = request.headers.get("x-user-id");
    const callerRole = request.headers.get("x-user-role") as UserRole | null;
    const { id } = params;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!callerId || !callerRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { parent: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ─── Edit Authorization Check ────────────────────────────────
    // Only parent or MASTER_ADMIN can edit other users
    // If a user edits themselves, they cannot alter status, limits, or role
    const isMasterAdmin = callerRole === "MASTER_ADMIN";
    const isDirectParent = targetUser.parentId === callerId;
    const isAdminParent =
      callerRole === "ADMIN" && targetUser.parent?.parentId === callerId;
    const isSelf = callerId === id;

    if (!isMasterAdmin && !isDirectParent && !isAdminParent && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to modify this user" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = updateUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updateData = parseResult.data;

    // Self-update restrictions: users cannot change their own status or limits
    if (isSelf && !isMasterAdmin && !isDirectParent) {
      if (updateData.status || updateData.maxDailyLimit || updateData.maxPerTxnLimit || updateData.servicesAllowed) {
        return NextResponse.json(
          { error: "You cannot modify your own status, limits, or allowed services" },
          { status: 403 }
        );
      }
    }

    // Status change requires a reason
    if (updateData.status && updateData.status !== targetUser.status && !updateData.statusReason?.trim()) {
      return NextResponse.json(
        { error: "A reason is required when changing user status" },
        { status: 400 }
      );
    }

    // Prepare Prisma update fields
    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (updateData.fullName !== undefined) dataToUpdate.fullName = updateData.fullName;
    if (updateData.businessName !== undefined) dataToUpdate.businessName = updateData.businessName;
    if (updateData.mobile !== undefined) dataToUpdate.mobile = updateData.mobile;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status as UserStatus;
    if (updateData.kycStatus !== undefined) dataToUpdate.kycStatus = updateData.kycStatus as KycStatus;
    if (updateData.maxDailyLimit !== undefined) dataToUpdate.maxDailyLimit = updateData.maxDailyLimit;
    if (updateData.maxPerTxnLimit !== undefined) dataToUpdate.maxPerTxnLimit = updateData.maxPerTxnLimit;
    if (updateData.servicesAllowed !== undefined) dataToUpdate.servicesAllowed = updateData.servicesAllowed;
    if (updateData.state !== undefined) dataToUpdate.state = updateData.state;
    if (updateData.city !== undefined) dataToUpdate.city = updateData.city;
    if (updateData.pincode !== undefined) dataToUpdate.pincode = updateData.pincode;
    if (updateData.address !== undefined) dataToUpdate.address = updateData.address;

    // Capture previous values snapshot for audit
    const previousSnapshot: Record<string, unknown> = {};
    const newSnapshot: Record<string, unknown> = {};

    for (const key of Object.keys(dataToUpdate)) {
      const field = key as keyof typeof targetUser;
      previousSnapshot[key] = targetUser[field];
      newSnapshot[key] = (dataToUpdate as Record<string, unknown>)[key];
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          userId: true,
          username: true,
          email: true,
          mobile: true,
          fullName: true,
          role: true,
          status: true,
          kycStatus: true,
          businessName: true,
          maxDailyLimit: true,
          maxPerTxnLimit: true,
          servicesAllowed: true,
          updatedAt: true,
        },
      });

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: callerId,
          action: "USER_UPDATED",
          entity: "User",
          entityId: targetUser.id,
          ipAddress,
          userAgent,
          previousValue: previousSnapshot as Prisma.InputJsonValue,
          newValue: {
            ...newSnapshot,
            reason: updateData.statusReason || null,
          } as Prisma.InputJsonValue,
          metadata: {
            updatedByRole: callerRole,
            reason: updateData.statusReason || null,
          },
        },
      });

      return u;
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        ...updatedUser,
        maxDailyLimit: Number(updatedUser.maxDailyLimit),
        maxPerTxnLimit: Number(updatedUser.maxPerTxnLimit),
      },
    });
  } catch (error) {
    console.warn("Prisma offline in PATCH /api/users/[id], updating demo store:", (error as any)?.message);
    const { id } = params;
    try {
      const demoUser = getDemoUserById(id);
      return NextResponse.json({
        message: "User updated successfully in demo mode",
        user: demoUser || { id },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  }
}
