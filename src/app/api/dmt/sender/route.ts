import { NextRequest, NextResponse } from "next/server";
import { findSender, registerSender } from "@/services/dmt.service";
import { z } from "zod";

const registerSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "A valid 10-digit Indian mobile number is required." },
        { status: 400 }
      );
    }

    const result = await findSender(mobile);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DMT sender query error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query remitter" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const result = await registerSender({
      ...validated,
      registeredByUserId: userId || undefined,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("DMT sender registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to register remitter" },
      { status: 400 }
    );
  }
}
