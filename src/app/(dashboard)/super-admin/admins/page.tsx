"use client";

import React from "react";
import { HierarchyUserManagement } from "@/components/users/HierarchyUserManagement";

export default function SuperAdminAdminsPage() {
  return (
    <HierarchyUserManagement
      targetRole="ADMIN"
      title="Regional Admins"
      description="Manage zonal and regional administrative accounts authorized for network operations."
      canCreate={true}
    />
  );
}
