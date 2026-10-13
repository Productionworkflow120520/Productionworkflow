import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriberId, operatorHint } = body;

    if (!subscriberId || typeof subscriberId !== "string") {
      return NextResponse.json(
        { success: false, error: "DTH Subscriber ID is required" },
        { status: 400 }
      );
    }

    const result = await way2ApiService.lookupDth(subscriberId, operatorHint);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("DTH lookup error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to lookup DTH operator" },
      { status: 400 }
    );
  }
}
