"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal, CustomerFormData } from "./CustomerFormModal";
import { WhatsAppMessageModal } from "./WhatsAppMessageModal";
import { CustomerOrdersModal } from "./CustomerOrdersModal";
import { PublicPriceListModal } from "./PublicPriceListModal";
import { getOrders } from "@/services/order.service";
import { aggregateCustomersFromOrders } from "@/lib/customer-aggregator";
import type { AggregatedCustomer } from "@/types/customer.types";
import { formatINR } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Repeat,
  Plus,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";

const STORE_WEBSITE = "https://atm-crackers-site.on-forge.com/";

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<AggregatedCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "REPEAT" | "SINGLE">("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | "all">(20);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState<boolean>(false);
  const [selectedWhatsAppCustomer, setSelectedWhatsAppCustomer] = useState<AggregatedCustomer | null>(null);
  const [selectedOrdersCustomer, setSelectedOrdersCustomer] = useState<AggregatedCustomer | null>(null);

  // Fetch orders from API and derive unique customers
  const loadCustomersFromOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const orders = await getOrders();
      const uniqueCustomers = aggregateCustomersFromOrders(orders);
      setCustomers(uniqueCustomers);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load orders for customer directory. Please check network.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomersFromOrders();
  }, [loadCustomersFromOrders]);

  // Handle manual customer creation
  const handleAddCustomerSubmit = (formData: CustomerFormData) => {
    const newCustomer: AggregatedCustomer = {
      id: formData.phone.replace(/\D/g, ""),
      name: formData.name,
      mobile: formData.phone,
      cleanMobile: formData.phone.replace(/\D/g, ""),
      email: formData.email || undefined,
      city: formData.city || "Sivakasi",
      totalOrders: 0,
      totalSpent: 0,
      orders: [],
      status: "ACTIVE",
      source: "MANUAL",
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setIsAddModalOpen(false);
    toast.success("Customer profile added successfully!");
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((c) => {
      // Search matching
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.mobile.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.orders.some((ord) => ord.orderNumber.toLowerCase().includes(q));

      // Buyer type matching
      const matchesType =
        filterType === "ALL" ||
        (filterType === "REPEAT" && c.totalOrders > 1) ||
        (filterType === "SINGLE" && c.totalOrders === 1);

      return matchesSearch && matchesType;
    });
  }, [customers, search, filterType]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType]);

  // Pagination calculation
  const totalItems = filteredCustomers.length;
  const numPageSize = pageSize === "all" ? totalItems : pageSize;
  const totalPages =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalItems / (numPageSize || 1)));
  const activePage = Math.min(currentPage, totalPages);
  const startIdx = pageSize === "all" ? 0 : (activePage - 1) * (numPageSize || 1);
  const endIdx =
    pageSize === "all"
      ? totalItems
      : Math.min(startIdx + (numPageSize || 1), totalItems);

  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(startIdx, endIdx);
  }, [filteredCustomers, startIdx, endIdx]);

  // Overall Directory Statistics
  const stats = useMemo(() => {
    const totalCount = customers.length;
    let totalOrdersCount = 0;
    let totalRevenue = 0;
    let repeatCount = 0;

    for (const c of customers) {
      totalOrdersCount += c.totalOrders;
      totalRevenue += c.totalSpent;
      if (c.totalOrders > 1) repeatCount += 1;
    }

    return { totalCount, totalOrdersCount, totalRevenue, repeatCount };
  }, [customers]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Customer Directory & WhatsApp Hub"
        description="Deduplicated customer profiles derived automatically from store and counter orders."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* View Price List PDF Button */}
            <button
              type="button"
              onClick={() => setIsPriceListModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="View & Download Public Diwali Price List (PDF)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Diwali Price List</span>
            </button>

            {/* Direct PDF Download */}
            <a
              href="/ATM_Crackers_Price_List_2026.pdf"
              download="ATM_Crackers_Price_List_2026.pdf"
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Download Uploaded Diwali 2026 Price List PDF (8.8 MB)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Price List PDF</span>
            </a>

            {/* Store Website Link */}
            <a
              href={STORE_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="Open Live ATM Crackers Online Store"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Storefront</span>
            </a>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => loadCustomersFromOrders(true)}
              disabled={refreshing || loading}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Customers from Orders"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : ""}`}
              />
            </button>

            {/* Add Manual Customer */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-red-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Unique Customers
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {stats.totalCount}
          </div>
          <span className="text-[10px] text-slate-400">Deduplicated by phone</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Order Volume
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {stats.totalOrdersCount}
          </div>
          <span className="text-[10px] text-slate-400">Placed via Store & POS</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Repeat Buyers
            </span>
            <Repeat className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {stats.repeatCount}
          </div>
          <span className="text-[10px] text-slate-400">Customers with &gt; 1 order</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Customer Value
            </span>
            <IndianRupee className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-600 mt-1">
            {formatINR(stats.totalRevenue)}
          </div>
          <span className="text-[10px] text-slate-400">Lifetime revenue</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200/80 text-red-700 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => loadCustomersFromOrders(false)}
            className="px-2.5 py-1 bg-red-600 text-white font-semibold rounded-lg text-xs hover:bg-red-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="w-full sm:w-96">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by customer name, phone, city, or order #..."
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({customers.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("REPEAT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "REPEAT"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Repeat Buyers ({stats.repeatCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("SINGLE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "SINGLE"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Single Orders
          </button>
        </div>
      </div>

      {/* Loading Skeleton or Customer Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            <span>Analyzing orders & compiling unique customer directory...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <CustomerTable
            customers={paginatedCustomers}
            onOpenWhatsApp={(cust) => setSelectedWhatsAppCustomer(cust)}
            onViewOrders={(cust) => setSelectedOrdersCustomer(cust)}
          />

          {/* Reusable Pagination Component */}
          {totalItems > 0 && (
            <Pagination
              currentPage={activePage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100, "all"]}
              itemLabel="customer profiles"
            />
          )}
        </div>
      )}

      {/* WhatsApp Message Modal */}
      <WhatsAppMessageModal
        customer={selectedWhatsAppCustomer}
        isOpen={Boolean(selectedWhatsAppCustomer)}
        onClose={() => setSelectedWhatsAppCustomer(null)}
      />

      {/* Customer Orders History Modal */}
      <CustomerOrdersModal
        customer={selectedOrdersCustomer}
        isOpen={Boolean(selectedOrdersCustomer)}
        onClose={() => setSelectedOrdersCustomer(null)}
      />

      {/* Public Price List Modal */}
      <PublicPriceListModal
        isOpen={isPriceListModalOpen}
        onClose={() => setIsPriceListModalOpen(false)}
      />

      {/* Manual Customer Create Form Modal */}
      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCustomerSubmit}
      />
    </div>
  );
};
