"use client";

import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};
