import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole, TicketStatus } from "@prisma/client";
import { z } from "zod";

const createMessageSchema = z.object({
  message: z.string().min(1, "Message content cannot be empty"),
  isInternal: z.boolean().optional().default(false),
  status: z.nativeEnum(TicketStatus).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id }, { ticketId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
        messages: {
          where:
            userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN
              ? {}
              : { isInternal: false },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Role check
    if (
      userRole !== UserRole.MASTER_ADMIN &&
      userRole !== UserRole.ADMIN &&
      ticket.userId !== userId
    ) {
      return NextResponse.json({ error: "Unauthorized to view this ticket" }, { status: 403 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error(`GET /api/support/tickets/${params.id} error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch support ticket" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role") as UserRole | null;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id }, { ticketId: id }],
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Role check
    if (
      userRole !== UserRole.MASTER_ADMIN &&
      userRole !== UserRole.ADMIN &&
      ticket.userId !== userId
    ) {
      return NextResponse.json({ error: "Unauthorized to respond to this ticket" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { message, isInternal = false, status } = parsed.data;

    // Normal users cannot create internal notes
    const canInternal =
      (userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN) && isInternal;

    const result = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: userId,
          senderRole: userRole,
          message,
          isInternal: canInternal,
        },
      });

      // Update ticket status if provided or adjust based on who answered
      let newStatus = status;
      if (!newStatus) {
        if (userRole === UserRole.MASTER_ADMIN || userRole === UserRole.ADMIN) {
          newStatus = TicketStatus.WAITING_ON_USER;
        } else {
          newStatus = TicketStatus.IN_PROGRESS;
        }
      }

      const updatedTicket = await tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: newStatus,
          resolvedAt: newStatus === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt,
          updatedAt: new Date(),
        },
      });

      return { message: createdMessage, ticket: updatedTicket };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error(`POST /api/support/tickets/${params.id} error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to add message to ticket" },
      { status: 500 }
    );
  }
}
