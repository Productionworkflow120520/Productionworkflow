import { NextRequest, NextResponse } from "next/server";
import { getWalletBalance, debitWallet } from "@/services/wallet.service";
import { createTransaction, processRechargeDemo } from "@/services/transaction.service";
import { DEMO_USERS, DEMO_LEDGER } from "@/lib/demo-data";
import { generateId } from "@/lib/utils";
import { UserRole, TransactionType } from "@prisma/client";
import { z } from "zod";

const dthRechargeSchema = z.object({
  customerId: z.string().optional(),
  subscriberId: z.string().optional(),
  operator: z.string().min(2, "DTH operator is required"),
  amount: z.number().positive("Recharge amount must be greater than zero"),
  planDetails: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-ret-1";
    const userRole = (request.headers.get("x-user-role") as UserRole | null) || UserRole.RETAILER;

    // CRITICAL REQUIREMENT: Super Admin and Admin MUST NOT have DTH Recharge access!
    if (userRole === "SUPER_ADMIN" || userRole === "MASTER_ADMIN" || userRole === "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Super Admin and Admin are strictly prohibited from executing DTH Recharge transactions. Transactions are reserved for operational tiers.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = dthRechargeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const customerId = parsed.data.customerId || parsed.data.subscriberId;
    if (!customerId || customerId.length < 5) {
      return NextResponse.json(
        { error: "Valid DTH customer ID / subscriber ID is required" },
        { status: 400 }
      );
    }

    const { operator, amount, planDetails } = parsed.data;

    try {
      // 1. Check wallet balance
      const wallet = await getWalletBalance(userId);
      if (wallet.availableBalance < amount) {
        return NextResponse.json(
          {
            error: "Insufficient wallet balance",
            balance: wallet.availableBalance,
            required: amount,
          },
          { status: 400 }
        );
      }

      // 2. Debit wallet atomically
      await debitWallet(
        userId,
        amount,
        `DTH recharge for ${customerId} (${operator})`,
        "RECHARGE",
        undefined,
        userId
      );

      // 3. Create transaction with INITIATED status
      const transaction = await createTransaction({
        userId,
        type: TransactionType.DTH_RECHARGE,
        amount,
        serviceNumber: customerId,
        operator,
        planDetails,
      });

      // 4. In demo mode: simulate recharge processing
      const result = await processRechargeDemo(transaction.txnId);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        transaction: result.transaction,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in POST /api/recharge/dth, processing in demo mode:", dbErr?.message);
      
      const txnId = generateId("TXN");
      const providerRef = `DTH-${Date.now().toString().slice(-8)}`;
      const commission = parseFloat((amount * 0.02).toFixed(2));

      // Update demo retailer balance
      const retUser = DEMO_USERS["retailer1@example.com"].user;
      retUser.walletBalance = retUser.walletBalance - amount + commission;

      // Add to demo ledger
      DEMO_LEDGER.unshift({
        id: `led-${Date.now()}`,
        referenceId: generateId("LED"),
        userId,
        type: "DEBIT",
        amount,
        balanceBefore: retUser.walletBalance + amount - commission,
        balanceAfter: retUser.walletBalance - commission,
        description: `DTH recharge for ${customerId} (${operator})`,
        category: "RECHARGE",
        actor: userId,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "DTH recharge processed successfully (Demo Mode)",
        transaction: {
          txnId,
          type: "DTH_RECHARGE",
          status: "SUCCESS",
          amount,
          commission,
          serviceNumber: customerId,
          operator,
          providerRefId: providerRef,
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error("POST /api/recharge/dth error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process DTH recharge" },
      { status: 500 }
    );
  }
}
