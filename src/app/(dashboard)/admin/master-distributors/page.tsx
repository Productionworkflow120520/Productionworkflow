"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function AdminMasterDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="MASTER_DISTRIBUTOR"
      title="Master Distributors"
      description="View and onboard Master Distributors in your assigned region."
      canCreate={true}
    />
  );
}
