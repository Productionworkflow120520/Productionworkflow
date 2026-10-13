import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { KycStatus, UserStatus } from "@prisma/client";
import { updateDemoUser } from "@/lib/demo-data";
import { z } from "zod";

const kycStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUBMITTED", "UNDER_REVIEW", "NOT_SUBMITTED"]),
  reason: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const parseResult = kycStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid KYC status. Must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const { status, reason } = parseResult.data;

    try {
      const updateData: any = {
        kycStatus: status as KycStatus,
      };
      if (status === "APPROVED") {
        updateData.status = "ACTIVE" as UserStatus;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          userId: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          kycStatus: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `KYC verification status successfully updated to ${status}`,
        user: updatedUser,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in PATCH /api/kyc/[id]/status, updating demo store:", dbErr?.message);
      const updates: any = {
        kycStatus: status,
      };
      if (status === "APPROVED") {
        updates.status = "ACTIVE";
      }

      const demoUser = updateDemoUser(id, updates);

      return NextResponse.json({
        success: true,
        message: `KYC status updated to ${status} in demo mode`,
        user: demoUser || { id, kycStatus: status, status: updates.status || "PENDING_APPROVAL" },
      });
    }
  } catch (error: any) {
    console.error("KYC status update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update KYC status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return PATCH(request, { params });
}
