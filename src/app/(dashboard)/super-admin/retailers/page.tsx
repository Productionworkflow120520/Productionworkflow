"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperAdminRetailersPage() {
  return (
    <HierarchyUserManagement
      targetRole="RETAILER"
      title="Retail Merchants"
      description="Manage storefront retail agents providing customer recharge, utility bills, and financial services."
      canCreate={true}
    />
  );
}
