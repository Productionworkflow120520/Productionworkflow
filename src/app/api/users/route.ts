import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, canCreateRole } from "@/lib/auth";
import { generateUserId, generateDistributorId } from "@/lib/utils";
import { UserRole, UserStatus, Prisma } from "@prisma/client";
import { z } from "zod";

const createUserSchema = z.object({
  role: z.enum([
    "ADMIN",
    "SUPER_DISTRIBUTOR",
    "MASTER_DISTRIBUTOR",
    "DISTRIBUTOR",
    "RETAILER",
  ]),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  businessName: z.string().optional(),
  email: z.string().email("Invalid email address").toLowerCase(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile required"),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  parentId: z.string().optional(),
  parentDistributorId: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
  panNumber: z.string().optional(),
  maxDailyLimit: z.number().positive().optional(),
  maxPerTxnLimit: z.number().positive().optional(),
  servicesAllowed: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const callerId = request.headers.get("x-user-id");
  const callerRole = request.headers.get("x-user-role") as UserRole | null;

  if (!callerId || !callerRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (callerRole === "RETAILER") {
    return NextResponse.json(
      { error: "Forbidden: Retailers do not have access to manage users" },
      { status: 403 }
    );
  }

  try {

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const search = searchParams.get("search")?.trim() || "";
    const roleFilter = searchParams.get("role") as UserRole | null;
    const statusFilter = searchParams.get("status") as UserStatus | null;
    const parentFilter = searchParams.get("parentId") || "";

    // Base WHERE conditions based on hierarchy
    const whereConditions: Prisma.UserWhereInput[] = [];

    if (callerRole === "DISTRIBUTOR") {
      // Distributor can ONLY see their own retailers
      whereConditions.push({
        parentId: callerId,
        role: "RETAILER",
      });
    } else if (callerRole === "MASTER_DISTRIBUTOR") {
      // Master Distributor can see their direct distributors and downline retailers
      whereConditions.push({
        OR: [
          { parentId: callerId },
          { parent: { parentId: callerId } },
        ],
      });
    } else if (callerRole === "SUPER_DISTRIBUTOR") {
      // Super Distributor can see their downline Master Dist, Dist, and Retailers
      whereConditions.push({
        OR: [
          { parentId: callerId },
          { parent: { parentId: callerId } },
          { parent: { parent: { parentId: callerId } } },
        ],
      });
    } else if (callerRole === "ADMIN") {
      // Admin can see their direct downline tree
      whereConditions.push({
        OR: [
          { parentId: callerId },
          { parent: { parentId: callerId } },
          { parent: { parent: { parentId: callerId } } },
          { parent: { parent: { parent: { parentId: callerId } } } },
        ],
      });
    } else if (callerRole === "SUPER_ADMIN" || callerRole === "MASTER_ADMIN") {
      // Super Admin can see all; apply parent filter if requested
      if (parentFilter) {
        whereConditions.push({ parentId: parentFilter });
      }
    }

    // Role filter
    if (roleFilter) {
      whereConditions.push({ role: roleFilter });
    }

    // Status filter
    if (statusFilter) {
      whereConditions.push({ status: statusFilter });
    }

    // Search filter across text fields
    if (search) {
      whereConditions.push({
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search } },
          { userId: { contains: search, mode: "insensitive" } },
          { businessName: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const finalWhere: Prisma.UserWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where: finalWhere }),
      prisma.user.findMany({
        where: finalWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          username: true,
          email: true,
          mobile: true,
          fullName: true,
          role: true,
          status: true,
          kycStatus: true,
          businessName: true,
          city: true,
          state: true,
          pincode: true,
          maxDailyLimit: true,
          maxPerTxnLimit: true,
          servicesAllowed: true,
          lastLoginAt: true,
          createdAt: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              userId: true,
              fullName: true,
              role: true,
            },
          },
          walletAccount: {
            select: {
              id: true,
              balance: true,
              isActive: true,
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      ...u,
      maxDailyLimit: Number(u.maxDailyLimit),
      maxPerTxnLimit: Number(u.maxPerTxnLimit),
      walletBalance: u.walletAccount ? Number(u.walletAccount.balance) : 0,
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.warn("List users DB offline, returning demo directory:", (error as any)?.message);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const { DEMO_USERS, isSubordinateUser } = await import("@/lib/demo-data");

    // Deduplicate unique demo users
    const uniqueMap = new Map<string, any>();
    for (const d of Object.values(DEMO_USERS)) {
      uniqueMap.set(d.user.id, d.user);
    }
    let matchedUsers = Array.from(uniqueMap.values());

    // Filter by caller's hierarchy unless Super Admin
    if (callerRole !== "SUPER_ADMIN" && callerRole !== "MASTER_ADMIN") {
      matchedUsers = matchedUsers.filter((u) => isSubordinateUser(callerId, u.id));
    }

    if (role && role !== "ALL") {
      matchedUsers = matchedUsers.filter((u) => u.role === role);
    }

    return NextResponse.json({
      users: matchedUsers.map((u) => ({
        ...u,
        maxDailyLimit: 100000,
        maxPerTxnLimit: 25000,
        walletAccount: {
          id: `demo-wallet-${u.id}`,
          balance: u.walletBalance,
          isActive: true,
        },
      })),
      pagination: {
        total: matchedUsers.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const callerId = request.headers.get("x-user-id");
    const callerRole = request.headers.get("x-user-role") as UserRole | null;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!callerId || !callerRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = createUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.errors[0]?.message || "Validation failed",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // ─── Hierarchy Authorization Rules ──────────────────────────
    if (!canCreateRole(callerRole, data.role)) {
      return NextResponse.json(
        { error: `Forbidden: ${callerRole} is not authorized to create ${data.role} accounts.` },
        { status: 403 }
      );
    }

    // Determine parentId and parentDistributorId based on role
    let assignedParentId = data.parentId || callerId;
    let assignedParentDistributorId = data.parentDistributorId;

    if (!assignedParentDistributorId && callerId) {
      assignedParentDistributorId = callerId;
    }

    try {
      // ─── Check for Duplicates ────────────────────────────────────
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username },
            { mobile: data.mobile },
          ],
        },
      });

      if (existing) {
        if (existing.email === data.email) {
          return NextResponse.json(
            { error: "Email address already registered" },
            { status: 409 }
          );
        }
        if (existing.username === data.username) {
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }
        if (existing.mobile === data.mobile) {
          return NextResponse.json(
            { error: "Mobile number already registered" },
            { status: 409 }
          );
        }
      }

      // ─── Generate Sequence and User ID ───────────────────────────
      const roleUserCount = await prisma.user.count({
        where: { role: data.role },
      });

      let sequence = roleUserCount + 1;
      let customUserId = generateUserId(data.role, sequence);

      let idCollision = await prisma.user.findUnique({
        where: { userId: customUserId },
      });
      while (idCollision) {
        sequence += 1;
        customUserId = generateUserId(data.role, sequence);
        idCollision = await prisma.user.findUnique({
          where: { userId: customUserId },
        });
      }

      const customDistributorId = generateDistributorId(data.role, sequence);
      const passwordHash = await hashPassword(data.password);

      const initialStatus: UserStatus =
        callerRole === "DISTRIBUTOR" ? "PENDING_APPROVAL" : "ACTIVE";

      // ─── Database Transaction ────────────────────────────────────
      const created = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            userId: customUserId,
            distributorId: customDistributorId,
            username: data.username,
            email: data.email,
            mobile: data.mobile,
            passwordHash,
            fullName: data.fullName,
            role: data.role,
            status: initialStatus,
            kycStatus: "NOT_SUBMITTED",
            parentId: assignedParentId,
            parentDistributorId: assignedParentDistributorId,
            businessName: data.businessName,
            state: data.state,
            city: data.city,
            pincode: data.pincode,
            address: data.address,
            panNumber: data.panNumber,
            maxDailyLimit: data.maxDailyLimit || 100000,
            maxPerTxnLimit: data.maxPerTxnLimit || 10000,
            servicesAllowed: data.servicesAllowed || [
              "MOBILE_RECHARGE",
              "DTH_RECHARGE",
              "BBPS_PAYMENT",
            ],
          },
        });

        // Create wallet account
        await tx.walletAccount.create({
          data: {
            userId: newUser.id,
            balance: 0,
            reservedBalance: 0,
            currency: "INR",
            isActive: true,
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            userId: callerId,
            action: "USER_CREATED",
            entity: "User",
            entityId: newUser.id,
            ipAddress,
            userAgent,
            newValue: {
              userId: newUser.userId,
              distributorId: newUser.distributorId,
              username: newUser.username,
              role: newUser.role,
              status: newUser.status,
              parentId: newUser.parentId,
              creatorRole: callerRole,
            },
          },
        });

        return newUser;
      });

      return NextResponse.json(
        {
          message: `${data.role} created successfully`,
          user: {
            id: created.id,
            userId: created.userId,
            distributorId: created.distributorId,
            parentId: created.parentId,
            parentDistributorId: created.parentDistributorId,
            username: created.username,
            fullName: created.fullName,
            role: created.role,
            status: created.status,
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Prisma offline in POST /api/users, registering in demo store:", dbErr?.message);
      const { registerDemoUser } = await import("@/lib/demo-data");
      const demoUser = registerDemoUser({
        fullName: data.fullName,
        businessName: data.businessName,
        email: data.email,
        mobile: data.mobile,
        username: data.username,
        password: data.password,
        role: data.role as any,
        parentId: assignedParentId,
        parentDistributorId: assignedParentDistributorId,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
      });

      return NextResponse.json(
        {
          message: `${data.role} created successfully (Demo Mode)`,
          user: {
            id: demoUser.id,
            userId: demoUser.userId,
            distributorId: demoUser.distributorId,
            parentId: demoUser.parentId,
            parentDistributorId: demoUser.parentDistributorId,
            username: demoUser.username,
            fullName: demoUser.fullName,
            role: demoUser.role,
            status: demoUser.status,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
