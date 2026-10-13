import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriberId, operator } = body;

    if (!subscriberId || !operator) {
      return NextResponse.json(
        { success: false, error: "subscriberId and operator are required" },
        { status: 400 }
      );
    }

    const result = await way2ApiService.getDthCustomerDetails(subscriberId, operator);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("DTH details error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch DTH customer details" },
      { status: 400 }
    );
  }
}
