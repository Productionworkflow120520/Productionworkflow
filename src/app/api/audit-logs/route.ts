import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UserRole, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const callerId = request.headers.get("x-user-id");
    const callerRole = request.headers.get("x-user-role") as UserRole | null;

    if (!callerId || !callerRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Audit logs are accessible strictly to MASTER_ADMIN
    if (callerRole !== "MASTER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Master Admin can access system audit logs" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const actionFilter = searchParams.get("action")?.trim() || "";
    const userFilter = searchParams.get("userId")?.trim() || "";
    const entityFilter = searchParams.get("entity")?.trim() || "";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const whereConditions: Prisma.AuditLogWhereInput[] = [];

    if (actionFilter) {
      whereConditions.push({
        action: { equals: actionFilter, mode: "insensitive" },
      });
    }

    if (userFilter) {
      whereConditions.push({
        OR: [
          { userId: userFilter },
          { user: { userId: userFilter } },
          { user: { username: { contains: userFilter, mode: "insensitive" } } },
        ],
      });
    }

    if (entityFilter) {
      whereConditions.push({
        entity: { equals: entityFilter, mode: "insensitive" },
      });
    }

    if (startDateParam || endDateParam) {
      const dateCondition: Prisma.DateTimeFilter = {};
      if (startDateParam) {
        dateCondition.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        dateCondition.lte = new Date(endDateParam);
      }
      whereConditions.push({ createdAt: dateCondition });
    }

    const where: Prisma.AuditLogWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
