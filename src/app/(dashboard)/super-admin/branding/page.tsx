"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BrandingSettingsManager } from "@/components/branding/BrandingSettingsManager";

export default function SuperAdminBrandingPage() {
  return (
    <DashboardLayout
      role="SUPER_ADMIN"
      title="Branding & Identity Studio"
      breadcrumbs={[
        { label: "Dashboard", href: "/super-admin" },
        { label: "Settings", href: "/super-admin/settings" },
        { label: "Branding Studio" },
      ]}
      user={{
        id: "demo-user-super-admin",
        userId: "RP-SA-0001",
        fullName: "Super Administrator",
        email: "admin@rechargepro.in",
        role: "SUPER_ADMIN",
      }}
    >
      <div className="max-w-7xl mx-auto py-4">
        <BrandingSettingsManager userRole="SUPER_ADMIN" />
      </div>
    </DashboardLayout>
  );
}
