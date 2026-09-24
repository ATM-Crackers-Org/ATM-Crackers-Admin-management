"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/context/admin-store";
import { getOrders } from "@/services/order.service";
import type { Order } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Boxes, Users, AlertTriangle } from "lucide-react";
import { DashboardWelcomeBanner } from "./DashboardWelcomeBanner";
import { MetricCard } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";
import { ChannelPieChart } from "./ChannelPieChart";
import { RecentOrdersCard } from "./RecentOrdersCard";

export const DashboardView: React.FC = () => {
  const { products, orders, customers, lowStockCount, setOrdersList } = useAdminStore();

  useEffect(() => {
    let isMounted = true;
    getOrders()
      .then((data) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        const mappedForStore: Order[] = data.map((o) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          customerName: o.customer?.name || o.shippingAddress?.fullName || "Customer",
          customerPhone: o.customerMobile || o.customer?.mobile || "",
          customerEmail: o.customer?.email,
          shippingAddress: o.shippingAddress
            ? {
                line1: o.shippingAddress.streetAddress || "",
                city: o.shippingAddress.city || "",
                pincode: o.shippingAddress.pincode || "",
                state: o.shippingAddress.state || "",
              }
            : null,
          items: (o.items || []).map((it) => ({
            productId: it.productId,
            productName: it.productName,
            productPrice: it.sellingPrice,
            quantity: it.quantity,
            unit: "1 Pkt",
            lineTotal: it.itemTotal,
          })),
          subtotal: o.subtotal,
          discountAmount: o.totalDiscount,
          taxAmount: 0,
          grandTotal: o.grandTotal,
          paymentMethod: o.paymentMethod || "MANUAL",
          paymentStatus: o.paymentStatus,
          status: o.orderStatus,
          channel: (o.deliveryMethod === "POS" ? "POS" : "ONLINE") as "ONLINE" | "POS",
          createdAt: o.createdAt,
        }));
        setOrdersList(mappedForStore);
      })
      .catch((err) => {
        console.warn("Silent orders fetch error on dashboard:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [setOrdersList]);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== "CANCELLED" ? o.grandTotal : 0),
    0
  );
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  const onlineOrdersCount = orders.filter((o) => o.channel === "ONLINE").length;
  const posOrdersCount = orders.filter((o) => o.channel === "POS").length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <DashboardWelcomeBanner />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={formatINR(totalRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          subtitle={
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span>+18.4%</span>
              <span className="text-slate-400">vs last week</span>
            </p>
          }
        />

        <MetricCard
          title="Orders Placed"
          value={totalOrders}
          icon={<ShoppingBag className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600"
          subtitle={
            <p className="text-xs text-slate-500 font-medium">
              <strong className="text-amber-600 font-bold">{pendingOrders}</strong> pending processing
            </p>
          }
        />

        <MetricCard
          title="Crackers Catalog"
          value={`${products.length} Items`}
          icon={<Boxes className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600"
          subtitle={
            <p className="text-xs font-medium">
              {lowStockCount > 0 ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lowStockCount} below stock alert
                </span>
              ) : (
                <span className="text-emerald-600">All stocks healthy</span>
              )}
            </p>
          }
        />

        <MetricCard
          title="Customers"
          value={customers.length}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
          subtitle={
            <p className="text-xs text-slate-400 font-medium">
              Tamil Nadu retail & wholesale
            </p>
          }
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <ChannelPieChart
          onlineCount={onlineOrdersCount}
          posCount={posOrdersCount}
        />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersCard orders={recentOrders} />
    </div>
  );
};
