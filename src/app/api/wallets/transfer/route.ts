import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { transferDemoWallet } from "@/lib/demo-data";
import { LedgerEntryType, Prisma, UserRole } from "@prisma/client";
import { z } from "zod";

const transferSchema = z.object({
  recipientUserId: z.string().min(1, "Recipient ID is required"),
  amount: z.union([z.number(), z.string().transform((v) => parseFloat(v))]),
  remarks: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const senderUserId = request.headers.get("x-user-id") || "demo-user-dist-1";
    const body = await request.json().catch(() => ({}));
    const parsed = transferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { recipientUserId, remarks } = parsed.data;
    const amount = Number(parsed.data.amount);

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Transfer amount must be greater than zero" },
        { status: 400 }
      );
    }

    try {
      // Database transaction
      const result = await prisma.$transaction(async (tx) => {
        const senderWallet = await tx.walletAccount.findUnique({
          where: { userId: senderUserId },
        });

        if (!senderWallet) {
          throw new Error("Sender wallet not found");
        }

        const senderBalance = Number(senderWallet.balance);
        const senderReserved = Number(senderWallet.reservedBalance);
        if (senderBalance - senderReserved < amount) {
          throw new Error("Insufficient available wallet balance");
        }

        const recipientWallet = await tx.walletAccount.findFirst({
          where: {
            OR: [
              { userId: recipientUserId },
              { id: recipientUserId },
              { user: { userId: recipientUserId } },
            ],
          },
          include: { user: true },
        });

        if (!recipientWallet) {
          throw new Error("Recipient wallet not found");
        }

        const decimalAmount = new Prisma.Decimal(amount.toString());
        const amountPaise = BigInt(Math.round(amount * 100));

        // Debit sender
        const senderBalBefore = new Prisma.Decimal(senderWallet.balance.toString());
        const senderBalAfter = senderBalBefore.sub(decimalAmount);
        const senderRefId = generateId("TRF_OUT");

        await tx.walletAccount.update({
          where: { id: senderWallet.id },
          data: {
            balance: senderBalAfter,
            balancePaise: BigInt(Math.round(Number(senderBalAfter) * 100)),
            lastTxnAt: new Date(),
          },
        });

        await tx.ledgerEntry.create({
          data: {
            walletId: senderWallet.id,
            userId: senderUserId,
            referenceId: senderRefId,
            type: LedgerEntryType.DEBIT,
            amount: decimalAmount,
            amountPaise,
            balanceBefore: senderBalBefore,
            balanceBeforePaise: BigInt(Math.round(Number(senderBalBefore) * 100)),
            balanceAfter: senderBalAfter,
            balanceAfterPaise: BigInt(Math.round(Number(senderBalAfter) * 100)),
            description: remarks || `Float transfer to ${recipientWallet.user?.fullName || recipientUserId}`,
            category: "TRANSFER",
            actor: senderUserId,
          },
        });

        // Credit recipient
        const recipientBalBefore = new Prisma.Decimal(recipientWallet.balance.toString());
        const recipientBalAfter = recipientBalBefore.add(decimalAmount);
        const recipientRefId = generateId("TRF_IN");

        await tx.walletAccount.update({
          where: { id: recipientWallet.id },
          data: {
            balance: recipientBalAfter,
            balancePaise: BigInt(Math.round(Number(recipientBalAfter) * 100)),
            lastTxnAt: new Date(),
          },
        });

        await tx.ledgerEntry.create({
          data: {
            walletId: recipientWallet.id,
            userId: recipientWallet.userId,
            referenceId: recipientRefId,
            type: LedgerEntryType.CREDIT,
            amount: decimalAmount,
            amountPaise,
            balanceBefore: recipientBalBefore,
            balanceBeforePaise: BigInt(Math.round(Number(recipientBalBefore) * 100)),
            balanceAfter: recipientBalAfter,
            balanceAfterPaise: BigInt(Math.round(Number(recipientBalAfter) * 100)),
            description: remarks || `Float allocation received`,
            category: "TRANSFER",
            actor: senderUserId,
          },
        });

        return {
          referenceId: senderRefId,
          transferredAmount: amount,
          recipientName: recipientWallet.user?.fullName,
        };
      });

      return NextResponse.json({
        success: true,
        message: "Wallet transfer completed successfully",
        transfer: result,
      });
    } catch (dbErr: any) {
      console.warn("Prisma offline in POST /api/wallets/transfer, using demo transfer:", dbErr?.message);
      const demoResult = transferDemoWallet(
        senderUserId,
        recipientUserId,
        amount,
        remarks
      );
      return NextResponse.json({
        success: true,
        message: "Demo wallet transfer completed successfully",
        transfer: demoResult,
      });
    }
  } catch (error: any) {
    console.error("POST /api/wallets/transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Transfer failed" },
      { status: 500 }
    );
  }
}
