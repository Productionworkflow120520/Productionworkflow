"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function MasterDistributorRetailersPage() {
  return (
    <HierarchyUserManagement
      targetRole="RETAILER"
      title="Retail Outlets"
      description="Create and monitor direct and downline retail agents conducting transactions."
      canCreate={true}
    />
  );
}
