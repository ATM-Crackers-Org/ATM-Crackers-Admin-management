"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Product, Order } from "@/data/mock-data";
import { POSCatalogGrid } from "@/components/pos/PosCatalogGrid";
import { POSCartPanel, BillCartItem } from "@/components/pos/PosCartPanel";
import { POSMobileCartBar } from "@/components/pos/PosMobileCartBar";
import { POSReceiptModal } from "@/components/pos/PosReceiptModal";

export const PosBillingView: React.FC = () => {
  const { products, categories, createPOSOrder, validateCoupon, settings } = useAdminStore();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState<BillCartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("CASH");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Mobile View Switcher ("catalog" | "cart")
  const [mobileTab, setMobileTab] = useState<"catalog" | "cart">("catalog");

  // Receipt Modal State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameTamil && p.nameTamil.includes(search));
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchesSearch && matchesCat && p.isActive;
  });

  // Cart Operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert("Maximum available stock reached for this cracker!");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stockQuantity <= 0) {
          alert("Product is out of stock!");
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stockQuantity) {
              alert("Cannot exceed available warehouse stock!");
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - couponDiscount);
  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Apply Coupon
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

  // Complete POS Sale
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty! Please add crackers before checkout.");
      return;
    }

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
    <div className="h-auto lg:h-[calc(100vh-6.5rem)] flex flex-col gap-4 relative">
      {/* Mobile Top View Switcher */}
      <div className="lg:hidden flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab("catalog")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === "catalog"
              ? "bg-red-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Crackers Catalog ({filteredProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("cart")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "cart"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>Active Bill</span>
          {cart.length > 0 && (
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {totalCartUnits}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Product Catalog Grid */}
        <div className={`flex-1 flex flex-col ${mobileTab === "cart" ? "hidden lg:flex" : "flex"}`}>
          <POSCatalogGrid
            products={filteredProducts}
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCat}
            onCategoryChange={setSelectedCat}
            onAddToCart={addToCart}
            totalProductsCount={products.length}
          />
        </div>

        {/* Right: Active Cart Panel */}
        <div className={`w-full lg:w-96 flex flex-col ${mobileTab === "catalog" ? "hidden lg:flex" : "flex"}`}>
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
            onRemoveCoupon={() => {
              setAppliedCoupon(null);
              setCouponDiscount(0);
            }}
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

      {/* Printable Receipt Modal */}
      <POSReceiptModal
        order={completedOrder}
        settings={settings}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
};
