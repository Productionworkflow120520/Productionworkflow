import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getSessionCookie } from "@/lib/auth.server";

export async function GET(request: NextRequest) {
  try {
    let userId = request.headers.get("x-user-id");

    // Fallback if header not set by middleware
    if (!userId) {
      const token =
        request.cookies.get("rechargepro_session")?.value ||
        request.cookies.get("paymatrix_session")?.value ||
        (await getSessionCookie());
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          userId = payload.userId;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Session expired or missing." },
        { status: 401 }
      );
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          userId: true,
          username: true,
          email: true,
          mobile: true,
          fullName: true,
          role: true,
          status: true,
          kycStatus: true,
          businessName: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          panNumber: true,
          maxDailyLimit: true,
          maxPerTxnLimit: true,
          servicesAllowed: true,
          mfaEnabled: true,
          lastLoginAt: true,
          loginCount: true,
          createdAt: true,
          updatedAt: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              userId: true,
              fullName: true,
              businessName: true,
              role: true,
            },
          },
          walletAccount: {
            select: {
              id: true,
              balance: true,
              reservedBalance: true,
              currency: true,
              isActive: true,
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn("DB offline in /api/auth/me, using demo fallback:", (dbErr as any)?.message);
    }

    if (!user) {
      const { getDemoUserById } = await import("@/lib/demo-data");
      const demoUser = getDemoUserById(userId);
      if (demoUser) {
        return NextResponse.json(
          {
            user: {
              ...demoUser,
              maxDailyLimit: 100000,
              maxPerTxnLimit: 25000,
              wallet: {
                id: `demo-wallet-${demoUser.id}`,
                balance: demoUser.walletBalance,
                reservedBalance: demoUser.reservedBalance,
                currency: "INR",
                isActive: true,
              },
              walletBalance: demoUser.walletBalance,
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format Decimal amounts as numbers
    const responseData = {
      ...user,
      maxDailyLimit: Number(user.maxDailyLimit),
      maxPerTxnLimit: Number(user.maxPerTxnLimit),
      wallet: user.walletAccount
        ? {
            id: user.walletAccount.id,
            balance: Number(user.walletAccount.balance),
            reservedBalance: Number(user.walletAccount.reservedBalance),
            currency: user.walletAccount.currency,
            isActive: user.walletAccount.isActive,
          }
        : null,
      walletBalance: user.walletAccount
        ? Number(user.walletAccount.balance)
        : 0,
    };

    return NextResponse.json({ user: responseData }, { status: 200 });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
