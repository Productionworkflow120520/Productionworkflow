import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyDthAccount } from "@/services/verification.service";

const verifyDthSchema = z.object({
  operator: z.string().min(2, "DTH Operator code is required"),
  subscriberId: z.string().min(5, "Subscriber / VC Number must be at least 5 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const callerId = request.headers.get("x-user-id") || undefined;
    const body = await request.json();
    const parsed = verifyDthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await verifyDthAccount({
      operator: parsed.data.operator,
      subscriberId: parsed.data.subscriberId,
      callerId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("DTH verification error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal DTH verification gateway error" },
      { status: 500 }
    );
  }
}
