"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Product, Category, Order } from "@/data/mock-data";
import { POSCatalogGrid } from "@/components/pos/PosCatalogGrid";
import { POSCartPanel, BillCartItem } from "@/components/pos/PosCartPanel";
import { POSMobileCartBar } from "@/components/pos/PosMobileCartBar";
import { POSReceiptModal } from "@/components/pos/PosReceiptModal";
import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type { ApiProduct } from "@/types/product.types";
import type { ApiCategory } from "@/types/category.types";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

const POS_CART_KEY = "atm_pos_cart_draft";

interface PersistedCartItem {
  productId: string;
  quantity: number;
}

export const PosBillingView: React.FC = () => {
  const {
    setProductsList,
    setCategoriesList,
    createPOSOrder,
    validateCoupon,
    settings,
  } = useAdminStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState<BillCartItem[]>([]);
  const [cartRestored, setCartRestored] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("CASH");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [mobileTab, setMobileTab] = useState<"catalog" | "cart">("catalog");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // ─── Fetch Live Catalog Directly from Server API ──────────────────────────
  const fetchLiveCatalog = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setFetchError(null);

      try {
        const [apiCats, apiProds] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        const mappedCats: Category[] = (apiCats || [])
          .map((c: ApiCategory) => ({
            id: c._id,
            name: c.name,
            slug: c.slug,
            icon: "💥",
            imageUrl: c.imageUrl,
            sortOrder: c.displayOrder || 0,
            isActive: c.status === "ACTIVE",
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const mappedProds: Product[] = (apiProds || []).map((p: ApiProduct) => {
          const catId =
            typeof p.category === "object" && p.category
              ? p.category._id
              : typeof p.category === "string"
              ? p.category
              : "";
          const catName =
            typeof p.category === "object" && p.category
              ? p.category.name
              : "General";
          const catOrder =
            typeof p.category === "object" && p.category && typeof p.category.displayOrder === "number"
              ? p.category.displayOrder
              : 9999;
          const prodOrder = typeof p.displayOrder === "number" ? p.displayOrder : 9999;

          const sellingPrice =
            p.sellingPrice ??
            Math.round(p.mrp * (1 - (p.discountPercent || 0) / 100));

          return {
            id: p._id || p.id || "",
            name: p.name,
            sku: p.slug || (p._id ? p._id.slice(-6).toUpperCase() : "CRK-001"),
            price: sellingPrice,
            originalPrice: p.mrp,
            stockQuantity:
              typeof p.stockQuantity === "number"
                ? p.stockQuantity
                : p.stockStatus === "out_of_stock"
                ? 0
                : p.stockStatus === "limited"
                ? 10
                : 100,
            lowStockThreshold:
              typeof p.lowStockThreshold === "number"
                ? p.lowStockThreshold
                : 10,
            categoryId: catId,
            categoryName: catName,
            categoryDisplayOrder: catOrder,
            displayOrder: prodOrder,
            unit: "1 Box",
            description: p.description || "",
            imageUrl:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images[0]
                : "https://placehold.co/600x600/F5A623/111827?text=ATM+Crackers",
            isActive: p.status === "ACTIVE",
            isFeatured: false,
            createdAt: p.createdAt || new Date().toISOString(),
          };
        });

        // Sort products by category displayOrder then product displayOrder
        mappedProds.sort((a, b) => {
          const catDiff = (a.categoryDisplayOrder ?? 9999) - (b.categoryDisplayOrder ?? 9999);
          if (catDiff !== 0) return catDiff;
          const prodDiff = (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999);
          if (prodDiff !== 0) return prodDiff;
          return a.name.localeCompare(b.name);
        });

        setCategories(mappedCats);
        setProducts(mappedProds);
        setCategoriesList(mappedCats);
        setProductsList(mappedProds);
      } catch (err: unknown) {
        console.error("Failed to load POS catalog from API:", err);
        setFetchError(
          err instanceof Error ? err.message : "Failed to load catalog from server API"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setCategoriesList, setProductsList]
  );

  useEffect(() => {
    fetchLiveCatalog();
  }, [fetchLiveCatalog]);

  // ── Restore cart from localStorage (ignoring any legacy mock items) ───────
  useEffect(() => {
    if (cartRestored || products.length === 0) return;
    try {
      const saved = localStorage.getItem(POS_CART_KEY);
      if (saved) {
        const persisted: PersistedCartItem[] = JSON.parse(saved);
        const restored: BillCartItem[] = [];
        for (const { productId, quantity } of persisted) {
          if (productId.startsWith("prod-")) continue; // skip old mock IDs
          const prod = products.find((p) => p.id === productId);
          if (prod && prod.isActive && prod.stockQuantity > 0) {
            restored.push({ product: prod, quantity: Math.min(quantity, prod.stockQuantity) });
          }
        }
        if (restored.length > 0) setCart(restored);
      }
    } catch {
      // ignore
    }
    setCartRestored(true);
  }, [products, cartRestored]);

  // ── Persist cart to localStorage on every change ─────────────────────────
  useEffect(() => {
    if (!cartRestored) return;
    try {
      const toSave: PersistedCartItem[] = cart.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));
      if (toSave.length > 0) {
        localStorage.setItem(POS_CART_KEY, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(POS_CART_KEY);
      }
    } catch {
      // ignore
    }
  }, [cart, cartRestored]);

  // ── Filter Catalog (Sorted by Category displayOrder) ────────────────────
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !search.trim() ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          (p.nameTamil && p.nameTamil.includes(search));
        const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
        return matchesSearch && matchesCat && p.isActive;
      })
      .sort((a, b) => {
        const catDiff = (a.categoryDisplayOrder ?? 9999) - (b.categoryDisplayOrder ?? 9999);
        if (catDiff !== 0) return catDiff;
        const prodDiff = (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999);
        if (prodDiff !== 0) return prodDiff;
        return a.name.localeCompare(b.name);
      });
  }, [products, search, selectedCat]);

  // ── Cart Map (productId → quantity) for O(1) lookup in product card ──────
  const cartMap = Object.fromEntries(cart.map(({ product, quantity }) => [product.id, quantity]));

  // ── Cart Operations ───────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stockQuantity <= 0) return prev;
        return [...prev, { product, quantity: 1 }];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stockQuantity) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const clamped = Math.max(0, Math.min(quantity, item.product.stockQuantity));
            return { ...item, quantity: clamped };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    localStorage.removeItem(POS_CART_KEY);
  }, []);

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - couponDiscount);
  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = validateCoupon(couponCode, subtotal);
    if (res.valid) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
    } else {
      alert(res.error || "Invalid coupon code.");
    }
  };

  // Auto-recalculate coupon discount when subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const res = validateCoupon(appliedCoupon.code, subtotal);
      if (res.valid) {
        setCouponDiscount(res.discount);
      } else {
        setCouponDiscount(0);
      }
    }
  }, [subtotal, appliedCoupon, validateCoupon]);

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = () => {
    if (cart.length === 0) return;
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productPrice: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      lineTotal: item.product.price * item.quantity,
    }));
    const order = createPOSOrder({
      customerName: customerName.trim() || "Walk-in Customer",
      customerPhone: customerPhone.trim() || "-",
      customerAddress: customerAddress.trim() || undefined,
      items: orderItems,
      subtotal,
      discountAmount: couponDiscount,
      grandTotal,
      paymentMethod: "CASH",
      notes: customerAddress.trim() ? `Address: ${customerAddress.trim()}` : "In-store POS counter transaction",
    });
    setCompletedOrder(order);
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setMobileTab("catalog");
  };

  // ─── Loading Screen ───────────────────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 border-3 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-slate-900 text-base">Loading Live POS Catalog...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Fetching products and categories directly from the backend server API
        </p>
      </div>
    );
  }

  // ─── Error Screen ─────────────────────────────────────────────────────────
  if (fetchError && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] bg-white rounded-2xl border border-red-100 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">Unable to Load POS Catalog</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{fetchError}</p>
        <button
          onClick={() => fetchLiveCatalog()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry API Call</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 6rem)" }}>
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("catalog")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "catalog" ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Catalog ({filteredProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("cart")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "cart" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>Bill</span>
          {cart.length > 0 && (
            <span className="bg-red-600 text-white text-[10px] px-1.5 rounded-full font-bold">
              {totalCartUnits}
            </span>
          )}
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left: Catalog Grid with Live Data */}
        <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${mobileTab === "cart" ? "hidden lg:flex" : "flex"}`}>
          <POSCatalogGrid
            products={filteredProducts}
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCat}
            onCategoryChange={setSelectedCat}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            onSetQuantity={setQuantity}
            cartMap={cartMap}
            totalProductsCount={products.length}
            onRefresh={() => fetchLiveCatalog(true)}
            isRefreshing={refreshing}
          />
        </div>

        {/* Right: Cart Panel with Editable Quantity */}
        <div className={`w-full lg:w-80 xl:w-96 shrink-0 flex flex-col min-h-0 ${mobileTab === "catalog" ? "hidden lg:flex" : "flex"}`}>
          <POSCartPanel
            cart={cart}
            totalCartUnits={totalCartUnits}
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            grandTotal={grandTotal}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            customerAddress={customerAddress}
            onCustomerAddressChange={setCustomerAddress}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={() => { setAppliedCoupon(null); setCouponDiscount(0); }}
            onUpdateQuantity={updateQuantity}
            onSetQuantity={setQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
            onBackToCatalog={() => setMobileTab("catalog")}
          />
        </div>
      </div>

      {/* Floating Mobile Cart Bar */}
      {mobileTab === "catalog" && (
        <POSMobileCartBar
          totalCartUnits={totalCartUnits}
          grandTotal={grandTotal}
          onOpenCart={() => setMobileTab("cart")}
        />
      )}

      {/* Receipt Modal */}
      <POSReceiptModal
        order={completedOrder}
        settings={settings}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
};
