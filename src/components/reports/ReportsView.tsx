"use client";

import React from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Download } from "lucide-react";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportCharts } from "./ReportCharts";

export const ReportsView: React.FC = () => {
  const { orders } = useAdminStore();

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== "CANCELLED" ? o.grandTotal : 0),
    0
  );
  const totalOrdersCount = orders.length;
  const avgOrderValue =
    totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Order Number,Customer,Channel,Amount,Status,Date\n" +
      orders
        .map(
          (o) =>
            `"${o.orderNumber}","${o.customerName}","${o.channel}","${o.grandTotal}","${o.status}","${o.createdAt}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "atm_crackers_sales_report_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Reports & Analytics"
        description="Real-time financial performance, product popularity indices, and channel revenue."
        actions={
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Sales CSV</span>
          </button>
        }
      />

      <ReportSummaryCards
        totalRevenue={totalRevenue}
        totalOrdersCount={totalOrdersCount}
        avgOrderValue={avgOrderValue}
      />

      <ReportCharts />
    </div>
  );
};
