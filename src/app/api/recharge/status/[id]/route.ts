import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const tx = await way2ApiService.getTransactionStatus(id);
    return NextResponse.json({
      success: true,
      data: tx,
    });
  } catch (err: any) {
    console.error("Recharge status check error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to check transaction status" },
      { status: 404 }
    );
  }
}
