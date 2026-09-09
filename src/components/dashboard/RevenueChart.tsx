"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data?: { day: string; revenue: number; orders: number }[];
}

const DEFAULT_DATA = [
  { day: "Mon", revenue: 42000, orders: 8 },
  { day: "Tue", revenue: 58000, orders: 12 },
  { day: "Wed", revenue: 35000, orders: 6 },
  { day: "Thu", revenue: 76000, orders: 15 },
  { day: "Fri", revenue: 94000, orders: 20 },
  { day: "Sat", revenue: 145000, orders: 28 },
  { day: "Sun", revenue: 182000, orders: 34 },
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = DEFAULT_DATA }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Weekly Revenue Inflow</h3>
          <p className="text-xs text-slate-400">Total bookings and in-store cash flow</p>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
          This Week
        </div>
      </div>

      <div className="h-64 w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#D32F2F"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
