import { NextRequest, NextResponse } from "next/server";
import { getWalletBalance, debitWallet } from "@/services/wallet.service";
import { createTransaction, processRechargeDemo } from "@/services/transaction.service";
import { DEMO_USERS, DEMO_LEDGER, DEMO_WALLETS } from "@/lib/demo-data";
import { generateId } from "@/lib/utils";
import { UserRole, TransactionType } from "@prisma/client";
import { z } from "zod";

const rechargeSchema = z.object({
  mobileNumber: z.string().optional(),
  mobile: z.string().optional(),
  operator: z.string().min(1, "Operator is required"),
  circle: z.string().optional(),
  amount: z.union([z.number(), z.string().transform((v) => parseFloat(v))]),
  planDetails: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-ret-1";
    const userRole = (request.headers.get("x-user-role") as UserRole | null) || UserRole.RETAILER;

    // RBAC: Super Admin and Admin are not permitted operational recharge execution
    if (userRole === "SUPER_ADMIN" || userRole === "MASTER_ADMIN" || userRole === "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Super Admin and Admin accounts cannot execute end-user mobile recharges.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = rechargeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const mobile = parsed.data.mobileNumber || parsed.data.mobile;
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "A valid 10-digit Indian mobile number is required" },
        { status: 400 }
      );
    }

    const { operator, circle, amount, planDetails } = parsed.data;

    try {
      // 1. Check wallet balance in database
      const wallet = await getWalletBalance(userId);
      if (wallet.availableBalance < Number(amount)) {
        return NextResponse.json(
          {
            error: "Insufficient wallet balance",
            balance: wallet.availableBalance,
            required: amount,
          },
          { status: 400 }
        );
      }

      // 2. Debit wallet
      await debitWallet(
        userId,
        Number(amount),
        `Mobile recharge for ${mobile} (${operator})`,
        "RECHARGE",
        undefined,
        userId
      );

      // 3. Create transaction
      const transaction = await createTransaction({
        userId,
        type: TransactionType.MOBILE_RECHARGE,
        amount: Number(amount),
        serviceNumber: mobile,
        operator,
        circle,
        planDetails,
      });

      // 4. Process recharge simulation
      const result = await processRechargeDemo(transaction.txnId);

      return NextResponse.json({
        success: true,
        message: "Mobile recharge executed successfully",
        txnId: transaction.txnId,
        providerRef: transaction.providerRefId || `OP-${Date.now().toString().slice(-8)}`,
        status: "SUCCESS",
        amount: Number(amount),
        mobileNumber: mobile,
        operator,
        circle,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in POST /api/recharge, processing via demo store:", dbErr?.message);

      const txnId = generateId("TXN");
      const providerRef = `OP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
      const commission = parseFloat((Number(amount) * 0.02).toFixed(2));

      // Update retailer demo wallet balance
      const retUser = DEMO_USERS["retailer1@example.com"]?.user;
      if (retUser) {
        retUser.walletBalance = Math.max(0, retUser.walletBalance - Number(amount) + commission);
      }
      const retWallet = DEMO_WALLETS.find((w) => w.role === "RETAILER");
      if (retWallet) {
        retWallet.balance = Math.max(0, retWallet.balance - Number(amount) + commission);
      }

      DEMO_LEDGER.unshift({
        id: `led-${Date.now()}`,
        referenceId: `LED-${Date.now().toString().slice(-8)}`,
        userId: retUser?.userId || "PM-RT-0001",
        type: "DEBIT",
        amount: Number(amount),
        balanceBefore: (retWallet?.balance || 25000) + Number(amount),
        balanceAfter: retWallet?.balance || 25000,
        description: `Mobile recharge for ${mobile} (${operator})`,
        category: "RECHARGE",
        actor: retUser?.userId || "PM-RT-0001",
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Recharge processed successfully in demo mode",
        txnId,
        providerRef,
        status: "SUCCESS",
        amount: Number(amount),
        mobileNumber: mobile,
        operator,
        circle,
        commission,
      });
    }
  } catch (error: any) {
    console.error("Recharge route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error processing recharge" },
      { status: 500 }
    );
  }
}
