"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
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
  Settings,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, lowStockCount, orders } = useAdminStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
      title: "System",
      items: [
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-56 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-800">
          <img
            src="/logo.png"
            alt="ATM Crackers"
            className="h-8 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[13px] text-white truncate leading-tight">
              ATM Crackers
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {sections.map((sec, idx) => (
            <div key={idx}>
              <p className="px-3 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                {sec.title}
              </p>
              <ul className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group ${
                          isActive
                            ? "bg-red-600 text-white"
                            : item.highlight
                            ? "text-amber-300 hover:bg-slate-800"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? "text-white"
                                : item.highlight
                                ? "text-amber-400"
                                : "text-slate-500 group-hover:text-slate-300"
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

        {/* Footer / User */}
        <div className="px-2 py-3 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-red-600/20">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white truncate leading-tight">
                  {currentUser?.name || "Admin"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {currentUser?.role?.replace("_", " ") || "SUPER ADMIN"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await logout();
          setShowLogoutModal(false);
          router.push("/login");
        }}
        title="Sign Out"
        message="Are you sure you want to sign out of the ATM Crackers Admin?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        icon={<LogOut className="w-5 h-5 text-red-500" />}
      />
    </>
  );
}
