"use client";

import React, { useEffect, useState } from "react";
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
  maxWidth = "md",
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const variantStyles = {
    danger: {
      badge: "bg-red-50 text-red-600 border border-red-200/60",
      btn: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 focus:ring-red-500",
      defaultIcon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      badge: "bg-amber-50 text-amber-600 border border-amber-200/60",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 focus:ring-amber-500",
      defaultIcon: <AlertCircle className="w-5 h-5 text-amber-600" />,
    },
    info: {
      badge: "bg-blue-50 text-blue-600 border border-blue-200/60",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 focus:ring-blue-500",
      defaultIcon: <Info className="w-5 h-5 text-blue-600" />,
    },
    primary: {
      badge: "bg-slate-100 text-slate-800 border border-slate-200",
      btn: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 focus:ring-slate-700",
      defaultIcon: <Info className="w-5 h-5 text-slate-800" />,
    },
    success: {
      badge: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 focus:ring-emerald-500",
      defaultIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${currentVariant.badge}`}>
              {icon || currentVariant.defaultIcon}
            </div>
            <div>
              <h3
                id="confirmation-modal-title"
                className="font-bold text-base text-slate-900"
              >
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Message */}
        <div className="px-5 py-2">
          {typeof message === "string" ? (
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          ) : (
            message
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 p-5 pt-4 border-t border-slate-100 bg-slate-50/50 mt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${currentVariant.btn}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
