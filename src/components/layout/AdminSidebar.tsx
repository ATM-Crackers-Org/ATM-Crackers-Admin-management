"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/context/admin-store";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  ShoppingCart,
  Receipt,
  Users,
  Percent,
  Tag,
  Image as ImageIcon,
  BarChart3,
  FileClock,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout, lowStockCount, orders } = useAdminStore();

  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;

  const sections = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
      ],
    },
    {
      title: "Catalog & Stock",
      items: [
        { label: "Products", href: "/products", icon: Package },
        { label: "Categories", href: "/categories", icon: Layers },
        {
          label: "Inventory",
          href: "/inventory",
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
          badgeColor: "bg-red-500 text-white",
        },
      ],
    },
    {
      title: "Sales & Terminal",
      items: [
        {
          label: "Orders",
          href: "/orders",
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
          badgeColor: "bg-amber-500 text-white",
        },
        { label: "POS Billing", href: "/billing", icon: Receipt, highlight: true },
        { label: "Customers", href: "/customers", icon: Users },
      ],
    },
    {
      title: "Marketing",
      items: [
        { label: "Offers", href: "/offers", icon: Percent },
        { label: "Coupons", href: "/coupons", icon: Tag },
        { label: "Banners", href: "/banners", icon: ImageIcon },
      ],
    },
    {
      title: "Analytics & Control",
      items: [
        { label: "Reports", href: "/reports", icon: BarChart3 },
        { label: "Audit Logs", href: "/audit-logs", icon: FileClock },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header with Exact Official Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800 bg-slate-950/70">
          <img
            src="/logo.png"
            alt="ATM Crackers Sivakasi Logo"
            className="h-11 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 truncate">
              ATM CRACKERS
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase truncate">
              Sivakasi Admin
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                {sec.title}
              </div>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : item.highlight
                            ? "bg-gradient-to-r from-amber-500/15 to-red-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive
                                ? "text-white"
                                : item.highlight
                                ? "text-amber-400"
                                : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || "Admin Officer"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.role?.replace("_", " ") || "SUPER ADMIN"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
