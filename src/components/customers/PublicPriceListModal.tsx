"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Printer, Download, ExternalLink, Copy, Check, Sparkles, Loader2, Search } from "lucide-react";
import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { getStoreSettings } from "@/services/settings.service";
import { printBillElement } from "@/lib/print";
import { formatINR } from "@/lib/utils";
import { toast } from "react-toastify";
import type { ApiProduct } from "@/types/product.types";
import type { ApiCategory } from "@/types/category.types";
import type { ApiStoreSettings } from "@/types/settings.types";

const STORE_WEBSITE = "https://atm-crackers-site.on-forge.com/";

interface PublicPriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicPriceListModal: React.FC<PublicPriceListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [storeSettings, setStoreSettings] = useState<ApiStoreSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      getProducts().catch(() => []),
      getCategories().catch(() => []),
      getStoreSettings().catch(() => null),
    ])
      .then(([prods, cats, settings]) => {
        if (isMounted) {
          setProducts(prods);
          setCategories(cats);
          if (settings) setStoreSettings(settings);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Group products by category and sort according to category displayOrder
  const groupedProducts = useMemo(() => {
    const catMap = new Map<string, { category: ApiCategory; items: ApiProduct[] }>();

    // Initialise categories
    const sortedCats = [...categories].sort(
      (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
    );

    for (const cat of sortedCats) {
      catMap.set(cat._id, { category: cat, items: [] });
    }

    // Default category for uncategorized
    const defaultCat: ApiCategory = {
      _id: "other",
      name: "Special Festive Crackers",
      slug: "other",
      displayOrder: 999,
      status: "ACTIVE",
    };

    // Filter by search
    const q = search.toLowerCase().trim();
    const activeProducts = products.filter((p) => {
      if (p.status === "INACTIVE") return false;
      if (!q) return true;
      const catName = typeof p.category === "object" ? p.category?.name : "";
      return (
        p.name.toLowerCase().includes(q) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (catName && catName.toLowerCase().includes(q))
      );
    });

    for (const prod of activeProducts) {
      const catId =
        typeof prod.category === "object" && prod.category
          ? prod.category._id
          : typeof prod.category === "string"
          ? prod.category
          : "other";

      if (catMap.has(catId)) {
        catMap.get(catId)!.items.push(prod);
      } else {
        if (!catMap.has("other")) {
          catMap.set("other", { category: defaultCat, items: [] });
        }
        catMap.get("other")!.items.push(prod);
      }
    }

    // Filter out empty categories
    return Array.from(catMap.values()).filter((group) => group.items.length > 0);
  }, [categories, products, search]);

  const handlePrintPdf = () => {
    printBillElement("printable-public-pricelist", {
      isThermal: false,
      title: "ATM_Crackers_Diwali_2026_Public_Price_List",
    });
  };

  const handleCopyWebsiteLink = async () => {
    try {
      await navigator.clipboard.writeText(STORE_WEBSITE);
      setCopiedLink(true);
      toast.success("Store link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const storeName = storeSettings?.storeName || "ATM CRACKERS SIVAKASI";
  const tagline =
    storeSettings?.tagline ||
    "Direct Factory Wholesale & Retail Sparklers & Fireworks Depot";
  const address = storeSettings?.address || "Sivakasi, Tamil Nadu";
  const phone = storeSettings?.supportPhone || "+91 94431 88990";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Diwali 2026 Public Price List & Catalog (PDF)"
      maxWidth="3xl"
      footer={
        <>
          <div className="flex items-center gap-2 mr-auto">
            <button
              type="button"
              onClick={handleCopyWebsiteLink}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Store URL</span>
                </>
              )}
            </button>

            <a
              href="/ATM_Crackers_Price_List_2026.pdf"
              download="ATM_Crackers_Price_List_2026.pdf"
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Download Uploaded Diwali 2026 Price List PDF (8.8 MB)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF</span>
            </a>

            <a
              href="/ATM_Crackers_Price_List_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="Open Official PDF in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open PDF</span>
            </a>

            <a
              href={STORE_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Website</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="btn btn-primary text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-red-600/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Quick Toolbar */}
        <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">
                Official Diwali 2026 Wholesale Price List
              </span>
              <span className="text-slate-500 ml-1">
                (Click &apos;Print / Save as PDF&apos; to download)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                maxLength={80}
                placeholder="Filter crackers in list..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span>Generating Diwali 2026 Price List...</span>
          </div>
        ) : (
          /* Printable Document Container */
          <div
            id="printable-public-pricelist"
            className="printable-bill a4-mode relative p-6 bg-white border border-slate-300 rounded-2xl text-slate-900 font-sans shadow-xs overflow-hidden"
          >
            {/* Background Watermark Logo (repeats on every page in printed output) */}
            <div
              className="print-watermark absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden"
              aria-hidden="true"
            >
              <img src="/logo.png" alt="" className="w-80 max-w-[65%] object-contain" />
            </div>

            {/* Printable Content Layer */}
            <div className="printable-content-layer relative z-1 space-y-6">
              {/* Price List Header */}
              <div className="invoice-header border-b-2 border-red-600 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-red-600 tracking-tight uppercase">
                    {storeName}
                  </h1>
                  {tagline && (
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {tagline}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {address} • 📞 {phone} • 🌐 {STORE_WEBSITE}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-red-600 text-white font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider">
                    Diwali 2026 Price List
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Up to 80% Flat Festival Discount
                  </div>
                </div>
              </div>

            {/* Price List Tables grouped by category */}
            <div className="space-y-6">
              {groupedProducts.map((group, groupIdx) => (
                <div key={group.category._id || groupIdx} className="space-y-2">
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span>{group.category.name}</span>
                    <span className="text-[10px] text-slate-300 font-normal">
                      {group.items.length} {group.items.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-2.5 w-12 text-center">#</th>
                        <th className="py-1.5 px-3">Cracker Item</th>
                        <th className="py-1.5 px-3 w-24">Packing</th>
                        <th className="py-1.5 px-3 w-24 text-right">MRP (₹)</th>
                        <th className="py-1.5 px-3 w-24 text-center">Discount</th>
                        <th className="py-1.5 px-3 w-28 text-right font-black text-red-600">
                          Rate (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {group.items.map((prod, idx) => {
                        const mrp = Number(prod.mrp) || 0;
                        const disc = Number(prod.discountPercent) || 0;
                        const rawSelling = Number(prod.sellingPrice) || 0;
                        const finalSelling =
                          rawSelling > 0
                            ? rawSelling
                            : disc > 0
                            ? Math.max(0, Math.round(mrp * (1 - disc / 100)))
                            : mrp;

                        return (
                          <tr key={prod._id || idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 text-center text-[11px] text-slate-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">
                              <div>{prod.name}</div>
                              {prod.description && (
                                <div className="text-[10px] text-slate-400 line-clamp-1">
                                  {prod.description}
                                </div>
                              )}
                            </td>
                            <td className="py-1.5 px-3 text-[11px] text-slate-600">
                              1 Box / Pkt
                            </td>
                            <td className="py-1.5 px-3 text-right text-slate-400 line-through text-[11px]">
                              {formatINR(mrp)}
                            </td>
                            <td className="py-1.5 px-3 text-center">
                              {disc > 0 ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  {disc}% OFF
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Net</span>
                              )}
                            </td>
                            <td className="py-1.5 px-3 text-right font-black text-red-600 text-sm">
                              {formatINR(finalSelling)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

              {groupedProducts.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No active products found matching your search.
                </div>
              )}
            </div>

            {/* Price List Footer / Terms */}
            <div className="invoice-footer border-t-2 border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1.5">
              <div className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                Important Customer Notes & Booking Terms:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>
                  100% Genuine Sivakasi standard fireworks manufactured under strict safety guidelines.
                </li>
                <li>
                  Orders can be placed directly online at{" "}
                  <span className="font-semibold text-red-600 underline">
                    {STORE_WEBSITE}
                  </span>{" "}
                  or via WhatsApp.
                </li>
                <li>
                  Transport delivery charges extra as applicable based on destination town/city.
                </li>
                <li>
                  Rates are valid subject to stock availability and festive price revisions.
                </li>
              </ul>
              <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
                Printed from {storeName} • {address}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </Modal>
);
};
