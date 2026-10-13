import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { updateDemoUser } from "@/lib/demo-data";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_APPROVAL", "REJECTED"]),
  reason: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const callerId = request.headers.get("x-user-id");
    const callerRole = request.headers.get("x-user-role") as UserRole | null;
    const { id } = params;

    const body = await request.json().catch(() => ({}));
    const parseResult = statusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid status value. Must be ACTIVE or SUSPENDED" },
        { status: 400 }
      );
    }

    const { status, reason } = parseResult.data;

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          status: status as UserStatus,
        },
        select: {
          id: true,
          userId: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `User status successfully updated to ${status}`,
        user: updatedUser,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in PATCH /api/users/[id]/status, updating demo store:", dbErr?.message);
      const demoUser = updateDemoUser(id, {
        status: status as "ACTIVE" | "SUSPENDED",
      });

      return NextResponse.json({
        success: true,
        message: `User status updated to ${status} in demo mode`,
        user: demoUser || { id, status },
      });
    }
  } catch (error: any) {
    console.error("User status update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update user status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return PATCH(request, { params });
}
