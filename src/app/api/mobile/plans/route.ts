import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operator, circle } = body;

    if (!operator || typeof operator !== "string") {
      return NextResponse.json(
        { success: false, error: "Operator code is required (e.g. JIO, AIRTEL, VI, BSNL)" },
        { status: 400 }
      );
    }

    const result = await way2ApiService.getMobilePlans(operator, circle || "DELHI");
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Mobile plans error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch mobile plans" },
      { status: 400 }
    );
  }
}
