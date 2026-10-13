import { NextRequest, NextResponse } from "next/server";
import { getTransactionById } from "@/services/transaction.service";
import { UserRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const transaction = await getTransactionById(id, userId, userRole);

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error(`GET /api/transactions/${params.id} error:`, error);
    const status = error.message?.includes("Unauthorized")
      ? 403
      : error.message?.includes("not found")
      ? 404
      : 500;

    return NextResponse.json(
      { error: error.message || "Failed to retrieve transaction" },
      { status }
    );
  }
}
