import { NextRequest, NextResponse } from "next/server";
import { getWalletBalance, debitWallet } from "@/services/wallet.service";
import { createTransaction, processRechargeDemo } from "@/services/transaction.service";
import { DEMO_USERS, DEMO_LEDGER } from "@/lib/demo-data";
import { generateId } from "@/lib/utils";
import { UserRole, TransactionType } from "@prisma/client";
import { z } from "zod";

const bbpsPaySchema = z.object({
  category: z.string().optional().default("ELECTRICITY"),
  billerId: z.string().min(2, "Biller ID / operator is required"),
  consumerNumber: z.string().min(3, "Consumer account/connection number is required"),
  amount: z.number().positive("Bill payment amount must be greater than zero"),
  billDetails: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-ret-1";
    const userRole = (request.headers.get("x-user-role") as UserRole | null) || UserRole.RETAILER;

    // CRITICAL REQUIREMENT: Super Admin and Admin MUST NOT have BBPS transaction access!
    if (userRole === "SUPER_ADMIN" || userRole === "MASTER_ADMIN" || userRole === "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Super Admin and Admin are strictly prohibited from executing BBPS Bill Payments. Transactions are reserved for operational tiers.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = bbpsPaySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { category, billerId, consumerNumber, amount, billDetails } = parsed.data;

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
        `BBPS Payment for ${billerId} - ${consumerNumber} (${category})`,
        "BBPS",
        undefined,
        userId
      );

      // 3. Create transaction with INITIATED status
      const transaction = await createTransaction({
        userId,
        type: TransactionType.BBPS_PAYMENT,
        amount,
        serviceNumber: consumerNumber,
        operator: billerId,
        planDetails: billDetails,
      });

      // 4. In demo mode: simulate payment processing
      const result = await processRechargeDemo(transaction.txnId);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        transaction: result.transaction,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in POST /api/bbps/pay, processing in demo mode:", dbErr?.message);
      
      const txnId = generateId("TXN");
      const providerRef = `BBPS-${Date.now().toString().slice(-8)}`;
      const commission = parseFloat((amount * 0.005).toFixed(2)); // Flat or 0.5% for BBPS

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
        description: `BBPS Payment for ${billerId} - ${consumerNumber} (${category})`,
        category: "BBPS",
        actor: userId,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "BBPS bill payment processed successfully (Demo Mode)",
        transaction: {
          txnId,
          type: "BBPS_PAYMENT",
          status: "SUCCESS",
          amount,
          commission,
          serviceNumber: consumerNumber,
          operator: billerId,
          providerRefId: providerRef,
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error("POST /api/bbps/pay error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process BBPS payment" },
      { status: 500 }
    );
  }
}
