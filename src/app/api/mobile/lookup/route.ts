import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = body;

    if (!mobile || typeof mobile !== "string") {
      return NextResponse.json(
        { success: false, error: "10-digit mobile number is required" },
        { status: 400 }
      );
    }

    const result = await way2ApiService.lookupMobile(mobile);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Mobile lookup error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to lookup mobile operator" },
      { status: 400 }
    );
  }
}
