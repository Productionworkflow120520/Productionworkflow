import { NextRequest, NextResponse } from "next/server";
import { rejectWalletRequest } from "@/services/wallet.service";
import { updateDemoWalletRequest } from "@/lib/demo-data";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required (min 3 characters)"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-master-admin";
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole !== UserRole.MASTER_ADMIN && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators can reject wallet requests" },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = rejectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    try {
      const result = await rejectWalletRequest(id, userId, parsed.data.reason);

      return NextResponse.json({
        success: true,
        message: "Wallet request rejected successfully",
        request: result,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in reject route, updating demo data:", dbErr?.message);
      const demoResult = updateDemoWalletRequest(id, "REJECTED", parsed.data.reason, userId);
      return NextResponse.json({
        success: true,
        message: "Wallet request rejected in demo mode",
        request: demoResult,
      });
    }
  } catch (error: any) {
    console.error(`POST /api/wallets/requests/${params.id}/reject error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to reject wallet request" },
      { status: 400 }
    );
  }
}
