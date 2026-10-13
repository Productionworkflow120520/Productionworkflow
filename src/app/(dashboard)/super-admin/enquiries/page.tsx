"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EnquiriesManagerView } from "@/components/enquiries/EnquiriesManagerView";

export default function SuperAdminEnquiriesPage() {
  return (
    <DashboardLayout
      role="SUPER_ADMIN"
      title="Enquiries & Leads Management"
      breadcrumbs={[
        { label: "Dashboard", href: "/super-admin" },
        { label: "Enquiries & Leads" },
      ]}
    >
      <EnquiriesManagerView currentRole="SUPER_ADMIN" />
    </DashboardLayout>
  );
}
