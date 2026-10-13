"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperDistributorRetailersPage() {
  return (
    <HierarchyUserManagement
      targetRole="RETAILER"
      title="Retail Outlets"
      description="Create and monitor retail merchants in your hierarchy delivering customer transactions."
      canCreate={true}
    />
  );
}
