import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyMobileRecharge } from "@/services/verification.service";

const verifyMobileSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile number is required"),
  operator: z.string().optional(),
  transactionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const callerId = request.headers.get("x-user-id") || undefined;
    const body = await request.json();
    const parsed = verifyMobileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await verifyMobileRecharge({
      mobile: parsed.data.mobile,
      operator: parsed.data.operator,
      transactionId: parsed.data.transactionId,
      callerId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Mobile verification error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal verification gateway error" },
      { status: 500 }
    );
  }
}
