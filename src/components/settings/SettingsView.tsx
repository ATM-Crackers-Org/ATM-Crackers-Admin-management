"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoreProfileForm } from "./StoreProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-4 ">
      <PageHeader
        title="Store Settings"
        description="Configure ATM Crackers Sivakasi store profile, GSTIN details, and security passwords."
      />
      <div className="w-full mx-auto flex flex-col gap-4 overflow-y-auto mb-3">

      <StoreProfileForm />

      <ChangePasswordForm />
      </div>
     
    </div>
  );
};
