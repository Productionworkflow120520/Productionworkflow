import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { isParentRole } from "@/lib/auth";
import { z } from "zod";

const toggleStatusSchema = z.object({
  reason: z.string().min(3, "A valid reason of at least 3 characters is required"),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // A user cannot toggle their own status
    if (callerId === id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot toggle your own account status" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = toggleStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Reason is required" },
        { status: 400 }
      );
    }

    const { reason } = parseResult.data;

    // Fetch target user with parent
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { parent: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role hierarchy & permission checks
    const isMasterAdmin = callerRole === "MASTER_ADMIN";
    const isDirectParent = targetUser.parentId === callerId;
    const isAdminOfParent =
      callerRole === "ADMIN" && targetUser.parent?.parentId === callerId;

    if (!isMasterAdmin && !isDirectParent && !isAdminOfParent) {
      return NextResponse.json(
        { error: "Forbidden: Only designated parent or Master Admin can change status" },
        { status: 403 }
      );
    }

    // Prevent lower role modifying higher or equal role
    if (!isMasterAdmin && !isParentRole(callerRole, targetUser.role)) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify a user of equal or higher tier" },
        { status: 403 }
      );
    }

    // Calculate new status: ACTIVE <-> SUSPENDED
    // If user is currently PENDING_APPROVAL or REJECTED, turning on sets to ACTIVE
    const newStatus: UserStatus =
      targetUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { status: newStatus },
        select: {
          id: true,
          userId: true,
          username: true,
          fullName: true,
          role: true,
          status: true,
        },
      });

      // Audit Log entry
      await tx.auditLog.create({
        data: {
          userId: callerId,
          action: newStatus === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED",
          entity: "User",
          entityId: targetUser.id,
          ipAddress,
          userAgent,
          previousValue: { status: targetUser.status },
          newValue: { status: newStatus, reason },
          metadata: {
            reason,
            changedBy: callerId,
            changedByRole: callerRole,
          },
        },
      });

      // If user is suspended, deactivate all their current active sessions
      if (newStatus === "SUSPENDED") {
        await tx.userSession.updateMany({
          where: { userId: targetUser.id, isActive: true },
          data: { isActive: false },
        });
      }

      return updated;
    });

    return NextResponse.json({
      message: `User status changed to ${newStatus}`,
      user: result,
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    return NextResponse.json(
      { error: "Failed to toggle user status" },
      { status: 500 }
    );
  }
}
