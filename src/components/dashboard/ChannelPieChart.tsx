"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChannelPieChartProps {
  onlineCount: number;
  posCount: number;
}

export const ChannelPieChart: React.FC<ChannelPieChartProps> = ({
  onlineCount,
  posCount,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const channelData = [
    { name: "Online Orders", value: onlineCount || 1, color: "#D32F2F" },
    { name: "POS Counter Sales", value: posCount || 1, color: "#F59E0B" },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Sales Channel Split</h3>
        <p className="text-xs text-slate-400 mb-2">Online store bookings vs POS billing</p>
      </div>

      <div className="h-48 w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Online: {onlineCount}</span>
        <span>POS Counter: {posCount}</span>
      </div>
    </div>
  );
};
