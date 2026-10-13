import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, createToken, JWTPayload } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth.server";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { identifier, password, rememberMe } = parseResult.data;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // ─── Rate Limiting Check ─────────────────────────────────────
    // Check failed login attempts in the past 15 minutes for this IP or identifier
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const failedAttemptsCount = await prisma.auditLog.count({
        where: {
          action: "LOGIN_FAILED",
          createdAt: { gte: fifteenMinutesAgo },
          OR: [
            { ipAddress },
            {
              metadata: {
                path: ["identifier"],
                equals: identifier.toLowerCase(),
              },
            },
          ],
        },
      });

      if (failedAttemptsCount >= 5) {
        return NextResponse.json(
          {
            error:
              "Too many failed login attempts. Please try again after 15 minutes.",
          },
          { status: 429 }
        );
      }
    } catch (_) {
      // Continue if auditLog table is unreachable
    }

    // ─── Find User in Database or Fallback to Demo Data ──────────
    let user: any = null;
    let isDbOnline = true;

    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier.toLowerCase() },
            { username: identifier },
          ],
        },
        include: {
          walletAccount: true,
        },
      });
    } catch (dbError) {
      console.warn("Database connection unavailable, falling back to Demo Store:", (dbError as any)?.message);
      isDbOnline = false;
    }

    // If DB is offline or user not found, check Demo Users
    if (!user) {
      const { findDemoUser } = await import("@/lib/demo-data");
      const demoMatch = findDemoUser(identifier);

      if (demoMatch && demoMatch.pass === password) {
        const demoUser = demoMatch.user;
        const jwtPayload: JWTPayload = {
          userId: demoUser.id,
          role: demoUser.role,
          email: demoUser.email,
          username: demoUser.username,
          fullName: demoUser.fullName,
          sessionId: `demo-session-${Date.now()}`,
        };

        const token = await createToken(jwtPayload);
        await setSessionCookie(token);

        const response = NextResponse.json(
          {
            message: "Login successful (Demo Mode)",
            user: demoUser,
          },
          { status: 200 }
        );

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          path: "/",
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        };
        response.cookies.set("rechargepro_session", token, cookieOptions);
        response.cookies.set("paymatrix_session", token, cookieOptions);

        return response;
      }

      if (!isDbOnline) {
        return NextResponse.json(
          {
            error:
              "Database connection offline and demo credentials not matched. Use: admin@rechargepro.in / Admin@123456",
          },
          { status: 401 }
        );
      }

      // Record failed attempt in audit log if DB is online
      try {
        await prisma.auditLog.create({
          data: {
            action: "LOGIN_FAILED",
            entity: "User",
            ipAddress,
            userAgent,
            metadata: {
              reason: "User not found",
              identifier: identifier.toLowerCase(),
            },
          },
        });
      } catch (_) {}

      return NextResponse.json(
        { error: "Invalid credentials. Please verify and try again." },
        { status: 401 }
      );
    }

    // ─── Verify Password ────────────────────────────────────────
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          entity: "User",
          entityId: user.id,
          ipAddress,
          userAgent,
          metadata: {
            reason: "Incorrect password",
            identifier: identifier.toLowerCase(),
          },
        },
      });

      return NextResponse.json(
        { error: "Invalid credentials. Please verify and try again." },
        { status: 401 }
      );
    }

    // ─── Status Checks ──────────────────────────────────────────
    if (user.status === "SUSPENDED") {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_BLOCKED",
          entity: "User",
          entityId: user.id,
          ipAddress,
          userAgent,
          metadata: { reason: "Account suspended" },
        },
      });

      return NextResponse.json(
        {
          error:
            "Your account has been suspended. Please contact Recharge Pro Support.",
        },
        { status: 403 }
      );
    }

    if (user.status === "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          error:
            "Your account is pending administrative approval. You will receive access once approved.",
        },
        { status: 403 }
      );
    }

    if (user.status === "REJECTED") {
      return NextResponse.json(
        {
          error:
            "Your account registration was not approved. Please reach out to support.",
        },
        { status: 403 }
      );
    }

    // ─── Create Session & Token ─────────────────────────────────
    const sessionExpiry = new Date(
      Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    );

    // Initial placeholder token to create session record
    const dummyToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const userSession = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: dummyToken,
        ipAddress,
        userAgent,
        isActive: true,
        expiresAt: sessionExpiry,
      },
    });

    const jwtPayload: JWTPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      sessionId: userSession.id,
    };

    const token = await createToken(jwtPayload);

    // Update session with the real JWT token
    await prisma.userSession.update({
      where: { id: userSession.id },
      data: { token },
    });

    // Update user login metadata
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        loginCount: { increment: 1 },
      },
    });

    // Record login in audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entity: "UserSession",
        entityId: userSession.id,
        ipAddress,
        userAgent,
        metadata: {
          role: user.role,
          rememberMe,
        },
      },
    });

    // Set cookie
    await setSessionCookie(token);

    // Return safe user info
    const safeUser = {
      id: user.id,
      userId: user.userId,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      businessName: user.businessName,
      walletBalance: user.walletAccount
        ? Number(user.walletAccount.balance)
        : 0,
    };

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: safeUser,
      },
      { status: 200 }
    );

    // Also attach cookies explicitly to response object for maximum compatibility
    const dbCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    };
    response.cookies.set("rechargepro_session", token, dbCookieOptions);
    response.cookies.set("paymatrix_session", token, dbCookieOptions);

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
