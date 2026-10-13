"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperAdminDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="DISTRIBUTOR"
      title="Distributors"
      description="Manage area distributors managing active retail merchant networks and float distribution."
      canCreate={true}
    />
  );
}
