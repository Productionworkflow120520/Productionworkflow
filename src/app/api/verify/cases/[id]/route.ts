import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateOperatorCase } from "@/services/verification.service";

const updateSchema = z.object({
  status: z.enum(["PENDING_OPERATOR_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
  operatorNotes: z.string().optional(),
  assignedOperator: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await updateOperatorCase(id, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { error: `Verification case with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Case updated successfully",
      case: updated,
    });
  } catch (err: any) {
    console.error("Update case error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update case" },
      { status: 500 }
    );
  }
}
