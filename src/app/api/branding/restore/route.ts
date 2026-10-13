import { NextRequest, NextResponse } from "next/server";
import { brandingService } from "@/services/branding.service";
import { getCurrentUser } from "@/lib/auth.server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    let userId = request.headers.get("x-user-id");
    let userRole = request.headers.get("x-user-role");
    let userEmail = request.headers.get("x-user-email");

    if (!userId || !userRole) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const payload = await verifyToken(authHeader.substring(7));
        if (payload) {
          userId = payload.userId;
          userRole = payload.role;
          userEmail = payload.email;
        }
      }
    }

    if (!userId || !userRole) {
      const serverUser = await getCurrentUser();
      if (serverUser) {
        userId = serverUser.userId;
        userRole = serverUser.role;
        userEmail = serverUser.email;
      }
    }

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to restore branding." },
        { status: 401 }
      );
    }

    // Role check: Only Super Admin can restore defaults
    const roleUpper = userRole.toUpperCase();
    if (roleUpper !== "SUPER_ADMIN" && roleUpper !== "MASTER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrator can restore system default branding." },
        { status: 403 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Browser Client";

    const result = brandingService.restoreDefaults(
      {
        id: userId,
        email: userEmail || "admin@rechargepro.in",
        role: userRole,
      },
      { ipAddress, userAgent }
    );

    return NextResponse.json({
      success: true,
      message: "Default Recharge Pro branding restored successfully.",
      data: result.config,
    });
  } catch (error: any) {
    console.error("Error restoring branding defaults:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to restore default branding" },
      { status: 400 }
    );
  }
}
