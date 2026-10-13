import { NextRequest, NextResponse } from "next/server";
import { verifySenderOtp } from "@/services/dmt.service";
import { z } from "zod";

const verifyOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  otp: z.string().min(4, "OTP is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, otp } = verifyOtpSchema.parse(body);

    const result = await verifySenderOtp(mobile, otp);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DMT verify OTP error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 400 }
    );
  }
}
