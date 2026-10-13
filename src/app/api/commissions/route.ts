import { NextRequest, NextResponse } from "next/server";
import { getCommissionEntries, getCommissionStats } from "@/services/commission.service";
import { UserRole } from "@prisma/client";

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
    const status = searchParams.get("status") || undefined;
    const requestedUserId = searchParams.get("userId") || undefined;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const includeStats = searchParams.get("includeStats") === "true";

    const targetUserId =
      (userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN) && requestedUserId
        ? requestedUserId
        : userId;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const data = await getCommissionEntries(targetUserId, {
      page,
      limit,
      status,
      startDate,
      endDate,
    });

    let stats = null;
    if (includeStats) {
      stats = await getCommissionStats(targetUserId, userRole, startDate, endDate);
    }

    return NextResponse.json({
      success: true,
      ...data,
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/commissions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commission entries" },
      { status: 500 }
    );
  }
}
