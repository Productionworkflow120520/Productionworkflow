import { NextRequest, NextResponse } from "next/server";
import { executeDmtTransfer } from "@/services/dmt.service";
import { z } from "zod";

const transferSchema = z.object({
  senderMobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit remitter mobile is required"),
  beneficiaryId: z.string().min(1, "Beneficiary ID is required"),
  amount: z.number().min(100, "Minimum transfer amount is ₹100").max(25000, "Maximum per-transaction transfer is ₹25,000"),
  transferMode: z.enum(["IMPS", "NEFT"]).default("IMPS"),
  remarks: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = transferSchema.parse(body);

    const result = await executeDmtTransfer({
      retailerUserId: userId,
      senderMobile: validated.senderMobile,
      beneficiaryId: validated.beneficiaryId,
      amountInr: validated.amount,
      transferMode: validated.transferMode,
      remarks: validated.remarks,
      idempotencyKey: validated.idempotencyKey,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DMT money transfer error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Transfer processing failed" },
      { status: 400 }
    );
  }
}
