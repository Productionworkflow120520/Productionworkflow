import { NextRequest, NextResponse } from "next/server";
import { brandingService } from "@/services/branding.service";
import { getCurrentUser } from "@/lib/auth.server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    let userId = request.headers.get("x-user-id");
    let userRole = request.headers.get("x-user-role");

    if (!userId || !userRole) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const payload = await verifyToken(authHeader.substring(7));
        if (payload) {
          userId = payload.userId;
          userRole = payload.role;
        }
      }
    }

    if (!userId || !userRole) {
      const serverUser = await getCurrentUser();
      if (serverUser) {
        userId = serverUser.userId;
        userRole = serverUser.role;
      }
    }

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to view branding audit history." },
        { status: 401 }
      );
    }

    const roleUpper = userRole.toUpperCase();
    if (roleUpper !== "SUPER_ADMIN" && roleUpper !== "MASTER_ADMIN" && roleUpper !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view branding change history." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const history = brandingService.getAuditHistory(limit);

    return NextResponse.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: any) {
    console.error("Error fetching branding audit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch branding audit history" },
      { status: 500 }
    );
  }
}
