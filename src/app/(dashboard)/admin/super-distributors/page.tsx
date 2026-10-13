"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function AdminSuperDistributorsPage() {
  return (
    <HierarchyUserManagement
      targetRole="SUPER_DISTRIBUTOR"
      title="Super Distributors"
      description="View and manage authorized Super Distributors assigned under your administrative zone."
      canCreate={true}
    />
  );
}
