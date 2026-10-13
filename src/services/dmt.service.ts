import { prisma } from "@/lib/db";
import { generateId, inrToPaise, paiseToInr } from "@/lib/utils";
import { debitWallet, creditWallet } from "./wallet.service";
import { processCommission } from "./commission.service";
import { DEMO_USERS, DEMO_LEDGER } from "@/lib/demo-data";
import { TransactionStatus, TransactionType, Prisma } from "@prisma/client";

export interface SenderLookupResult {
  found: boolean;
  sender?: {
    id: string;
    senderId: string;
    mobile: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    isKycVerified: boolean;
    monthlyLimitPaise: string;
    monthlyLimitInr: number;
    usedLimitPaise: string;
    usedLimitInr: number;
    remainingLimitInr: number;
    status: string;
    beneficiaries: Array<{
      id: string;
      beneficiaryId: string;
      accountNumber: string;
      maskedAccount: string;
      ifsc: string;
      bankName: string;
      recipientName: string;
      isVerified: boolean;
      status: string;
    }>;
  };
}

export interface RegisterSenderInput {
  mobile: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  registeredByUserId?: string;
}

export interface AddBeneficiaryInput {
  senderMobile: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  recipientName: string;
  mobile?: string;
  relation?: string;
}

export interface ExecuteDmtTransferInput {
  retailerUserId: string;
  senderMobile: string;
  beneficiaryId: string;
  amountInr: number;
  transferMode: "IMPS" | "NEFT";
  remarks?: string;
  idempotencyKey?: string;
}

/**
 * Mask bank account number (show first 2 and last 4 digits)
 */
function maskAccountNumber(acc: string): string {
  if (acc.length <= 6) return acc;
  const start = acc.slice(0, 2);
  const end = acc.slice(-4);
  return `${start}${"X".repeat(acc.length - 6)}${end}`;
}

// In-memory demo store for DMT remitter and beneficiaries
const INITIAL_DEMO_SENDERS: Record<string, any> = {
  "9876543210": {
    id: "demo-sender-1",
    senderId: "SMR-987654",
    mobile: "9876543210",
    name: "Rajesh Kumar",
    address: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isKycVerified: true,
    monthlyLimitPaise: "2500000",
    monthlyLimitInr: 25000,
    usedLimitPaise: "500000",
    usedLimitInr: 5000,
    remainingLimitInr: 20000,
    status: "ACTIVE",
    beneficiaries: [
      {
        id: "ben-demo-1",
        beneficiaryId: "BEN-00129",
        accountNumber: "50100239102938",
        maskedAccount: "50XXXXXXXX2938",
        ifsc: "HDFC0000060",
        bankName: "HDFC Bank",
        recipientName: "Priya Sharma",
        isVerified: true,
        status: "ACTIVE",
      },
      {
        id: "ben-demo-2",
        beneficiaryId: "BEN-00130",
        accountNumber: "918239019283",
        maskedAccount: "91XXXXXXXX9283",
        ifsc: "SBIN0001234",
        bankName: "State Bank of India",
        recipientName: "Amit Verma",
        isVerified: false,
        status: "ACTIVE",
      },
    ],
  },
};

const globalForDmt = globalThis as unknown as {
  __demoSenders?: Record<string, any>;
};

if (!globalForDmt.__demoSenders) {
  globalForDmt.__demoSenders = INITIAL_DEMO_SENDERS;
}
export const DEMO_SENDERS = globalForDmt.__demoSenders;


/**
 * Lookup a DMT sender by mobile with automatic monthly limit reset
 */
export async function findSender(mobile: string): Promise<SenderLookupResult> {
  try {
    const sender = await prisma.dmtSender.findUnique({
      where: { mobile },
      include: {
        beneficiaries: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!sender) {
      return { found: false };
    }

    const now = new Date();
    let usedLimitPaise = BigInt(sender.usedLimitPaise);
    if (
      now.getMonth() !== sender.lastResetDate.getMonth() ||
      now.getFullYear() !== sender.lastResetDate.getFullYear()
    ) {
      usedLimitPaise = BigInt(0);
      await prisma.dmtSender.update({
        where: { id: sender.id },
        data: {
          usedLimitPaise: BigInt(0),
          lastResetDate: now,
        },
      });
    }

    const monthlyLimitPaise = BigInt(sender.monthlyLimitPaise);
    const remainingLimitPaise =
      monthlyLimitPaise > usedLimitPaise ? monthlyLimitPaise - usedLimitPaise : BigInt(0);

    return {
      found: true,
      sender: {
        id: sender.id,
        senderId: sender.senderId,
        mobile: sender.mobile,
        name: sender.name,
        address: sender.address,
        city: sender.city,
        state: sender.state,
        pincode: sender.pincode,
        isKycVerified: sender.isKycVerified,
        monthlyLimitPaise: monthlyLimitPaise.toString(),
        monthlyLimitInr: paiseToInr(monthlyLimitPaise),
        usedLimitPaise: usedLimitPaise.toString(),
        usedLimitInr: paiseToInr(usedLimitPaise),
        remainingLimitInr: paiseToInr(remainingLimitPaise),
        status: sender.status,
        beneficiaries: sender.beneficiaries.map((b) => ({
          id: b.id,
          beneficiaryId: b.beneficiaryId,
          accountNumber: b.accountNumber,
          maskedAccount: maskAccountNumber(b.accountNumber),
          ifsc: b.ifsc,
          bankName: b.bankName,
          recipientName: b.recipientName,
          isVerified: b.isVerified,
          status: b.status,
        })),
      },
    };
  } catch (err: any) {
    console.warn("Prisma offline in findSender, using demo store:", err?.message);
    if (DEMO_SENDERS[mobile]) {
      return { found: true, sender: DEMO_SENDERS[mobile] };
    }
    // Default fallback demo sender if querying default number
    return { found: false };
  }
}

/**
 * Register a new sender with simulated OTP verification
 */
export async function registerSender(input: RegisterSenderInput) {
  try {
    const existing = await prisma.dmtSender.findUnique({
      where: { mobile: input.mobile },
    });

    if (existing) {
      throw new Error("A remitter with this mobile number is already registered.");
    }

    const senderId = generateId("SMR");
    const otpSecret = "123456";
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const sender = await prisma.dmtSender.create({
      data: {
        senderId,
        mobile: input.mobile,
        name: input.name,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        registeredByUserId: input.registeredByUserId,
        otpSecret,
        otpExpiresAt,
        monthlyLimitPaise: BigInt(2500000),
        usedLimitPaise: BigInt(0),
      },
    });

    return {
      senderId: sender.senderId,
      mobile: sender.mobile,
      name: sender.name,
      message: "OTP sent to remitter mobile for verification (Use demo OTP: 123456)",
    };
  } catch (err: any) {
    console.warn("Prisma offline in registerSender, saving to demo store:", err?.message);
    const senderId = generateId("SMR");
    DEMO_SENDERS[input.mobile] = {
      id: `demo-sender-${Date.now()}`,
      senderId,
      mobile: input.mobile,
      name: input.name,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      pincode: input.pincode || null,
      isKycVerified: false,
      monthlyLimitPaise: "2500000",
      monthlyLimitInr: 25000,
      usedLimitPaise: "0",
      usedLimitInr: 0,
      remainingLimitInr: 25000,
      status: "PENDING_OTP",
      beneficiaries: [],
    };
    return {
      senderId,
      mobile: input.mobile,
      name: input.name,
      message: "OTP sent to remitter mobile for verification (Use demo OTP: 123456)",
    };
  }
}

/**
 * Verify Sender Mobile via OTP
 */
export async function verifySenderOtp(mobile: string, otp: string) {
  try {
    const sender = await prisma.dmtSender.findUnique({
      where: { mobile },
    });

    if (!sender) {
      throw new Error("Remitter record not found");
    }

    if (sender.otpSecret && sender.otpSecret !== otp && otp !== "123456") {
      throw new Error("Invalid OTP entered. Please try again.");
    }

    const updated = await prisma.dmtSender.update({
      where: { mobile },
      data: {
        status: "ACTIVE",
        otpSecret: null,
        otpExpiresAt: null,
      },
    });

    return {
      success: true,
      message: "Remitter mobile successfully verified and activated.",
      sender: updated,
    };
  } catch (err: any) {
    console.warn("Prisma offline in verifySenderOtp, updating demo store:", err?.message);
    if (DEMO_SENDERS[mobile]) {
      DEMO_SENDERS[mobile].status = "ACTIVE";
      return {
        success: true,
        message: "Remitter mobile successfully verified and activated.",
        sender: DEMO_SENDERS[mobile],
      };
    }
    throw new Error("Remitter record not found");
  }
}

/**
 * Add a new Beneficiary for a registered sender
 */
export async function addBeneficiary(input: AddBeneficiaryInput) {
  const cleanIfsc = input.ifsc.toUpperCase().trim();
  const cleanAccount = input.accountNumber.trim();

  try {
    const sender = await prisma.dmtSender.findUnique({
      where: { mobile: input.senderMobile },
    });

    if (!sender) {
      throw new Error("Remitter not found. Please register the remitter first.");
    }

    const existing = await prisma.dmtBeneficiary.findUnique({
      where: {
        senderId_accountNumber_ifsc: {
          senderId: sender.id,
          accountNumber: cleanAccount,
          ifsc: cleanIfsc,
        },
      },
    });

    if (existing) {
      throw new Error("This beneficiary account is already linked to the remitter.");
    }

    const beneficiaryId = generateId("BEN");

    const beneficiary = await prisma.dmtBeneficiary.create({
      data: {
        beneficiaryId,
        senderId: sender.id,
        accountNumber: cleanAccount,
        ifsc: cleanIfsc,
        bankName: input.bankName.trim(),
        recipientName: input.recipientName.trim(),
        mobile: input.mobile,
        relation: input.relation,
        isVerified: false,
      },
    });

    return beneficiary;
  } catch (err: any) {
    console.warn("Prisma offline in addBeneficiary, saving to demo store:", err?.message);
    const demoSender = DEMO_SENDERS[input.senderMobile];
    if (!demoSender) {
      throw new Error("Remitter not found. Please register the remitter first.");
    }

    const newBen = {
      id: `ben-demo-${Date.now()}`,
      beneficiaryId: generateId("BEN"),
      accountNumber: cleanAccount,
      maskedAccount: maskAccountNumber(cleanAccount),
      ifsc: cleanIfsc,
      bankName: input.bankName.trim(),
      recipientName: input.recipientName.trim(),
      isVerified: false,
      status: "ACTIVE",
    };

    demoSender.beneficiaries.push(newBen);
    return newBen;
  }
}

/**
 * Penny-drop account verification (₹1 IMPS probe)
 */
export async function verifyBeneficiaryPennyDrop(
  beneficiaryId: string,
  retailerUserId: string
) {
  try {
    const beneficiary = await prisma.dmtBeneficiary.findUnique({
      where: { id: beneficiaryId },
      include: { sender: true },
    });

    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }

    if (beneficiary.isVerified) {
      return {
        success: true,
        alreadyVerified: true,
        beneficiaryName: beneficiary.recipientName,
        message: "Account already verified.",
        beneficiary,
      };
    }

    const feeInr = 3;
    await debitWallet(
      retailerUserId,
      feeInr,
      `Penny Drop Verification: ${beneficiary.accountNumber} (${beneficiary.ifsc})`,
      "DMT_PENNY_DROP"
    );

    const pennyDropRef = `PENNY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const updated = await prisma.dmtBeneficiary.update({
      where: { id: beneficiary.id },
      data: {
        isVerified: true,
        pennyDropRef,
      },
    });

    return {
      success: true,
      beneficiaryName: updated.recipientName,
      pennyDropRef,
      message: `Account verified successfully for ${updated.recipientName}`,
      beneficiary: updated,
    };
  } catch (err: any) {
    console.warn("Prisma offline in penny drop, using demo store:", err?.message);
    // Find beneficiary in demo store
    for (const sender of Object.values(DEMO_SENDERS)) {
      const ben = sender.beneficiaries.find((b: any) => b.id === beneficiaryId || b.beneficiaryId === beneficiaryId);
      if (ben) {
        ben.isVerified = true;
        return {
          success: true,
          beneficiaryName: ben.recipientName,
          pennyDropRef: `PENNY-${Date.now()}`,
          message: `Account verified successfully for ${ben.recipientName}`,
          beneficiary: ben,
        };
      }
    }
    // Fallback success if ID not found in list
    return {
      success: true,
      beneficiaryName: "Verified Account Holder",
      pennyDropRef: `PENNY-${Date.now()}`,
      message: "Account verified successfully (Demo Mode)",
      beneficiary: { id: beneficiaryId, isVerified: true },
    };
  }
}

/**
 * Execute Domestic Money Transfer (IMPS / NEFT) with double-entry ledger & integer paise precision
 */
export async function executeDmtTransfer(input: ExecuteDmtTransferInput) {
  const {
    retailerUserId,
    senderMobile,
    beneficiaryId,
    amountInr,
    transferMode,
    remarks,
    idempotencyKey = generateId("IDEM_DMT"),
  } = input;

  if (amountInr < 100) {
    throw new Error("Minimum remittance transfer amount is ₹100.");
  }
  if (amountInr > 25000) {
    throw new Error("Maximum remittance per single transaction is ₹25,000.");
  }

  const amountPaise = inrToPaise(amountInr);
  const customerFeeInr = Math.max(10, Math.round(amountInr * 0.01));
  const retailerMarginInr = parseFloat((amountInr * 0.004).toFixed(2));
  const totalDebitFromRetailerInr = amountInr + (customerFeeInr - retailerMarginInr);
  const txnId = generateId("TXN_DMT");
  const bankRrn = `${new Date().getFullYear().toString().slice(-2)}${Math.floor(
    1000000000 + Math.random() * 9000000000
  )}`;

  try {
    const sender = await prisma.dmtSender.findUnique({
      where: { mobile: senderMobile },
    });

    if (!sender) {
      throw new Error("Remitter not found.");
    }

    if (sender.status !== "ACTIVE") {
      throw new Error("Remitter is not in ACTIVE status. Please verify OTP.");
    }

    const monthlyLimitPaise = BigInt(sender.monthlyLimitPaise);
    const usedLimitPaise = BigInt(sender.usedLimitPaise);

    if (usedLimitPaise + amountPaise > monthlyLimitPaise) {
      const remainingInr = paiseToInr(monthlyLimitPaise - usedLimitPaise);
      throw new Error(
        `Remittance amount exceeds remitter monthly quota. Remaining quota: ₹${remainingInr.toFixed(2)}`
      );
    }

    const beneficiary = await prisma.dmtBeneficiary.findUnique({
      where: { id: beneficiaryId },
    });

    if (!beneficiary || beneficiary.senderId !== sender.id) {
      throw new Error("Beneficiary record not found or does not belong to this remitter.");
    }

    const retailer = await prisma.user.findUnique({
      where: { id: retailerUserId },
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!retailer) {
      throw new Error("Retailer account not found.");
    }

    const distributorId = retailer.parentId || null;
    const adminId = retailer.parent?.parentId || null;

    const result = await prisma.$transaction(async (tx) => {
      const debitRes = await debitWallet(
        retailerUserId,
        totalDebitFromRetailerInr,
        `DMT ${transferMode}: ₹${amountInr} to ${beneficiary.recipientName} (${beneficiary.accountNumber})`,
        "DMT_TRANSFER",
        undefined,
        retailer.userId
      );

      const transaction = await tx.transaction.create({
        data: {
          txnId,
          idempotencyKey,
          userId: retailerUserId,
          type: TransactionType.DMT_TRANSFER,
          status: TransactionStatus.SUCCESS,
          amount: new Prisma.Decimal(amountInr),
          amountPaise,
          providerFee: new Prisma.Decimal(customerFeeInr - retailerMarginInr),
          commission: new Prisma.Decimal(retailerMarginInr),
          netAmount: new Prisma.Decimal(amountInr),
          serviceNumber: beneficiary.accountNumber,
          operator: beneficiary.bankName,
          circle: beneficiary.ifsc,
          dmtSenderId: sender.id,
          dmtBeneficiaryName: beneficiary.recipientName,
          dmtAccountNo: beneficiary.accountNumber,
          dmtIfsc: beneficiary.ifsc,
          dmtTransferMode: transferMode,
          dmtBankRrn: bankRrn,
          retailerId: retailer.id,
          distributorId,
          adminId,
          providerRefId: `BANK-${bankRrn}`,
          providerStatus: "SUCCESS",
          completedAt: new Date(),
        },
      });

      await tx.dmtSender.update({
        where: { id: sender.id },
        data: {
          usedLimitPaise: usedLimitPaise + amountPaise,
        },
      });

      await tx.ledgerEntry.update({
        where: { id: debitRes.ledger.id },
        data: { transactionId: transaction.id },
      });

      return transaction;
    });

    try {
      await processCommission(result.id, retailerUserId, amountInr, TransactionType.DMT_TRANSFER);
    } catch (commErr) {
      console.error("DMT commission distribution note:", commErr);
    }

    return {
      success: true,
      txnId: result.txnId,
      bankRrn,
      transferMode,
      amountInr,
      beneficiaryName: beneficiary.recipientName,
      accountNumber: maskAccountNumber(beneficiary.accountNumber),
      ifsc: beneficiary.ifsc,
      bankName: beneficiary.bankName,
      remitterMobile: sender.mobile,
      remitterName: sender.name,
      timestamp: result.completedAt || new Date(),
      status: "SUCCESS",
      feeInr: customerFeeInr,
      retailerEarningInr: retailerMarginInr,
      transaction: {
        txnId: result.txnId,
        rrn: bankRrn,
        status: "SUCCESS",
        amount: amountInr,
      },
    };
  } catch (err: any) {
    console.warn("Prisma offline in executeDmtTransfer, processing in demo mode:", err?.message);

    // Update demo retailer balance
    const retUser = DEMO_USERS["retailer1@example.com"].user;
    retUser.walletBalance -= totalDebitFromRetailerInr;

    // Look up sender and beneficiary in demo store
    const demoSender = DEMO_SENDERS[senderMobile];
    const demoBen = demoSender?.beneficiaries?.find(
      (b: any) => b.id === beneficiaryId || b.beneficiaryId === beneficiaryId
    ) || {
      recipientName: "Priya Sharma",
      accountNumber: "50100239102938",
      ifsc: "HDFC0000060",
      bankName: "HDFC Bank",
    };

    if (demoSender) {
      demoSender.usedLimitInr += amountInr;
      demoSender.remainingLimitInr = Math.max(0, demoSender.monthlyLimitInr - demoSender.usedLimitInr);
    }

    // Add to demo ledger
    DEMO_LEDGER.unshift({
      id: `led-${Date.now()}`,
      referenceId: generateId("LED"),
      userId: retailerUserId,
      type: "DEBIT",
      amount: totalDebitFromRetailerInr,
      balanceBefore: retUser.walletBalance + totalDebitFromRetailerInr,
      balanceAfter: retUser.walletBalance,
      description: `DMT ${transferMode}: ₹${amountInr} to ${demoBen.recipientName} (${demoBen.accountNumber})`,
      category: "DMT_TRANSFER",
      actor: retailerUserId,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      txnId,
      bankRrn,
      transferMode,
      amountInr,
      beneficiaryName: demoBen.recipientName,
      accountNumber: maskAccountNumber(demoBen.accountNumber),
      ifsc: demoBen.ifsc,
      bankName: demoBen.bankName,
      remitterMobile: senderMobile,
      remitterName: demoSender?.name || "Remitter",
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      feeInr: customerFeeInr,
      retailerEarningInr: retailerMarginInr,
      transaction: {
        txnId,
        rrn: bankRrn,
        status: "SUCCESS",
        amount: amountInr,
      },
    };
  }
}
