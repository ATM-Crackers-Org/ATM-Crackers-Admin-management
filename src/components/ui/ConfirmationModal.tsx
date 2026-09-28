"use client";

import React, { useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Loader2, X } from "lucide-react";

export type ConfirmationVariant = "danger" | "warning" | "info" | "primary" | "success";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const variantMap = {
  danger:  { btn: "bg-red-600 hover:bg-red-700 text-white",   icon: <AlertTriangle className="w-4 h-4 text-red-600" /> },
  warning: { btn: "bg-amber-500 hover:bg-amber-600 text-white", icon: <AlertCircle className="w-4 h-4 text-amber-500" /> },
  info:    { btn: "bg-blue-600 hover:bg-blue-700 text-white",  icon: <Info className="w-4 h-4 text-blue-600" /> },
  primary: { btn: "bg-slate-900 hover:bg-slate-800 text-white", icon: <Info className="w-4 h-4 text-slate-700" /> },
  success: { btn: "bg-green-600 hover:bg-green-700 text-white", icon: <CheckCircle2 className="w-4 h-4 text-green-600" /> },
};

const widthMap = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading: externalLoading = false,
  icon,
  maxWidth = "sm",
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const loading = externalLoading || internalLoading;
  const style = variantMap[variant] ?? variantMap.danger;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen || loading) return;
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") { e.preventDefault(); handleConfirm(); }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !loading && onClose()}
      />

      {/* Dialog */}
      <div className={`relative w-full ${widthMap[maxWidth]} bg-white rounded-xl shadow-lg border border-slate-200 z-10 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="shrink-0">{icon ?? style.icon}</span>
            <h3 id="confirm-title" className="font-semibold text-[14px] text-slate-900">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          {typeof message === "string" ? (
            <p className="text-[13px] text-slate-500 leading-relaxed">{message}</p>
          ) : (
            <div className="text-[13px] text-slate-500">{message}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${style.btn}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
