import { NextRequest, NextResponse } from "next/server";
import { brandingService } from "@/services/branding.service";
import { getCurrentUser } from "@/lib/auth.server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const branding = brandingService.getBranding();
    return NextResponse.json(
      {
        success: true,
        data: branding,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=10, stale-while-revalidate=60",
          "ETag": `"${branding.version}-${branding.cacheBuster}"`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error retrieving branding config:", error);
    return NextResponse.json(
      { error: "Failed to retrieve branding settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 1. Resolve current user authentication
    let userId = request.headers.get("x-user-id");
    let userRole = request.headers.get("x-user-role");
    let userEmail = request.headers.get("x-user-email");

    if (!userId || !userRole) {
      // Check bearer or session cookie directly
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : (await getCurrentUser())?.sessionId;

      if (token) {
        const payload = await verifyToken(token);
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
        { error: "Unauthorized: Please log in to manage branding." },
        { status: 401 }
      );
    }

    // 2. Strict Role Enforcement: Only Super Admin and Admin
    const roleUpper = userRole.toUpperCase();
    if (roleUpper !== "SUPER_ADMIN" && roleUpper !== "MASTER_ADMIN" && roleUpper !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Only Super Administrator and authorized Administrators can modify branding settings.",
        },
        { status: 403 }
      );
    }

    // 3. Parse and sanitize payload
    const body = await request.json();
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Browser Client";

    const result = brandingService.updateBranding(
      {
        id: userId,
        email: userEmail || "admin@rechargepro.in",
        role: userRole,
      },
      body,
      { ipAddress, userAgent }
    );

    return NextResponse.json({
      success: true,
      message: `Branding settings updated successfully (${result.changesCount} fields modified).`,
      data: result.config,
    });
  } catch (error: any) {
    console.error("Error updating branding config:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update branding settings" },
      { status: 400 }
    );
  }
}
