import { NextRequest, NextResponse } from "next/server";
import { addBeneficiary, findSender } from "@/services/dmt.service";
import { z } from "zod";

const beneficiarySchema = z.object({
  senderMobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit remitter mobile is required"),
  accountNumber: z.string().min(8, "Account number must be at least 8 digits").max(22, "Account number is too long"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Must be a valid 11-character Indian IFSC code (e.g. SBIN0001234)"),
  bankName: z.string().min(2, "Bank name is required"),
  recipientName: z.string().min(2, "Beneficiary name is required"),
  relation: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const senderMobile = searchParams.get("senderMobile");

    if (!senderMobile || !/^[6-9]\d{9}$/.test(senderMobile)) {
      return NextResponse.json(
        { error: "A valid 10-digit sender mobile number is required" },
        { status: 400 }
      );
    }

    const senderResult = await findSender(senderMobile);
    const beneficiaries = senderResult.found && senderResult.sender ? senderResult.sender.beneficiaries : [];

    return NextResponse.json({
      success: true,
      beneficiaries,
    });
  } catch (error: any) {
    console.error("GET /api/dmt/beneficiaries error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch beneficiaries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = beneficiarySchema.parse(body);

    const beneficiary = await addBeneficiary(validated);

    return NextResponse.json({
      success: true,
      message: "Beneficiary successfully registered.",
      beneficiary,
    });
  } catch (error: any) {
    console.error("DMT add beneficiary error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to add beneficiary" },
      { status: 400 }
    );
  }
}
