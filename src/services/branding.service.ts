import fs from "fs";
import path from "path";

export interface BrandingConfig {
  appName: string;
  tagline: string;
  logoUrl: string;
  mobileLogoUrl: string;
  faviconUrl: string;
  loginBannerText: string;
  supportEmail: string;
  supportPhone: string;
  primaryColor: string;
  accentColor: string;
  secondaryAccent: string;
  version: number;
  updatedAt: string;
  updatedByUserId?: string;
  updatedByRole?: string;
  updatedByEmail?: string;
}

export interface BrandingAuditEntry {
  id: string;
  action: "UPDATE" | "RESTORE_DEFAULT" | "LOGO_UPLOAD";
  adminId: string;
  adminEmail: string;
  adminRole: string;
  fieldChanged: string;
  previousValue: string | null;
  newValue: string | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: "Recharge Pro",
  tagline: "All Recharge • Bill Payments • Digital Services",
  logoUrl: "/images/rechargepro-logo.png",
  mobileLogoUrl: "/images/rechargepro-logo.png",
  faviconUrl: "/images/rechargepro-logo.png",
  loginBannerText: "India's Premier Digital Recharge & Utility Payment Platform",
  supportEmail: "support@rechargepro.in",
  supportPhone: "+91 98000 12345",
  primaryColor: "#0f172a", // Dark Navy
  accentColor: "#2563eb",  // Vibrant Royal Blue
  secondaryAccent: "#10b981", // Bright Emerald Green
  version: 1,
  updatedAt: new Date("2026-10-13T00:00:00.000Z").toISOString(),
  updatedByUserId: "system-init",
  updatedByRole: "SUPER_ADMIN",
  updatedByEmail: "admin@rechargepro.in",
};

const DATA_DIR = path.join(process.cwd(), "data");
const BRANDING_FILE = path.join(DATA_DIR, "branding-store.json");
const AUDIT_FILE = path.join(DATA_DIR, "branding-audit.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "branding");

// Initialize directories and default files
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(BRANDING_FILE)) {
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(DEFAULT_BRANDING, null, 2), "utf-8");
  }
  if (!fs.existsSync(AUDIT_FILE)) {
    const initialLog: BrandingAuditEntry[] = [
      {
        id: "audit-init-001",
        action: "UPDATE",
        adminId: "demo-user-super-admin",
        adminEmail: "admin@rechargepro.in",
        adminRole: "SUPER_ADMIN",
        fieldChanged: "SYSTEM_INITIALIZATION",
        previousValue: "PayMatrix (Legacy)",
        newValue: "Recharge Pro (Active Official Branding)",
        ipAddress: "127.0.0.1",
        userAgent: "Recharge Pro System Initializer",
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(initialLog, null, 2), "utf-8");
  }
}

export class BrandingService {
  private static instance: BrandingService;

  private constructor() {
    ensureStorage();
  }

  public static getInstance(): BrandingService {
    if (!BrandingService.instance) {
      BrandingService.instance = new BrandingService();
    }
    return BrandingService.instance;
  }

  public getBranding(): BrandingConfig & { cacheBuster: string } {
    ensureStorage();
    try {
      const content = fs.readFileSync(BRANDING_FILE, "utf-8");
      const config: BrandingConfig = JSON.parse(content);
      const cacheBuster = new Date(config.updatedAt).getTime().toString();
      return { ...config, cacheBuster };
    } catch (e) {
      console.error("Failed to read branding store, returning default:", e);
      return { ...DEFAULT_BRANDING, cacheBuster: Date.now().toString() };
    }
  }

  public getAuditHistory(limit: number = 50): BrandingAuditEntry[] {
    ensureStorage();
    try {
      const content = fs.readFileSync(AUDIT_FILE, "utf-8");
      const logs: BrandingAuditEntry[] = JSON.parse(content);
      return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
    } catch (e) {
      console.error("Failed to read audit log store:", e);
      return [];
    }
  }

  public updateBranding(
    admin: { id: string; email: string; role: string },
    updates: Partial<BrandingConfig>,
    context?: { ipAddress?: string; userAgent?: string }
  ): { success: boolean; config: BrandingConfig; changesCount: number } {
    ensureStorage();

    // Security check: only Super Admin or Admin
    const role = admin.role.toUpperCase();
    if (role !== "SUPER_ADMIN" && role !== "MASTER_ADMIN" && role !== "ADMIN") {
      throw new Error("Unauthorized: Only Super Admin and Admin can update branding settings.");
    }

    const current = this.getBranding();
    const newConfig: BrandingConfig = { ...current };
    const auditEntries: BrandingAuditEntry[] = [];
    const nowIso = new Date().toISOString();

    const allowedFields: (keyof BrandingConfig)[] = [
      "appName",
      "tagline",
      "logoUrl",
      "mobileLogoUrl",
      "faviconUrl",
      "loginBannerText",
      "supportEmail",
      "supportPhone",
      "primaryColor",
      "accentColor",
      "secondaryAccent",
    ];

    for (const field of allowedFields) {
      const val = updates[field];
      if (val !== undefined && val !== null && typeof val === "string") {
        const cleanVal = val.trim();
        const oldVal = String(current[field] || "");

        if (cleanVal !== oldVal) {
          // Validation per field
          if (field === "appName" && (cleanVal.length < 2 || cleanVal.length > 50)) {
            throw new Error("Application name must be between 2 and 50 characters.");
          }
          if (field.endsWith("Color") && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleanVal)) {
            throw new Error(`Invalid hex color format for ${field}: ${cleanVal}`);
          }

          (newConfig as any)[field] = cleanVal;

          auditEntries.push({
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            action: "UPDATE",
            adminId: admin.id,
            adminEmail: admin.email,
            adminRole: admin.role,
            fieldChanged: field,
            previousValue: oldVal,
            newValue: cleanVal,
            ipAddress: context?.ipAddress || "127.0.0.1",
            userAgent: context?.userAgent || "Internal Browser",
            createdAt: nowIso,
          });
        }
      }
    }

    if (auditEntries.length === 0) {
      return { success: true, config: current, changesCount: 0 };
    }

    newConfig.version = (current.version || 1) + 1;
    newConfig.updatedAt = nowIso;
    newConfig.updatedByUserId = admin.id;
    newConfig.updatedByRole = admin.role;
    newConfig.updatedByEmail = admin.email;

    // Save config
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(newConfig, null, 2), "utf-8");

    // Save audit logs
    try {
      const existingLogs = this.getAuditHistory(200);
      const combined = [...auditEntries, ...existingLogs];
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(combined, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to append audit entries:", e);
    }

    return { success: true, config: newConfig, changesCount: auditEntries.length };
  }

  public restoreDefaults(
    admin: { id: string; email: string; role: string },
    context?: { ipAddress?: string; userAgent?: string }
  ): { success: boolean; config: BrandingConfig } {
    ensureStorage();

    // Security check: Only Super Admin can restore default branding
    const role = admin.role.toUpperCase();
    if (role !== "SUPER_ADMIN" && role !== "MASTER_ADMIN") {
      throw new Error("Forbidden: Only Super Administrator can restore default branding configuration.");
    }

    const current = this.getBranding();
    const nowIso = new Date().toISOString();

    const restoredConfig: BrandingConfig = {
      ...DEFAULT_BRANDING,
      version: (current.version || 1) + 1,
      updatedAt: nowIso,
      updatedByUserId: admin.id,
      updatedByRole: admin.role,
      updatedByEmail: admin.email,
    };

    fs.writeFileSync(BRANDING_FILE, JSON.stringify(restoredConfig, null, 2), "utf-8");

    // Audit log
    const auditEntry: BrandingAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: "RESTORE_DEFAULT",
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      fieldChanged: "ALL_BRANDING_FIELDS",
      previousValue: `Version ${current.version}: ${current.appName}`,
      newValue: `Default Restored: ${DEFAULT_BRANDING.appName} v${restoredConfig.version}`,
      ipAddress: context?.ipAddress || "127.0.0.1",
      userAgent: context?.userAgent || "Internal Browser",
      createdAt: nowIso,
    };

    try {
      const existingLogs = this.getAuditHistory(200);
      fs.writeFileSync(AUDIT_FILE, JSON.stringify([auditEntry, ...existingLogs], null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to log restore audit:", e);
    }

    return { success: true, config: restoredConfig };
  }

  public async saveUploadedLogo(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    category: "web_logo" | "mobile_logo" | "favicon",
    admin: { id: string; email: string; role: string },
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ url: string; filename: string }> {
    ensureStorage();

    // Security check: only Super Admin or Admin
    const role = admin.role.toUpperCase();
    if (role !== "SUPER_ADMIN" && role !== "MASTER_ADMIN" && role !== "ADMIN") {
      throw new Error("Unauthorized: Only Super Admin and Admin can upload logos.");
    }

    // 1. Validate file size (max 2 MB = 2 * 1024 * 1024 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      throw new Error(`File size exceeds 2MB limit (Received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`);
    }

    // 2. Validate MIME type
    const allowedMimes: Record<string, string> = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };

    const ext = allowedMimes[mimeType.toLowerCase()];
    if (!ext) {
      throw new Error("Invalid file type. Supported formats: PNG, JPG/JPEG, WebP, SVG.");
    }

    // 3. Inspect magic bytes for image integrity
    if (mimeType.includes("png")) {
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      if (!isPng) throw new Error("Security Alert: File signature does not match valid PNG.");
    } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      if (!isJpg) throw new Error("Security Alert: File signature does not match valid JPEG.");
    }

    // 4. Generate safe unique filename
    const sanitizedBase = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `${category}-${sanitizedBase || "brand"}-${Date.now()}${ext}`;
    const destinationPath = path.join(UPLOAD_DIR, filename);

    // 5. Write file safely to public storage
    fs.writeFileSync(destinationPath, buffer);
    const publicUrl = `/uploads/branding/${filename}`;

    // 6. Record upload in audit history
    const auditEntry: BrandingAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: "LOGO_UPLOAD",
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      fieldChanged: category,
      previousValue: null,
      newValue: publicUrl,
      ipAddress: context?.ipAddress || "127.0.0.1",
      userAgent: context?.userAgent || "Internal Browser",
      createdAt: new Date().toISOString(),
    };

    try {
      const existingLogs = this.getAuditHistory(200);
      fs.writeFileSync(AUDIT_FILE, JSON.stringify([auditEntry, ...existingLogs], null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to append upload audit entry:", e);
    }

    return { url: publicUrl, filename };
  }
}

export const brandingService = BrandingService.getInstance();
