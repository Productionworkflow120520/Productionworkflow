import { NextRequest, NextResponse } from "next/server";
import { brandingService } from "@/services/branding.service";
import { getCurrentUser } from "@/lib/auth.server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin user
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
        { error: "Unauthorized: Please log in to upload branding assets." },
        { status: 401 }
      );
    }

    // 2. Strict Role Enforcement: Only Super Admin and Admin
    const roleUpper = userRole.toUpperCase();
    if (roleUpper !== "SUPER_ADMIN" && roleUpper !== "MASTER_ADMIN" && roleUpper !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrator and authorized Administrators can upload branding assets." },
        { status: 403 }
      );
    }

    // 3. Extract form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryRaw = (formData.get("category") as string) || "web_logo";

    if (!file) {
      return NextResponse.json(
        { error: "No file was provided in upload request." },
        { status: 400 }
      );
    }

    const validCategories = ["web_logo", "mobile_logo", "favicon"];
    const category = validCategories.includes(categoryRaw)
      ? (categoryRaw as "web_logo" | "mobile_logo" | "favicon")
      : "web_logo";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Browser Client";

    // 4. Save and validate via BrandingService
    const uploadResult = await brandingService.saveUploadedLogo(
      buffer,
      file.name,
      file.type,
      category,
      {
        id: userId,
        email: userEmail || "admin@rechargepro.in",
        role: userRole,
      },
      { ipAddress, userAgent }
    );

    // 5. Automatically link asset to current branding config
    const updateField =
      category === "favicon"
        ? "faviconUrl"
        : category === "mobile_logo"
          ? "mobileLogoUrl"
          : "logoUrl";

    const updatedConfig = brandingService.updateBranding(
      {
        id: userId,
        email: userEmail || "admin@rechargepro.in",
        role: userRole,
      },
      { [updateField]: uploadResult.url },
      { ipAddress, userAgent }
    );

    return NextResponse.json({
      success: true,
      message: `${category.replace("_", " ").toUpperCase()} uploaded and applied successfully!`,
      url: uploadResult.url,
      filename: uploadResult.filename,
      data: updatedConfig.config,
    });
  } catch (error: any) {
    console.error("Error in branding upload:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload branding image" },
      { status: 400 }
    );
  }
}
