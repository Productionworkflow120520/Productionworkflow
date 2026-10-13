import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { UserRole, TicketPriority, TicketStatus, Prisma } from "@prisma/client";
import { z } from "zod";

const createTicketSchema = z.object({
  category: z.string().min(2, "Category is required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(5, "Message description is required"),
  priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
  transactionId: z.string().optional(),
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
    const status = searchParams.get("status") as TicketStatus | undefined;
    const priority = searchParams.get("priority") as TicketPriority | undefined;

    const skip = (page - 1) * limit;

    const where: Prisma.SupportTicketWhereInput = {
      ...(userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN ? {} : { userId }),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    };

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              userId: true,
              fullName: true,
              role: true,
              email: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/support/tickets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch support tickets" },
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

    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { category, subject, message, priority, transactionId } = parsed.data;
    const ticketId = generateId("TKT");

    const ticket = await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.supportTicket.create({
        data: {
          ticketId,
          userId,
          category,
          subject,
          priority,
          status: TicketStatus.OPEN,
          transactionId: transactionId || null,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: createdTicket.id,
          senderId: userId,
          senderRole: userRole,
          message,
          isInternal: false,
        },
      });

      return createdTicket;
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/support/tickets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
