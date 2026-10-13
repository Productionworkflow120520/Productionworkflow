import { NextRequest, NextResponse } from "next/server";
import { approveWalletRequest } from "@/services/wallet.service";
import { updateDemoWalletRequest } from "@/lib/demo-data";
import { UserRole } from "@prisma/client";

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

    // Only MASTER_ADMIN and ADMIN are authorized to approve wallet requests
    if (userRole !== UserRole.MASTER_ADMIN && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators can approve wallet requests" },
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

    try {
      const result = await approveWalletRequest(id, userId);

      return NextResponse.json({
        success: true,
        message: "Wallet request approved and funds credited successfully",
        request: result,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in approve route, updating demo data:", dbErr?.message);
      const demoResult = updateDemoWalletRequest(id, "APPROVED", undefined, userId);
      return NextResponse.json({
        success: true,
        message: "Wallet request approved in demo mode",
        request: demoResult,
      });
    }
  } catch (error: any) {
    console.error(`POST /api/wallets/requests/${params.id}/approve error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to approve wallet request" },
      { status: 400 }
    );
  }
}
