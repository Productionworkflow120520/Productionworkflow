"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BrandingSettingsManager } from "@/components/branding/BrandingSettingsManager";

export default function AdminBrandingPage() {
  return (
    <DashboardLayout
      role="ADMIN"
      title="Branding & Identity Studio"
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Branding Studio" },
      ]}
      user={{
        id: "demo-user-admin-1",
        userId: "RP-AD-0001",
        fullName: "Regional Administrator",
        email: "admin1@rechargepro.in",
        role: "ADMIN",
      }}
    >
      <div className="max-w-7xl mx-auto py-4">
        <BrandingSettingsManager userRole="ADMIN" />
      </div>
    </DashboardLayout>
  );
}
