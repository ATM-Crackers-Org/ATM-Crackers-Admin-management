"use client";

import React, { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  subtitle?: ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-slate-100 text-slate-500",
  subtitle,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-1.5 rounded-lg ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
      {subtitle && <div className="mt-1.5">{subtitle}</div>}
    </div>
  );
};
