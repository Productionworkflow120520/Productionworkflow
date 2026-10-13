import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/register", "/api/enquire", "/api/auth/login", "/api/auth/register", "/api/auth/logout"];

// Role-based path access
const rolePathMap: Record<string, string[]> = {
  SUPER_ADMIN: ["/super-admin", "/master-admin", "/verification", "/api"],
  MASTER_ADMIN: ["/super-admin", "/master-admin", "/verification", "/api"],
  ADMIN: ["/admin", "/verification", "/api"],
  SUPER_DISTRIBUTOR: ["/super-distributor", "/verification", "/api"],
  MASTER_DISTRIBUTOR: ["/master-distributor", "/verification", "/api"],
  DISTRIBUTOR: ["/distributor", "/verification", "/api"],
  RETAILER: ["/retailer", "/verification", "/api"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths & public branding lookup & recharge client queries
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname === "/api/enquire" ||
    (pathname === "/api/branding" && request.method === "GET") ||
    pathname.startsWith("/api/mobile/") ||
    pathname.startsWith("/api/dth/") ||
    pathname === "/api/recharge" ||
    pathname.startsWith("/api/recharge/")
  ) {
    return NextResponse.next();
  }


  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session token (from cookie or authorization header)
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
  const token =
    request.cookies.get("rechargepro_session")?.value ||
    request.cookies.get("paymatrix_session")?.value ||
    bearerToken;


  if (!token) {
    // Redirect to login for page requests
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Return 401 for API requests
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    // Clear invalid cookie
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid session" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("rechargepro_session");
    response.cookies.delete("paymatrix_session");
    return response;
  }

  // Check role-based path access
  const allowedPaths = rolePathMap[payload.role] || [];
  const hasAccess = allowedPaths.some((p) => pathname.startsWith(p));

  if (!hasAccess && !pathname.startsWith("/api/")) {
    // Redirect to appropriate dashboard
    const dashboardPath =
      payload.role === "SUPER_ADMIN" || payload.role === "MASTER_ADMIN"
        ? "/super-admin"
        : payload.role === "ADMIN"
          ? "/admin"
          : payload.role === "SUPER_DISTRIBUTOR"
            ? "/super-distributor"
            : payload.role === "MASTER_DISTRIBUTOR"
              ? "/master-distributor"
              : payload.role === "DISTRIBUTOR"
                ? "/distributor"
                : "/retailer";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-session-id", payload.sessionId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
