import { NextRequest, NextResponse } from "next/server";
import { getWalletRequests, createWalletRequest } from "@/services/wallet.service";
import { getDemoWalletRequests, createDemoWalletRequest } from "@/lib/demo-data";
import { UserRole, WalletRequestStatus, WalletRequestType } from "@prisma/client";
import { z } from "zod";

const createWalletRequestSchema = z.object({
  type: z.nativeEnum(WalletRequestType).default(WalletRequestType.TOPUP),
  amount: z.union([z.number(), z.string().transform((v) => parseFloat(v))]),
  paymentMethod: z.string().optional(),
  paymentRef: z.string().optional(),
  bankName: z.string().optional(),
  remarks: z.string().optional(),
});

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
    const status = searchParams.get("status") as WalletRequestStatus | undefined;
    const type = searchParams.get("type") as WalletRequestType | undefined;
    const requestedUserId = searchParams.get("userId") || undefined;

    // Normal users can only see their own requests
    const filterUserId =
      userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN
        ? requestedUserId
        : userId;

    try {
      const data = await getWalletRequests({
        userId: filterUserId,
        status,
        type,
        page,
        limit,
      });

      return NextResponse.json({ success: true, ...data });
    } catch (dbErr: any) {
      console.warn("Prisma offline in GET /api/wallets/requests, returning demo requests:", dbErr?.message);
      const demoData = getDemoWalletRequests({
        status: status as string,
        userId: filterUserId,
      });
      return NextResponse.json({ success: true, ...demoData });
    }
  } catch (error: any) {
    console.error("GET /api/wallets/requests error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-ret-1";
    const body = await request.json();
    const parsed = createWalletRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { type, amount, paymentMethod, paymentRef, bankName, remarks } = parsed.data;

    try {
      const walletRequest = await createWalletRequest(
        userId,
        type,
        Number(amount),
        paymentMethod,
        paymentRef,
        bankName,
        remarks
      );

      return NextResponse.json(
        { success: true, request: walletRequest },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Prisma offline in POST /api/wallets/requests, creating demo request:", dbErr?.message);
      const demoReq = createDemoWalletRequest({
        userId,
        type,
        amount: Number(amount),
        paymentMethod,
        paymentRef,
        bankName,
        remarks,
      });
      return NextResponse.json({ success: true, request: demoReq }, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST /api/wallets/requests error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create wallet request" },
      { status: 500 }
    );
  }
}
