"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperDistributorMasterDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="MASTER_DISTRIBUTOR"
      title="Master Distributors"
      description="Create and manage authorized Master Distributors under your Super Distribution network."
      canCreate={true}
    />
  );
}
