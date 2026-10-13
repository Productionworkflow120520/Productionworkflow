import { NextRequest, NextResponse } from "next/server";
import { way2ApiService } from "@/services/way2api.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceType,
      identifier,
      operator,
      operatorName,
      circle,
      amount,
      planDescription,
      idempotencyKey,
      customerName,
    } = body;

    if (!serviceType || !identifier || !operator || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required recharge fields: serviceType, identifier, operator, amount" },
        { status: 400 }
      );
    }

    const tx = await way2ApiService.submitRecharge({
      serviceType,
      identifier,
      operator,
      operatorName,
      circle,
      amount: Number(amount),
      planDescription: planDescription || `Recharge ₹${amount}`,
      idempotencyKey,
      customerName,
    });

    return NextResponse.json({
      success: true,
      message: "Recharge submitted successfully to provider switch",
      data: tx,
    });
  } catch (err: any) {
    console.error("Recharge submission error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to submit recharge transaction" },
      { status: 400 }
    );
  }
}
