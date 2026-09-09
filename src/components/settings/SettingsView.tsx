"use client";

import React from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoreProfileForm } from "./StoreProfileForm";
import { StoreResetDataCard } from "./StoreResetDataCard";

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useAdminStore();

  const handleReset = () => {
    if (
      confirm(
        "Reset all store data back to initial factory demo seed? Any products or orders added in this session will be reset."
      )
    ) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Store Settings & Info"
        description="Configure ATM Crackers Sivakasi enterprise profile, GSTIN details, and billing policies."
      />

      <StoreProfileForm
        settings={settings}
        onSave={updateSettings}
      />

      <StoreResetDataCard onReset={handleReset} />
    </div>
  );
};
