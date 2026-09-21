"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoreProfileForm } from "./StoreProfileForm";
import { StoreResetDataCard } from "./StoreResetDataCard";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { RotateCcw } from "lucide-react";

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useAdminStore();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleConfirmReset = () => {
    resetToDefaultData();
    setShowResetModal(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Store Settings & Security"
        description="Configure ATM Crackers Sivakasi enterprise profile, GSTIN details, security passwords, and system state."
      />

      {/* Store Profile Section */}
      <StoreProfileForm
        settings={settings}
        onSave={updateSettings}
      />

      {/* Security: Change Password Section */}
      <ChangePasswordForm />

      {/* Danger Zone: Reset Data */}
      <StoreResetDataCard onReset={() => setShowResetModal(true)} />

      {/* Reusable Confirmation Modal for Store Reset */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        title="Reset Store Demo Data"
        message="Are you sure you want to reset all store data back to initial factory demo seed? Any products, orders, or changes created in this session will be reverted."
        confirmText="Reset All Data"
        variant="danger"
        icon={<RotateCcw className="w-5 h-5 text-red-600" />}
      />
    </div>
  );
};
