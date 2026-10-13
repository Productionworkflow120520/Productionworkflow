import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const history = way2ApiService.getRechargeHistory(limit);
    return NextResponse.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err: any) {
    console.error("Recharge history error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recharge history" },
      { status: 500 }
    );
  }
}
