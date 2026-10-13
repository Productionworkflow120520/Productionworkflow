"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function MasterDistributorDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="DISTRIBUTOR"
      title="Distributors"
      description="Create and manage authorized Distributors operating within your Master Distribution territory."
      canCreate={true}
    />
  );
}
