import { NextRequest, NextResponse } from "next/server";
import { getTransactions, createTransaction } from "@/services/transaction.service";
import { UserRole, TransactionStatus, TransactionType } from "@prisma/client";
import { z } from "zod";

const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive("Amount must be greater than zero"),
  serviceNumber: z.string().optional(),
  operator: z.string().optional(),
  circle: z.string().optional(),
  planDetails: z.any().optional(),
  idempotencyKey: z.string().optional(),
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
    const status = searchParams.get("status") as TransactionStatus | undefined;
    const type = searchParams.get("type") as TransactionType | undefined;
    const search = searchParams.get("search") || undefined;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const data = await getTransactions({
      userId,
      role: userRole,
      page,
      limit,
      status,
      type,
      search,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.warn("GET /api/transactions DB offline, returning synthetic transactions:", error?.message);
    const { getSyntheticTransactions } = await import("@/lib/demo-data");
    const transactions = getSyntheticTransactions();

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        total: transactions.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const transaction = await createTransaction({
      userId,
      ...parsed.data,
    });

    return NextResponse.json(
      { success: true, transaction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}
