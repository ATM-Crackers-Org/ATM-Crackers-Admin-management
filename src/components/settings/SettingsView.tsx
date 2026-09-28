"use client";

import React from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoreProfileForm } from "./StoreProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useAdminStore();

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader
        title="Store Settings"
        description="Configure ATM Crackers Sivakasi store profile, GSTIN details, and security passwords."
      />

      {/* Store Profile Section */}
      <StoreProfileForm
        settings={settings}
        onSave={updateSettings}
      />

      {/* Security: Change Password Section */}
      <ChangePasswordForm />
    </div>
  );
};
