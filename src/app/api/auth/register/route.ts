import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateUserId } from "@/lib/utils";
import { registerDemoUser, findDemoUser } from "@/lib/demo-data";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().regex(/^\d{6}$/, "Must be a valid 6-digit PIN code"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.errors[0]?.message || "Validation failed",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      businessName,
      email,
      mobile,
      username,
      password,
      state,
      city,
      pincode,
      address,
    } = parseResult.data;

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    try {
      // ─── Database Path ──────────────────────────────────────────
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
            { mobile },
          ],
        },
        select: {
          email: true,
          username: true,
          mobile: true,
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return NextResponse.json(
            { error: "An account with this email address already exists." },
            { status: 409 }
          );
        }
        if (existingUser.username === username) {
          return NextResponse.json(
            { error: "This username is already taken. Please choose another." },
            { status: 409 }
          );
        }
        if (existingUser.mobile === mobile) {
          return NextResponse.json(
            { error: "An account with this mobile number already exists." },
            { status: 409 }
          );
        }
      }

      const passwordHash = await hashPassword(password);

      const retailerCount = await prisma.user.count({
        where: { role: "RETAILER" },
      });

      let sequence = retailerCount + 1;
      let generatedCustomId = generateUserId("RETAILER", sequence);

      let idExists = await prisma.user.findUnique({
        where: { userId: generatedCustomId },
      });
      while (idExists) {
        sequence += 1;
        generatedCustomId = generateUserId("RETAILER", sequence);
        idExists = await prisma.user.findUnique({
          where: { userId: generatedCustomId },
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            userId: generatedCustomId,
            username,
            email,
            mobile,
            passwordHash,
            fullName,
            role: "RETAILER",
            status: "ACTIVE",
            kycStatus: "APPROVED",
            businessName,
            state,
            city,
            pincode,
            address,
            servicesAllowed: [
              "MOBILE_RECHARGE",
              "DTH_RECHARGE",
              "BBPS_PAYMENT",
            ],
          },
        });

        const wallet = await tx.walletAccount.create({
          data: {
            userId: newUser.id,
            balance: 25000,
            reservedBalance: 0,
            currency: "INR",
            isActive: true,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: newUser.id,
            action: "USER_REGISTERED",
            entity: "User",
            entityId: newUser.id,
            ipAddress,
            userAgent,
            newValue: {
              userId: newUser.userId,
              username: newUser.username,
              role: newUser.role,
              status: newUser.status,
              businessName: newUser.businessName,
            },
          },
        });

        return { user: newUser, wallet };
      });

      return NextResponse.json(
        {
          message: "Registration successful! You can now log in with your credentials.",
          user: {
            id: result.user.id,
            userId: result.user.userId,
            username: result.user.username,
            fullName: result.user.fullName,
            status: result.user.status,
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Registration DB offline, registering user in demo store:", dbErr?.message);

      // Check if already in demo store
      const existingDemo = findDemoUser(email) || findDemoUser(username);
      if (existingDemo && existingDemo.user.email === email) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }
      if (existingDemo && existingDemo.user.username === username) {
        return NextResponse.json(
          { error: "This username is already taken. Please choose another." },
          { status: 409 }
        );
      }

      const newDemoUser = registerDemoUser({
        fullName,
        businessName,
        email,
        mobile,
        username,
        password,
        role: UserRole.RETAILER,
        state,
        city,
        pincode,
      });

      return NextResponse.json(
        {
          message: "Registration successful! You can now log in with your credentials.",
          user: {
            id: newDemoUser.id,
            userId: newDemoUser.userId,
            username: newDemoUser.username,
            fullName: newDemoUser.fullName,
            status: "ACTIVE",
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}
