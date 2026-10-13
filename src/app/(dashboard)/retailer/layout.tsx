import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.server";
import { getRoleDashboardPath } from "@/lib/auth";

export default async function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "RETAILER") {
    redirect(getRoleDashboardPath(session.role));
  }

  return <>{children}</>;
}
