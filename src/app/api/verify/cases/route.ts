import { NextRequest, NextResponse } from "next/server";
import { getOperatorCases } from "@/services/verification.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const service = searchParams.get("service") || "ALL";
    const search = searchParams.get("search") || "";

    const cases = await getOperatorCases({
      status,
      service,
      search,
    });

    return NextResponse.json({
      success: true,
      cases,
      total: cases.length,
    });
  } catch (err: any) {
    console.error("Fetch cases error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load verification cases" },
      { status: 500 }
    );
  }
}
