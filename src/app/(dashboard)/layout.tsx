import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.server";
import prisma from "@/lib/db";
import DashboardLayout, { UserSessionData } from "@/components/layout/DashboardLayout";
import { findDemoUser } from "@/lib/demo-data";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        walletAccount: true,
      },
    });
  } catch (_error) {
    // Database offline - fallback to demo user store
  }

  const demoEntry = findDemoUser(session.userId) || findDemoUser(session.email);
  const demoUser = demoEntry?.user;

  const userData: UserSessionData = {
    id: dbUser?.id || demoUser?.id || session.userId,
    userId: dbUser?.userId || demoUser?.userId || session.userId,
    fullName: dbUser?.fullName || demoUser?.fullName || session.fullName || "User",
    email: dbUser?.email || demoUser?.email || session.email || "",
    role: (dbUser?.role as UserSessionData["role"]) || (demoUser?.role as UserSessionData["role"]) || (session.role as UserSessionData["role"]),
    businessName: dbUser?.businessName || demoUser?.businessName,
    walletBalance: dbUser?.walletAccount?.balance
      ? Number(dbUser.walletAccount.balance)
      : (demoUser?.walletBalance ?? 0),
    reservedBalance: dbUser?.walletAccount?.reservedBalance
      ? Number(dbUser.walletAccount.reservedBalance)
      : (demoUser?.reservedBalance ?? 0),
  };

  return <DashboardLayout user={userData}>{children}</DashboardLayout>;
}
