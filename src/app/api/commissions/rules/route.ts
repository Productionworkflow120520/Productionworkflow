import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole, TransactionType, CommissionType, Prisma } from "@prisma/client";
import { z } from "zod";

const createRuleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  serviceType: z.nativeEnum(TransactionType),
  operator: z.string().nullable().optional(),
  commissionType: z.nativeEnum(CommissionType),
  masterAdminRate: z.number().nonnegative(),
  adminRate: z.number().nonnegative(),
  distributorRate: z.number().nonnegative(),
  retailerRate: z.number().nonnegative(),
  serviceCharge: z.number().nonnegative().optional().default(0),
  minAmount: z.number().positive().optional().default(1),
  maxAmount: z.number().positive().optional().default(100000),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType") as TransactionType | undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam !== null ? isActiveParam === "true" : undefined;

    const where: Prisma.CommissionRuleWhereInput = {
      ...(serviceType ? { serviceType } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const rules = await prisma.commissionRule.findMany({
      where,
      orderBy: [
        { serviceType: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    console.error("GET /api/commissions/rules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commission rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only MASTER_ADMIN can manage commission rules
    if (userRole !== UserRole.MASTER_ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only Master Admin can configure commission rules" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const rule = await prisma.commissionRule.create({
      data: {
        name: data.name,
        serviceType: data.serviceType,
        operator: data.operator || null,
        commissionType: data.commissionType,
        masterAdminRate: new Prisma.Decimal(data.masterAdminRate),
        adminRate: new Prisma.Decimal(data.adminRate),
        distributorRate: new Prisma.Decimal(data.distributorRate),
        retailerRate: new Prisma.Decimal(data.retailerRate),
        serviceCharge: new Prisma.Decimal(data.serviceCharge),
        minAmount: new Prisma.Decimal(data.minAmount),
        maxAmount: new Prisma.Decimal(data.maxAmount),
        isActive: data.isActive,
        priority: data.priority,
      },
    });

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/commissions/rules error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create commission rule" },
      { status: 500 }
    );
  }
}
