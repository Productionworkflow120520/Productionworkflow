import { NextRequest, NextResponse } from "next/server";
import { verifyBeneficiaryPennyDrop } from "@/services/dmt.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const beneficiaryId = params.id;
    if (!beneficiaryId) {
      return NextResponse.json({ error: "Beneficiary ID is required" }, { status: 400 });
    }

    const result = await verifyBeneficiaryPennyDrop(beneficiaryId, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DMT Penny-drop verification error:", error);
    return NextResponse.json(
      { error: error.message || "Penny-drop verification failed" },
      { status: 400 }
    );
  }
}
