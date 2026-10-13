import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
  username: string;
  fullName: string;
  sessionId: string;
}

// ─── Password ────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT ─────────────────────────────────────────────────────

export async function createToken(payload: JWTPayload): Promise<string> {
  const expiresIn = JWT_EXPIRES_IN.endsWith("h")
    ? parseInt(JWT_EXPIRES_IN) * 3600
    : parseInt(JWT_EXPIRES_IN);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ─── Role Hierarchy ──────────────────────────────────────────

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 6,
  MASTER_ADMIN: 6,
  ADMIN: 5,
  SUPER_DISTRIBUTOR: 4,
  MASTER_DISTRIBUTOR: 3,
  DISTRIBUTOR: 2,
  RETAILER: 1,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export function isParentRole(parentRole: UserRole, childRole: UserRole): boolean {
  return (ROLE_HIERARCHY[parentRole] || 0) > (ROLE_HIERARCHY[childRole] || 0);
}

/**
 * Checks if a creator role is permitted to onboard a target role
 * Hierarchy:
 * Super Admin -> Admin, Super Dist, Master Dist, Dist, Retailer
 * Admin -> Super Dist, Master Dist, Dist, Retailer
 * Super Distributor -> Master Dist, Dist, Retailer
 * Master Distributor -> Dist, Retailer
 * Distributor -> Retailer
 * Retailer -> None
 */
export function canCreateRole(creatorRole: UserRole | string, targetRole: UserRole | string): boolean {
  switch (creatorRole) {
    case "SUPER_ADMIN":
    case "MASTER_ADMIN":
      return ["ADMIN", "SUPER_DISTRIBUTOR", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"].includes(targetRole);
    case "ADMIN":
      return ["SUPER_DISTRIBUTOR", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"].includes(targetRole);
    case "SUPER_DISTRIBUTOR":
      return ["MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"].includes(targetRole);
    case "MASTER_DISTRIBUTOR":
      return ["DISTRIBUTOR", "RETAILER"].includes(targetRole);
    case "DISTRIBUTOR":
      return targetRole === "RETAILER";
    case "RETAILER":
    default:
      return false;
  }
}

/**
 * CRITICAL REQUIREMENT:
 * Super Admin and Admin MUST NOT have Mobile/DTH Recharge or BBPS transaction access.
 * Allowed: Super Distributor, Master Distributor, Distributor, Retailer.
 */
export function canPerformCustomerTransactions(role: UserRole | string): boolean {
  if (role === "SUPER_ADMIN" || role === "MASTER_ADMIN" || role === "ADMIN") {
    return false;
  }
  return ["SUPER_DISTRIBUTOR", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"].includes(role);
}

export function getRoleDashboardPath(role: UserRole | string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "MASTER_ADMIN":
      return "/super-admin";
    case "ADMIN":
      return "/admin";
    case "SUPER_DISTRIBUTOR":
      return "/super-distributor";
    case "MASTER_DISTRIBUTOR":
      return "/master-distributor";
    case "DISTRIBUTOR":
      return "/distributor";
    case "RETAILER":
      return "/retailer";
    default:
      return "/login";
  }
}

// ─── Permissions ─────────────────────────────────────────────

export const PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "platform.view",
    "user.manage_all",
    "admin.manage",
    "super_distributor.manage",
    "master_distributor.manage",
    "distributor.manage",
    "retailer.manage",
    "provider.manage",
    "commission.manage_global",
    "wallet.manage",
    "wallet.approve",
    "kyc.review",
    "transaction.view_all",
    "report.export",
    "settings.manage",
    "support.manage",
    "audit.view",
  ],
  MASTER_ADMIN: [
    "platform.view",
    "user.manage_all",
    "admin.manage",
    "super_distributor.manage",
    "master_distributor.manage",
    "distributor.manage",
    "retailer.manage",
    "provider.manage",
    "commission.manage_global",
    "wallet.manage",
    "wallet.approve",
    "kyc.review",
    "transaction.view_all",
    "report.export",
    "settings.manage",
    "support.manage",
    "audit.view",
  ],
  ADMIN: [
    "super_distributor.manage",
    "master_distributor.manage",
    "distributor.manage",
    "retailer.manage",
    "kyc.review",
    "wallet.approve",
    "transaction.view_assigned",
    "report.export",
    "support.manage",
  ],
  SUPER_DISTRIBUTOR: [
    "recharge.mobile",
    "recharge.dth",
    "bbps.pay",
    "master_distributor.manage",
    "distributor.manage",
    "retailer.manage",
    "wallet.transfer",
    "wallet.request",
    "commission.manage_assigned",
    "transaction.view_downline",
    "report.hierarchy",
    "support.create",
  ],
  MASTER_DISTRIBUTOR: [
    "recharge.mobile",
    "recharge.dth",
    "bbps.pay",
    "distributor.manage",
    "retailer.manage",
    "wallet.transfer",
    "wallet.request",
    "commission.manage_assigned",
    "transaction.view_downline",
    "report.hierarchy",
    "support.create",
  ],
  DISTRIBUTOR: [
    "recharge.mobile",
    "recharge.dth",
    "bbps.pay",
    "retailer.view",
    "retailer.register",
    "wallet.transfer",
    "wallet.request",
    "commission.manage_assigned",
    "transaction.view_downline",
    "report.hierarchy",
    "support.create",
  ],
  RETAILER: [
    "recharge.mobile",
    "recharge.dth",
    "bbps.pay",
    "dmt.transfer",
    "aeps.access",
    "wallet.view",
    "wallet.request",
    "transaction.view_own",
    "report.view_own",
    "support.create",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: string
): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
