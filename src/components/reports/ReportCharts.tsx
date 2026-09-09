"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const MONTHLY_SALES_DATA = [
  { month: "Jan", sales: 120000 },
  { month: "Feb", sales: 95000 },
  { month: "Mar", sales: 140000 },
  { month: "Apr", sales: 190000 },
  { month: "May", sales: 260000 },
  { month: "Jun", sales: 340000 },
];

const CATEGORY_SHARE_DATA = [
  { name: "One Sound Crackers", value: 38, color: "#D32F2F" },
  { name: "Bombs & Heavy", value: 24, color: "#EA580C" },
  { name: "Sky Shots", value: 20, color: "#F59E0B" },
  { name: "Flower Pots & Chakkars", value: 12, color: "#10B981" },
  { name: "Gift Boxes", value: 6, color: "#6366F1" },
];

export const ReportCharts: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-4">
          Monthly Revenue Growth
        </h3>
        <div className="h-64 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SALES_DATA}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }}
                />
                <Bar dataKey="sales" fill="#D32F2F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-4">
          Sales Share by Category
        </h3>
        <div className="h-64 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SHARE_DATA}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_SHARE_DATA.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, "Share"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
