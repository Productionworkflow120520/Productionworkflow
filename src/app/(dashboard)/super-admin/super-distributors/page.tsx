"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperAdminSuperDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="SUPER_DISTRIBUTOR"
      title="Super Distributors"
      description="Manage top-tier distribution heads overseeing master distributor clusters and state networks."
      canCreate={true}
    />
  );
}
