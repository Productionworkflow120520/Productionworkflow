import { PrismaClient, UserRole, UserStatus, KycStatus, TransactionStatus, TransactionType, CommissionType, WalletRequestType, WalletRequestStatus, LedgerEntryType, TicketPriority, TicketStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateId(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

async function main() {
  console.log("🌱 Starting Recharge Pro database seed...");

  // 1. SYSTEM SETTINGS
  console.log("⚙️  Seeding system settings...");
  const defaultSettings = [
    {
      key: "brand_name",
      value: "Recharge Pro",
      category: "branding",
      label: "Brand Name",
    },
    {
      key: "brand_logo",
      value: "/logo.png",
      category: "branding",
      label: "Brand Logo URL",
    },
    {
      key: "theme_primary",
      value: "#1e3a5f",
      category: "branding",
      label: "Theme Primary Color",
    },
    {
      key: "theme_secondary",
      value: "#2563eb",
      category: "branding",
      label: "Theme Secondary Color",
    },
    {
      key: "maintenance_mode",
      value: false,
      category: "features",
      label: "Maintenance Mode",
    },
    {
      key: "session_timeout",
      value: 86400,
      category: "security",
      label: "Session Timeout (seconds)",
    },
    {
      key: "max_login_attempts",
      value: 5,
      category: "security",
      label: "Max Login Attempts",
    },
    {
      key: "services_enabled",
      value: ["MOBILE_RECHARGE", "DTH_RECHARGE", "BBPS_PAYMENT"],
      category: "features",
      label: "Enabled Services",
    },
    {
      key: "aeps_enabled",
      value: false,
      category: "features",
      label: "AEPS Enabled",
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
        category: setting.category,
        label: setting.label,
      },
    });
  }

  // 2. MASTER ADMIN USER
  console.log("👑 Seeding MASTER_ADMIN user...");
  const masterAdminPassword = process.env.MASTER_ADMIN_PASSWORD || "Admin@123456";
  const masterAdminHash = await bcrypt.hash(masterAdminPassword, 12);

  const masterAdmin = await prisma.user.upsert({
    where: { userId: "PM-MA-0001" },
    update: {
      passwordHash: masterAdminHash,
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
    },
    create: {
      userId: "PM-MA-0001",
      username: "masteradmin",
      email: process.env.MASTER_ADMIN_EMAIL || "admin@rechargepro.in",
      mobile: process.env.MASTER_ADMIN_MOBILE || "9999999999",
      passwordHash: masterAdminHash,
      fullName: "Master Administrator",
      role: UserRole.MASTER_ADMIN,
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      businessName: "Recharge Pro Technologies Pvt Ltd",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  });

  // Ensure Master Admin wallet exists
  await prisma.walletAccount.upsert({
    where: { userId: masterAdmin.id },
    update: {},
    create: {
      userId: masterAdmin.id,
      balance: new Prisma.Decimal(0),
      currency: "INR",
      isActive: true,
    },
  });

  // 3. DEMO ADMIN USERS (2)
  console.log("👔 Seeding ADMIN users...");
  const demoAdminPasswordHash = await bcrypt.hash("Demo@12345", 12);

  const admin1 = await prisma.user.upsert({
    where: { userId: "PM-AD-0001" },
    update: {
      parentId: masterAdmin.id,
      passwordHash: demoAdminPasswordHash,
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
    },
    create: {
      userId: "PM-AD-0001",
      username: "admin1",
      email: "admin1@paymatrix.in",
      mobile: "9888800001",
      passwordHash: demoAdminPasswordHash,
      fullName: "Rahul Sharma",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      parentId: masterAdmin.id,
      businessName: "Sharma Financial Services",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    },
  });

  await prisma.walletAccount.upsert({
    where: { userId: admin1.id },
    update: {},
    create: {
      userId: admin1.id,
      balance: new Prisma.Decimal(100000),
      currency: "INR",
      isActive: true,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { userId: "PM-AD-0002" },
    update: {
      parentId: masterAdmin.id,
      passwordHash: demoAdminPasswordHash,
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
    },
    create: {
      userId: "PM-AD-0002",
      username: "admin2",
      email: "admin2@paymatrix.in",
      mobile: "9888800002",
      passwordHash: demoAdminPasswordHash,
      fullName: "Priya Patel",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      parentId: masterAdmin.id,
      businessName: "Patel Fintech Solutions",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
    },
  });

  await prisma.walletAccount.upsert({
    where: { userId: admin2.id },
    update: {},
    create: {
      userId: admin2.id,
      balance: new Prisma.Decimal(100000),
      currency: "INR",
      isActive: true,
    },
  });

  // 4. DEMO DISTRIBUTOR USERS (4)
  console.log("🏢 Seeding DISTRIBUTOR users...");
  const distributorData = [
    {
      userId: "PM-DT-0001",
      username: "amitkumar",
      email: "dist1@paymatrix.in",
      mobile: "9877700001",
      fullName: "Amit Kumar",
      parentId: admin1.id,
      businessName: "Kumar Telecom Agency",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
    },
    {
      userId: "PM-DT-0002",
      username: "sanjaygupta",
      email: "dist2@paymatrix.in",
      mobile: "9877700002",
      fullName: "Sanjay Gupta",
      parentId: admin1.id,
      businessName: "Gupta Communications",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
    },
    {
      userId: "PM-DT-0003",
      username: "meerareddy",
      email: "dist3@paymatrix.in",
      mobile: "9877700003",
      fullName: "Meera Reddy",
      parentId: admin2.id,
      businessName: "Reddy Digital Hub",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
    },
    {
      userId: "PM-DT-0004",
      username: "vikramsingh",
      email: "dist4@paymatrix.in",
      mobile: "9877700004",
      fullName: "Vikram Singh",
      parentId: admin2.id,
      businessName: "Singh Fintech Network",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
    },
  ];

  const distributors = [];
  for (const dist of distributorData) {
    const user = await prisma.user.upsert({
      where: { userId: dist.userId },
      update: {
        parentId: dist.parentId,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
      },
      create: {
        userId: dist.userId,
        username: dist.username,
        email: dist.email,
        mobile: dist.mobile,
        passwordHash: demoAdminPasswordHash,
        fullName: dist.fullName,
        role: UserRole.DISTRIBUTOR,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
        parentId: dist.parentId,
        businessName: dist.businessName,
        city: dist.city,
        state: dist.state,
        pincode: dist.pincode,
      },
    });

    await prisma.walletAccount.upsert({
      where: { userId: user.id },
      update: { balance: new Prisma.Decimal(50000) },
      create: {
        userId: user.id,
        balance: new Prisma.Decimal(50000),
        currency: "INR",
        isActive: true,
      },
    });

    distributors.push(user);
  }

  // 5. DEMO RETAILER USERS (8)
  console.log("🏪 Seeding RETAILER users...");
  const retailerData = [
    {
      userId: "PM-RT-0001",
      username: "retailer1",
      email: "ret1@paymatrix.in",
      mobile: "9866600001",
      fullName: "Ramesh Verma",
      parentId: distributors[0].id,
      businessName: "Verma General Store & Recharge",
      city: "Kanpur",
      state: "Uttar Pradesh",
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      balance: 12500,
    },
    {
      userId: "PM-RT-0002",
      username: "retailer2",
      email: "ret2@paymatrix.in",
      mobile: "9866600002",
      fullName: "Anil Tiwari",
      parentId: distributors[0].id,
      businessName: "Tiwari Mobile Center",
      city: "Varanasi",
      state: "Uttar Pradesh",
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      balance: 8000,
    },
    {
      userId: "PM-RT-0003",
      username: "retailer3",
      email: "ret3@paymatrix.in",
      mobile: "9866600003",
      fullName: "Pooja Sharma",
      parentId: distributors[1].id,
      businessName: "Pooja Cyber Cafe",
      city: "Kota",
      state: "Rajasthan",
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      balance: 14200,
    },
    {
      userId: "PM-RT-0004",
      username: "retailer4",
      email: "ret4@paymatrix.in",
      mobile: "9866600004",
      fullName: "Sunil Choudhary",
      parentId: distributors[1].id,
      businessName: "Choudhary Kirana & Pay",
      city: "Jodhpur",
      state: "Rajasthan",
      status: UserStatus.PENDING_APPROVAL,
      kycStatus: KycStatus.UNDER_REVIEW,
      balance: 5000,
    },
    {
      userId: "PM-RT-0005",
      username: "retailer5",
      email: "ret5@paymatrix.in",
      mobile: "9866600005",
      fullName: "Kavitha Rao",
      parentId: distributors[2].id,
      businessName: "Kavitha Multi-Services",
      city: "Warangal",
      state: "Telangana",
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      balance: 9500,
    },
    {
      userId: "PM-RT-0006",
      username: "retailer6",
      email: "ret6@paymatrix.in",
      mobile: "9866600006",
      fullName: "Rajesh Naidu",
      parentId: distributors[2].id,
      businessName: "Naidu E-Seva Kendra",
      city: "Karimnagar",
      state: "Telangana",
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.SUBMITTED,
      balance: 6200,
    },
    {
      userId: "PM-RT-0007",
      username: "retailer7",
      email: "ret7@paymatrix.in",
      mobile: "9866600007",
      fullName: "Deepak Patil",
      parentId: distributors[3].id,
      businessName: "Patil Online Point",
      city: "Nashik",
      state: "Maharashtra",
      status: UserStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      balance: 11000,
    },
    {
      userId: "PM-RT-0008",
      username: "retailer8",
      email: "ret8@paymatrix.in",
      mobile: "9866600008",
      fullName: "Santosh Deshmukh",
      parentId: distributors[3].id,
      businessName: "Deshmukh Xerox & Pay",
      city: "Solapur",
      state: "Maharashtra",
      status: UserStatus.PENDING_APPROVAL,
      kycStatus: KycStatus.NOT_SUBMITTED,
      balance: 5000,
    },
  ];

  const retailers = [];
  for (const ret of retailerData) {
    const user = await prisma.user.upsert({
      where: { userId: ret.userId },
      update: {
        parentId: ret.parentId,
        status: ret.status,
        kycStatus: ret.kycStatus,
      },
      create: {
        userId: ret.userId,
        username: ret.username,
        email: ret.email,
        mobile: ret.mobile,
        passwordHash: demoAdminPasswordHash,
        fullName: ret.fullName,
        role: UserRole.RETAILER,
        status: ret.status,
        kycStatus: ret.kycStatus,
        parentId: ret.parentId,
        businessName: ret.businessName,
        city: ret.city,
        state: ret.state,
        pincode: "400001",
      },
    });

    await prisma.walletAccount.upsert({
      where: { userId: user.id },
      update: { balance: new Prisma.Decimal(ret.balance) },
      create: {
        userId: user.id,
        balance: new Prisma.Decimal(ret.balance),
        currency: "INR",
        isActive: true,
      },
    });

    retailers.push(user);
  }

  // 6. COMMISSION RULES
  console.log("📈 Seeding commission rules...");
  const ruleMobile = await prisma.commissionRule.upsert({
    where: { id: "rule-mobile-default" },
    update: {},
    create: {
      id: "rule-mobile-default",
      name: "Default Mobile Recharge Commission",
      serviceType: TransactionType.MOBILE_RECHARGE,
      commissionType: CommissionType.PERCENTAGE,
      retailerRate: new Prisma.Decimal(2.5),
      distributorRate: new Prisma.Decimal(0.5),
      adminRate: new Prisma.Decimal(0.25),
      masterAdminRate: new Prisma.Decimal(0.1),
      minAmount: new Prisma.Decimal(10),
      maxAmount: new Prisma.Decimal(5000),
      isActive: true,
      priority: 1,
    },
  });

  const ruleDth = await prisma.commissionRule.upsert({
    where: { id: "rule-dth-default" },
    update: {},
    create: {
      id: "rule-dth-default",
      name: "Default DTH Recharge Commission",
      serviceType: TransactionType.DTH_RECHARGE,
      commissionType: CommissionType.PERCENTAGE,
      retailerRate: new Prisma.Decimal(3.0),
      distributorRate: new Prisma.Decimal(0.75),
      adminRate: new Prisma.Decimal(0.3),
      masterAdminRate: new Prisma.Decimal(0.15),
      minAmount: new Prisma.Decimal(50),
      maxAmount: new Prisma.Decimal(10000),
      isActive: true,
      priority: 1,
    },
  });

  const ruleBbps = await prisma.commissionRule.upsert({
    where: { id: "rule-bbps-default" },
    update: {},
    create: {
      id: "rule-bbps-default",
      name: "Default BBPS Payment Commission",
      serviceType: TransactionType.BBPS_PAYMENT,
      commissionType: CommissionType.FIXED,
      retailerRate: new Prisma.Decimal(5.0),
      distributorRate: new Prisma.Decimal(2.0),
      adminRate: new Prisma.Decimal(1.0),
      masterAdminRate: new Prisma.Decimal(0.5),
      minAmount: new Prisma.Decimal(100),
      maxAmount: new Prisma.Decimal(50000),
      isActive: true,
      priority: 1,
    },
  });

  const ruleDmt = await prisma.commissionRule.upsert({
    where: { id: "rule-dmt-default" },
    update: {},
    create: {
      id: "rule-dmt-default",
      name: "Default Domestic Money Transfer (DMT) Margin",
      serviceType: TransactionType.DMT_TRANSFER,
      commissionType: CommissionType.PERCENTAGE,
      retailerRate: new Prisma.Decimal(0.40), // 0.40%
      distributorRate: new Prisma.Decimal(0.15), // 0.15%
      adminRate: new Prisma.Decimal(0.10), // 0.10%
      masterAdminRate: new Prisma.Decimal(0.05), // 0.05%
      minAmount: new Prisma.Decimal(100),
      maxAmount: new Prisma.Decimal(25000),
      isActive: true,
      priority: 1,
    },
  });

  // Seed sample DMT Remitter and Beneficiaries
  console.log("💸 Seeding Demo DMT Remitter & Beneficiaries...");
  const sampleSender = await prisma.dmtSender.upsert({
    where: { mobile: "9820123456" },
    update: {},
    create: {
      senderId: "SMR-20261012-0001",
      mobile: "9820123456",
      name: "Ramesh Chand Sharma",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isKycVerified: true,
      monthlyLimitPaise: BigInt(2500000), // ₹25,000
      usedLimitPaise: BigInt(350000), // ₹3,500 consumed
      status: "ACTIVE",
    },
  });

  await prisma.dmtBeneficiary.upsert({
    where: {
      senderId_accountNumber_ifsc: {
        senderId: sampleSender.id,
        accountNumber: "987654321012",
        ifsc: "SBIN0001234",
      },
    },
    update: {},
    create: {
      beneficiaryId: "BEN-20261012-0001",
      senderId: sampleSender.id,
      accountNumber: "987654321012",
      ifsc: "SBIN0001234",
      bankName: "State Bank of India",
      recipientName: "Sunita Ramesh Sharma",
      isVerified: true,
      pennyDropRef: "PENNY-VERIFIED-01",
      status: "ACTIVE",
    },
  });

  await prisma.dmtBeneficiary.upsert({
    where: {
      senderId_accountNumber_ifsc: {
        senderId: sampleSender.id,
        accountNumber: "50100234567891",
        ifsc: "HDFC0000128",
      },
    },
    update: {},
    create: {
      beneficiaryId: "BEN-20261012-0002",
      senderId: sampleSender.id,
      accountNumber: "50100234567891",
      ifsc: "HDFC0000128",
      bankName: "HDFC Bank",
      recipientName: "Aakash Ramesh Sharma",
      isVerified: false,
      status: "ACTIVE",
    },
  });

  // 7. DEMO TRANSACTIONS (100 over last 30 days)
  console.log("💳 Seeding 100 demo transactions...");
  const mobileOps = ["JIO", "AIRTEL", "VI", "BSNL"];
  const dthOps = ["TATA_PLAY", "AIRTEL_DTH", "DISH_TV", "SUN_DIRECT"];
  const bbpsCategories = ["ELECTRICITY", "WATER", "GAS", "BROADBAND"];

  const activeRetailers = retailers.filter((r) => r.status === UserStatus.ACTIVE);
  const existingTxnCount = await prisma.transaction.count();

  if (existingTxnCount < 50) {
    for (let i = 1; i <= 100; i++) {
      const retailer = activeRetailers[i % activeRetailers.length];
      const parentDist = distributors.find((d) => d.id === retailer.parentId);
      const parentAdmin = parentDist ? (parentDist.parentId === admin1.id ? admin1 : admin2) : admin1;

      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const txnDate = new Date();
      txnDate.setDate(txnDate.getDate() - daysAgo);

      // Random service type
      const typeRand = Math.random();
      let type: TransactionType = TransactionType.MOBILE_RECHARGE;
      let operator = mobileOps[Math.floor(Math.random() * mobileOps.length)];
      let serviceNumber = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
      let amount = [199, 299, 479, 666, 719, 839][Math.floor(Math.random() * 6)];
      let rule = ruleMobile;

      if (typeRand > 0.4 && typeRand <= 0.75) {
        type = TransactionType.DTH_RECHARGE;
        operator = dthOps[Math.floor(Math.random() * dthOps.length)];
        serviceNumber = `30${Math.floor(10000000 + Math.random() * 90000000)}`;
        amount = [250, 350, 500, 1000, 1500][Math.floor(Math.random() * 5)];
        rule = ruleDth;
      } else if (typeRand > 0.75) {
        type = TransactionType.BBPS_PAYMENT;
        operator = bbpsCategories[Math.floor(Math.random() * bbpsCategories.length)];
        serviceNumber = `CONS-${Math.floor(100000 + Math.random() * 900000)}`;
        amount = [450, 850, 1200, 2400, 3100][Math.floor(Math.random() * 5)];
        rule = ruleBbps;
      }

      // 80% Success, 15% Failed, 5% Pending
      const statusRand = Math.random();
      let status: TransactionStatus = TransactionStatus.SUCCESS;
      let failureReason: string | null = null;

      if (statusRand > 0.8 && statusRand <= 0.95) {
        status = TransactionStatus.FAILED;
        failureReason = "Operator connection timed out";
      } else if (statusRand > 0.95) {
        status = TransactionStatus.PENDING;
      }

      const txnId = `TXN-SEED-${String(i).padStart(5, "0")}`;
      const idempotencyKey = `IDEMP-SEED-${String(i).padStart(5, "0")}`;

      const createdTxn = await prisma.transaction.create({
        data: {
          txnId,
          idempotencyKey,
          userId: retailer.id,
          type,
          status,
          amount: new Prisma.Decimal(amount),
          netAmount: new Prisma.Decimal(amount),
          serviceNumber,
          operator,
          retailerId: retailer.id,
          distributorId: parentDist?.id || null,
          adminId: parentAdmin.id,
          failureReason,
          completedAt: status === TransactionStatus.SUCCESS ? txnDate : null,
          createdAt: txnDate,
          updatedAt: txnDate,
          commissionRuleId: rule.id,
        },
      });

      // Events
      await prisma.transactionEvent.create({
        data: {
          transactionId: createdTxn.id,
          fromStatus: TransactionStatus.INITIATED,
          toStatus: status,
          reason: status === TransactionStatus.SUCCESS ? "Success" : (failureReason || "Pending"),
          actor: retailer.id,
          createdAt: txnDate,
        },
      });

      // Ledger and commissions for successful transactions
      if (status === TransactionStatus.SUCCESS) {
        const retWallet = await prisma.walletAccount.findUnique({
          where: { userId: retailer.id },
        });

        if (retWallet) {
          // Debit ledger entry
          await prisma.ledgerEntry.create({
            data: {
              walletId: retWallet.id,
              userId: retailer.id,
              transactionId: createdTxn.id,
              referenceId: generateId("LEDGER"),
              type: LedgerEntryType.DEBIT,
              amount: new Prisma.Decimal(amount),
              balanceBefore: new Prisma.Decimal(retWallet.balance.toNumber() + amount),
              balanceAfter: retWallet.balance,
              description: `${type} of ₹${amount} for ${serviceNumber}`,
              category: "RECHARGE",
              actor: retailer.userId,
              createdAt: txnDate,
            },
          });
        }

        // Commission calculation
        let retComm = 0;
        let distComm = 0;
        let admComm = 0;

        if (rule.commissionType === CommissionType.PERCENTAGE) {
          retComm = (amount * rule.retailerRate.toNumber()) / 100;
          distComm = (amount * rule.distributorRate.toNumber()) / 100;
          admComm = (amount * rule.adminRate.toNumber()) / 100;
        } else {
          retComm = rule.retailerRate.toNumber();
          distComm = rule.distributorRate.toNumber();
          admComm = rule.adminRate.toNumber();
        }

        // Retailer commission entry
        await prisma.commissionEntry.create({
          data: {
            transactionId: createdTxn.id,
            userId: retailer.id,
            ruleId: rule.id,
            role: UserRole.RETAILER,
            commissionType: rule.commissionType,
            rate: rule.retailerRate,
            baseAmount: new Prisma.Decimal(amount),
            commissionAmount: new Prisma.Decimal(retComm),
            netAmount: new Prisma.Decimal(retComm),
            status: "CREDITED",
            creditedAt: txnDate,
            createdAt: txnDate,
          },
        });

        // Distributor commission entry
        if (parentDist) {
          await prisma.commissionEntry.create({
            data: {
              transactionId: createdTxn.id,
              userId: parentDist.id,
              ruleId: rule.id,
              role: UserRole.DISTRIBUTOR,
              commissionType: rule.commissionType,
              rate: rule.distributorRate,
              baseAmount: new Prisma.Decimal(amount),
              commissionAmount: new Prisma.Decimal(distComm),
              netAmount: new Prisma.Decimal(distComm),
              status: "CREDITED",
              creditedAt: txnDate,
              createdAt: txnDate,
            },
          });
        }

        // Admin commission entry
        await prisma.commissionEntry.create({
          data: {
            transactionId: createdTxn.id,
            userId: parentAdmin.id,
            ruleId: rule.id,
            role: UserRole.ADMIN,
            commissionType: rule.commissionType,
            rate: rule.adminRate,
            baseAmount: new Prisma.Decimal(amount),
            commissionAmount: new Prisma.Decimal(admComm),
            netAmount: new Prisma.Decimal(admComm),
            status: "CREDITED",
            creditedAt: txnDate,
            createdAt: txnDate,
          },
        });
      }
    }
  }

  // 8. WALLET REQUESTS
  console.log("💰 Seeding wallet requests...");
  const sampleWalletRequests = [
    {
      requestId: "WR-SEED-0001",
      userId: retailers[0].id,
      type: WalletRequestType.TOPUP,
      amount: new Prisma.Decimal(10000),
      status: WalletRequestStatus.APPROVED,
      paymentMethod: "IMPS",
      paymentRef: "UTR98765432101",
      bankName: "HDFC Bank",
      approvedBy: admin1.id,
      approvedAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      requestId: "WR-SEED-0002",
      userId: retailers[1].id,
      type: WalletRequestType.TOPUP,
      amount: new Prisma.Decimal(5000),
      status: WalletRequestStatus.PENDING,
      paymentMethod: "UPI",
      paymentRef: "UPI9823471023",
      bankName: "State Bank of India",
      remarks: "Top-up for festival rush",
    },
    {
      requestId: "WR-SEED-0003",
      userId: retailers[2].id,
      type: WalletRequestType.TOPUP,
      amount: new Prisma.Decimal(25000),
      status: WalletRequestStatus.REJECTED,
      paymentMethod: "NEFT",
      paymentRef: "NEFT001928374",
      bankName: "ICICI Bank",
      approvedBy: admin1.id,
      approvedAt: new Date(Date.now() - 1 * 86400000),
      rejectionReason: "UTR reference not found in bank statement",
    },
    {
      requestId: "WR-SEED-0004",
      userId: distributors[0].id,
      type: WalletRequestType.TOPUP,
      amount: new Prisma.Decimal(50000),
      status: WalletRequestStatus.PENDING,
      paymentMethod: "RTGS",
      paymentRef: "RTGS918273645",
      bankName: "Punjab National Bank",
      remarks: "Distributor pool top-up",
    },
  ];

  for (const wr of sampleWalletRequests) {
    await prisma.walletRequest.upsert({
      where: { requestId: wr.requestId },
      update: {},
      create: wr,
    });
  }

  // 9. SUPPORT TICKETS
  console.log("🎫 Seeding support tickets...");
  const sampleTickets = [
    {
      ticketId: "TKT-SEED-0001",
      userId: retailers[0].id,
      category: "TRANSACTION",
      subject: "DTH Recharge failed but amount deducted",
      priority: TicketPriority.HIGH,
      status: TicketStatus.RESOLVED,
      resolution: "Amount has been refunded to wallet",
      resolvedAt: new Date(Date.now() - 2 * 86400000),
      messages: [
        {
          senderId: retailers[0].id,
          senderRole: UserRole.RETAILER,
          message: "Customer paid ₹500 for Tata Play recharge, status failed on operator screen.",
        },
        {
          senderId: admin1.id,
          senderRole: UserRole.ADMIN,
          message: "Verified gateway logs. Reversed ₹500 back to retailer wallet.",
        },
      ],
    },
    {
      ticketId: "TKT-SEED-0002",
      userId: retailers[1].id,
      category: "WALLET",
      subject: "UPI Topup delay",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      messages: [
        {
          senderId: retailers[1].id,
          senderRole: UserRole.RETAILER,
          message: "Transferred ₹5,000 via UPI 20 mins ago, request still in pending state.",
        },
      ],
    },
  ];

  for (const tkt of sampleTickets) {
    const ticket = await prisma.supportTicket.upsert({
      where: { ticketId: tkt.ticketId },
      update: {},
      create: {
        ticketId: tkt.ticketId,
        userId: tkt.userId,
        category: tkt.category,
        subject: tkt.subject,
        priority: tkt.priority,
        status: tkt.status,
        resolution: tkt.resolution,
        resolvedAt: tkt.resolvedAt,
      },
    });

    for (const msg of tkt.messages) {
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: msg.senderId,
          senderRole: msg.senderRole,
          message: msg.message,
        },
      });
    }
  }

  // 10. AUDIT LOGS
  console.log("🛡️ Seeding audit logs...");
  const auditLogs = [
    {
      userId: masterAdmin.id,
      action: "SYSTEM_INITIALIZED",
      entity: "System",
      metadata: { version: "1.0.0", environment: "production" },
    },
    {
      userId: masterAdmin.id,
      action: "COMMISSION_RULE_CREATED",
      entity: "CommissionRule",
      entityId: ruleMobile.id,
      metadata: { ruleName: ruleMobile.name },
    },
    {
      userId: admin1.id,
      action: "WALLET_APPROVED",
      entity: "WalletRequest",
      entityId: "WR-SEED-0001",
      metadata: { amount: 10000, recipient: retailers[0].userId },
    },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  // 11. ANNOUNCEMENTS
  console.log("📢 Seeding announcements...");
  const announcements = [
    {
      title: "Diwali Commission Booster Activated!",
      message: "Earn an extra 0.5% commission on all Mobile and DTH recharges throughout this festive week.",
      type: "info",
      targetRoles: [UserRole.RETAILER, UserRole.DISTRIBUTOR],
    },
    {
      title: "Scheduled Maintenance Window",
      message: "Banking partner BBPS servers will undergo routine maintenance on Sunday from 02:00 AM to 04:00 AM IST.",
      type: "warning",
      targetRoles: [UserRole.MASTER_ADMIN, UserRole.ADMIN, UserRole.DISTRIBUTOR, UserRole.RETAILER],
    },
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({
      data: ann,
    });
  }

  console.log("✅ Recharge Pro Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
