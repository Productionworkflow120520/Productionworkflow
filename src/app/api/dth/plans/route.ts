import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operator } = body;

    if (!operator || typeof operator !== "string") {
      return NextResponse.json(
        { success: false, error: "DTH operator is required (e.g. TATA_PLAY, AIRTEL_DTH, DISH_TV)" },
        { status: 400 }
      );
    }

    const result = await way2ApiService.getDthPlans(operator);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("DTH plans error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch DTH plans" },
      { status: 400 }
    );
  }
}
