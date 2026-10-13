import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { referVerificationToOperator } from "@/services/verification.service";

const referSchema = z.object({
  service: z.enum(["DTH", "MOBILE"]),
  identifier: z.string().min(5),
  operator: z.string(),
  caseReference: z.string().optional(),
  customerName: z.string().optional(),
  providerReference: z.string().optional(),
  reason: z.string().min(3, "Reason for referral is required"),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const callerId = request.headers.get("x-user-id") || undefined;
    const body = await request.json();
    const parsed = referSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const createdCase = await referVerificationToOperator({
      service: parsed.data.service,
      identifier: parsed.data.identifier,
      operator: parsed.data.operator,
      caseReference: parsed.data.caseReference,
      customerName: parsed.data.customerName,
      providerReference: parsed.data.providerReference,
      reason: parsed.data.reason,
      priority: parsed.data.priority,
      callerId,
    });

    return NextResponse.json({
      success: true,
      message: "Case successfully routed to operator queue",
      case: createdCase,
    });
  } catch (err: any) {
    console.error("Refer to operator error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to refer case to operator" },
      { status: 500 }
    );
  }
}
