import { NextRequest, NextResponse } from "next/server";
import { getWalletLedger } from "@/services/wallet.service";
import { getDemoLedgerEntries } from "@/lib/demo-data";
import { UserRole, LedgerEntryType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category") || undefined;
    const type = searchParams.get("type") as LedgerEntryType | undefined;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const requestedUserId = searchParams.get("userId") || undefined;

    // Only MASTER_ADMIN or ADMIN can see other users' ledger entries
    const targetUserId =
      (userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN) && requestedUserId
        ? requestedUserId
        : userId;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    try {
      const data = await getWalletLedger(targetUserId, {
        page,
        limit,
        category,
        type,
        startDate,
        endDate,
      });

      return NextResponse.json({ success: true, ...data });
    } catch (dbErr: any) {
      console.warn("Prisma offline in GET /api/wallets/ledger, returning demo ledger:", dbErr?.message);
      const demoData = getDemoLedgerEntries(targetUserId);
      return NextResponse.json({ success: true, ...demoData });
    }
  } catch (error: any) {
    console.error("GET /api/wallets/ledger error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch ledger entries" },
      { status: 500 }
    );
  }
}
