"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperDistributorDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="DISTRIBUTOR"
      title="Distributors"
      description="Create and oversee Distributors operating across your territory network."
      canCreate={true}
    />
  );
}
