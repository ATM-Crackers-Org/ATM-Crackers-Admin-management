"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Product, Order } from "@/data/mock-data";
import { POSCatalogGrid } from "@/components/pos/PosCatalogGrid";
import { POSCartPanel, BillCartItem } from "@/components/pos/PosCartPanel";
import { POSMobileCartBar } from "@/components/pos/PosMobileCartBar";
import { POSReceiptModal } from "@/components/pos/PosReceiptModal";

const POS_CART_KEY = "atm_pos_cart_draft";

// Persist only product IDs + quantities (not full objects — products come from store)
interface PersistedCartItem {
  productId: string;
  quantity: number;
}

export const PosBillingView: React.FC = () => {
  const { products, categories, createPOSOrder, validateCoupon, settings } = useAdminStore();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState<BillCartItem[]>([]);
  const [cartRestored, setCartRestored] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("CASH");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [mobileTab, setMobileTab] = useState<"catalog" | "cart">("catalog");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // ── Restore cart from localStorage once products are loaded ──────────────
  useEffect(() => {
    if (cartRestored || products.length === 0) return;
    try {
      const saved = localStorage.getItem(POS_CART_KEY);
      if (saved) {
        const persisted: PersistedCartItem[] = JSON.parse(saved);
        const restored: BillCartItem[] = [];
        for (const { productId, quantity } of persisted) {
          const prod = products.find((p) => p.id === productId);
          if (prod && prod.isActive && prod.stockQuantity > 0) {
            restored.push({ product: prod, quantity: Math.min(quantity, prod.stockQuantity) });
          }
        }
        if (restored.length > 0) setCart(restored);
      }
    } catch {
      // ignore corrupt storage
    }
    setCartRestored(true);
  }, [products, cartRestored]);

  // ── Persist cart to localStorage on every change ─────────────────────────
  useEffect(() => {
    if (!cartRestored) return; // don't overwrite before restore
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

  // ── Filter Catalog ────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameTamil && p.nameTamil.includes(search));
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchesSearch && matchesCat && p.isActive;
  });

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
      items: orderItems,
      subtotal,
      discountAmount: couponDiscount,
      grandTotal,
      paymentMethod,
      notes: `POS counter checkout via ${paymentMethod}`,
    });
    setCompletedOrder(order);
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setMobileTab("catalog");
  };

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
        {/* Left: Catalog */}
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
            cartMap={cartMap}
            totalProductsCount={products.length}
          />
        </div>

        {/* Right: Cart Panel */}
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
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={() => { setAppliedCoupon(null); setCouponDiscount(0); }}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onUpdateQuantity={updateQuantity}
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
