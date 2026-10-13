import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getSessionCookie, clearSessionCookie } from "@/lib/auth.server";

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("rechargepro_session")?.value ||
      request.cookies.get("paymatrix_session")?.value ||
      (await getSessionCookie());

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (token) {
      const payload = await verifyToken(token);

      if (payload) {
        try {
          // Deactivate UserSession in DB if available
          await prisma.userSession.updateMany({
            where: {
              OR: [
                { id: payload.sessionId },
                { token: token },
              ],
              isActive: true,
            },
            data: {
              isActive: false,
            },
          });

          // Record logout in audit log
          await prisma.auditLog.create({
            data: {
              userId: payload.userId,
              action: "LOGOUT",
              entity: "UserSession",
              entityId: payload.sessionId,
              ipAddress,
              userAgent,
              metadata: {
                username: payload.username,
                role: payload.role,
              },
            },
          });
        } catch (dbErr) {
          console.warn("DB offline during logout, continuing cookie clearance:", (dbErr as any)?.message);
        }
      }
    }

    // Clear session cookie via helper
    try {
      await clearSessionCookie();
    } catch (_) {}

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Explicitly expire cookies on response
    response.cookies.set("rechargepro_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.delete("rechargepro_session");
    response.cookies.set("paymatrix_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.delete("paymatrix_session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json(
      { message: "Logged out" },
      { status: 200 }
    );
    response.cookies.set("rechargepro_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.delete("rechargepro_session");
    response.cookies.set("paymatrix_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.delete("paymatrix_session");
    return response;
  }
}
