"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperAdminMasterDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="MASTER_DISTRIBUTOR"
      title="Master Distributors"
      description="Manage district hub operators and master distributors managing territory distribution networks."
      canCreate={true}
    />
  );
}
