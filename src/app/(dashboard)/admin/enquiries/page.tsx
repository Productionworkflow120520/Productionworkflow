"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EnquiriesManagerView } from "@/components/enquiries/EnquiriesManagerView";

export default function AdminEnquiriesPage() {
  return (
    <DashboardLayout
      role="ADMIN"
      title="Enquiries & Leads Management"
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Enquiries & Leads" },
      ]}
    >
      <EnquiriesManagerView currentRole="ADMIN" />
    </DashboardLayout>
  );
}
