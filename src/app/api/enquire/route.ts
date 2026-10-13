import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "enquiries.json");

const SEED_ENQUIRIES = [
  {
    id: "ENQ-1791869001-1001",
    name: "Rameshwar Kulkarni",
    mobile: "9820112233",
    role: "Super Admin",
    city: "Mumbai, Maharashtra",
    message: "Seeking state-level white-label enterprise deployment with multi-switch routing.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "NEW_LEAD",
    notes: "Requires meeting with technical team.",
  },
  {
    id: "ENQ-1791869002-1002",
    name: "Anand Verma",
    mobile: "9811223344",
    role: "Admin",
    city: "Delhi & NCR",
    message: "Looking for administrative franchise rights and regional distributor onboarding control.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "CONTACTED",
    notes: "Followed up via phone. Interested in Delhi territory.",
  },
  {
    id: "ENQ-1791869003-1003",
    name: "Vikram Singhania",
    mobile: "9734567890",
    role: "Super Distributor",
    city: "Jaipur, Rajasthan",
    message: "Already manage 80+ retailers in Rajasthan, want to switch to Recharge Pro switch.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "ONBOARDED",
    notes: "Account created under DST-SD-9012.",
  },
  {
    id: "ENQ-1791869004-1004",
    name: "Pooja Deshmukh",
    mobile: "9867231230",
    role: "Distributor",
    city: "Pune, Maharashtra",
    message: "Need distributor portal for onboarding grocery shops for mobile recharges and BBPS electricity bills.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "NEW_LEAD",
    notes: "Requested commission chart.",
  },
  {
    id: "ENQ-1791869005-1005",
    name: "Mohit Agarwal",
    mobile: "7045470545",
    role: "Retailer",
    city: "Indore, Madhya Pradesh",
    message: "Starting new mobile shop, need immediate float activation and bio-metric device support.",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: "NEW_LEAD",
    notes: "Mobile number verified.",
  },
];

function readEnquiries(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(SEED_ENQUIRIES, null, 2), "utf-8");
    return SEED_ENQUIRIES;
  } catch {
    return SEED_ENQUIRIES;
  }
}

function writeEnquiries(items: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(items.slice(0, 200), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write enquiries store:", err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    let items = readEnquiries();

    if (role !== "ALL") {
      items = items.filter((i) => i.role?.toLowerCase() === role.toLowerCase());
    }

    if (status !== "ALL") {
      items = items.filter((i) => i.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.name?.toLowerCase().includes(search) ||
          i.mobile?.includes(search) ||
          i.city?.toLowerCase().includes(search) ||
          i.id?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      enquiries: items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mobile, role, service, message, city } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    const cleanMobile = (mobile || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const enquiry = {
      id: `ENQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      mobile: cleanMobile,
      role: role || "Retailer",
      service: service || "All-in-one Recharge",
      city: (city || "").trim() || "Unspecified",
      message: (message || "").trim(),
      createdAt: new Date().toISOString(),
      status: "NEW_LEAD",
      notes: "",
    };

    const existing = readEnquiries();
    existing.unshift(enquiry);
    writeEnquiries(existing);

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      message: "Thank you for connecting with us! Our partnership team will contact you shortly.",
      data: enquiry,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit enquiry." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Enquiry ID is required." },
        { status: 400 }
      );
    }

    const items = readEnquiries();
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Enquiry record not found." },
        { status: 404 }
      );
    }

    if (status) {
      items[index].status = status;
    }
    if (notes !== undefined) {
      items[index].notes = notes;
    }
    items[index].updatedAt = new Date().toISOString();

    writeEnquiries(items);

    return NextResponse.json({
      success: true,
      message: "Enquiry updated successfully.",
      data: items[index],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update enquiry." },
      { status: 500 }
    );
  }
}
