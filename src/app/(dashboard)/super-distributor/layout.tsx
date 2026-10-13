import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.server";
import { getRoleDashboardPath } from "@/lib/auth";

export default async function SuperDistributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "SUPER_DISTRIBUTOR") {
    redirect(getRoleDashboardPath(session.role));
  }

  return <>{children}</>;
}
