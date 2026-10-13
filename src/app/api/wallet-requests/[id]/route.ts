import { NextRequest, NextResponse } from "next/server";
import { approveWalletRequest, rejectWalletRequest } from "@/services/wallet.service";
import { updateDemoWalletRequest } from "@/lib/demo-data";
import { UserRole } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-master-admin";
    const userRole = request.headers.get("x-user-role") as UserRole | null;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { status, reason } = body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    try {
      let result;
      if (status === "APPROVED") {
        result = await approveWalletRequest(id, userId);
      } else {
        result = await rejectWalletRequest(id, userId, reason || "Rejected by administrator");
      }
      return NextResponse.json({
        success: true,
        message: `Wallet request ${status.toLowerCase()} successfully`,
        request: result,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in PATCH /api/wallet-requests/[id], updating demo store:", dbErr?.message);
      const updatedReq = updateDemoWalletRequest(
        id,
        status,
        reason || "Administrator decision",
        userId
      );
      return NextResponse.json({
        success: true,
        message: `Wallet request ${status.toLowerCase()} in demo mode`,
        request: updatedReq,
      });
    }
  } catch (error: any) {
    console.error("PATCH /api/wallet-requests/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process wallet request" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PATCH(request, { params });
}
