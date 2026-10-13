import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.server";
import { getRoleDashboardPath } from "@/lib/auth";

export default async function MasterDistributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "MASTER_DISTRIBUTOR") {
    redirect(getRoleDashboardPath(session.role));
  }

  return <>{children}</>;
}
