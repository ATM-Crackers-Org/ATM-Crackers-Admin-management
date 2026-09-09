"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Product,
  Category,
  Order,
  InventoryLog,
  Customer,
  Coupon,
  Offer,
  Banner,
  AuditLog,
  StoreSettings,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_CUSTOMERS,
  INITIAL_COUPONS,
  INITIAL_OFFERS,
  INITIAL_BANNERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from "@/data/mock-data";

export interface AdminUser {
  id: string;
  name: string;
  role: "SUPER_ADMIN" | "MANAGER" | "BILLING_STAFF";
  email: string;
}

interface AdminStoreContextType {
  // Auth
  currentUser: AdminUser | null;
  login: (email: string, role?: AdminUser["role"], name?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  toggleProductFeatured: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, "id">) => Category;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Inventory
  inventoryLogs: InventoryLog[];
  adjustStock: (productId: string, qty: number, type: "IN" | "ADJUSTMENT", reference: string, notes: string) => void;
  lowStockCount: number;

  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  createPOSOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    items: Order["items"];
    subtotal: number;
    discountAmount: number;
    grandTotal: number;
    paymentMethod: Order["paymentMethod"];
    notes?: string;
  }) => Order;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, "id" | "createdAt" | "totalOrders" | "totalSpent">) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  toggleCustomerActive: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coup: Omit<Coupon, "id" | "usageCount">) => void;
  updateCoupon: (id: string, coup: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; discount: number; coupon?: Coupon; error?: string };

  // Offers
  offers: Offer[];
  addOffer: (off: Omit<Offer, "id">) => void;
  updateOffer: (id: string, off: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  toggleOfferActive: (id: string) => void;

  // Banners
  banners: Banner[];
  addBanner: (ban: Omit<Banner, "id">) => void;
  updateBanner: (id: string, ban: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, description: string) => void;
  clearAuditLogs: () => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToDefaultData: () => void;
}

const AdminStoreContext = createContext<AdminStoreContextType | null>(null);

const STORAGE_KEY = "atm_crackers_admin_store_v1";

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>({
    id: "usr-admin-1",
    name: "Admin Officer",
    role: "SUPER_ADMIN",
    email: "admin@atmcrackers.com",
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(INITIAL_INVENTORY_LOGS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.inventoryLogs) setInventoryLogs(parsed.inventoryLogs);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.offers) setOffers(parsed.offers);
        if (parsed.banners) setBanners(parsed.banners);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
      }
    } catch (e) {
      console.warn("Failed to load state from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        products,
        categories,
        orders,
        inventoryLogs,
        customers,
        coupons,
        offers,
        banners,
        auditLogs,
        settings,
        currentUser,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to persist state to localStorage:", e);
    }
  }, [
    isLoaded,
    products,
    categories,
    orders,
    inventoryLogs,
    customers,
    coupons,
    offers,
    banners,
    auditLogs,
    settings,
    currentUser,
  ]);

  // Helper to append audit log
  const logAction = (action: string, module: string, description: string) => {
    const newLog: AuditLog = {
      id: "aud-" + Date.now(),
      action,
      module,
      description,
      userName: currentUser?.name || "Admin",
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth
  const login = (email: string, role: AdminUser["role"] = "SUPER_ADMIN", name = "Admin Officer") => {
    const user: AdminUser = { id: "usr-" + Date.now(), email, role, name };
    setCurrentUser(user);
    logAction("USER_LOGIN", "AUTH", `User logged in: ${name} (${role})`);
    toast.success(`Welcome back, ${name}!`);
  };

  const logout = () => {
    const prevName = currentUser?.name || "Admin";
    logAction("USER_LOGOUT", "AUTH", `User logged out: ${prevName}`);
    setCurrentUser(null);
    toast.info("Logged out successfully.");
  };

  // Products
  const addProduct = (prodData: Omit<Product, "id" | "createdAt">): Product => {
    const newProduct: Product = {
      ...prodData,
      id: "prod-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logAction("PRODUCT_CREATE", "PRODUCTS", `Created product: ${newProduct.name} (${newProduct.sku})`);
    toast.success(`Product "${newProduct.name}" created successfully!`);
    return newProduct;
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      logAction("PRODUCT_UPDATE", "PRODUCTS", `Updated product details: ${prod.name}`);
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prodData } : p))
    );
    toast.success("Product updated successfully!");
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAction("PRODUCT_DELETE", "PRODUCTS", `Deleted product: ${prod?.name || id}`);
    toast.success("Product deleted successfully!");
  };

  const toggleProductActive = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const nextActive = !prod.isActive;
    logAction("PRODUCT_STATUS", "PRODUCTS", `Product ${prod.name} active status set to ${nextActive}`);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextActive } : p))
    );
    toast.info(`Product is now ${nextActive ? "Active" : "Inactive"}`);
  };

  const toggleProductFeatured = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const nextFeatured = !prod.isFeatured;
    logAction("PRODUCT_FEATURED", "PRODUCTS", `Product ${prod.name} featured status set to ${nextFeatured}`);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: nextFeatured } : p))
    );
    toast.info(`Product ${nextFeatured ? "marked as Featured" : "unmarked as Featured"}`);
  };

  // Categories
  const addCategory = (catData: Omit<Category, "id">): Category => {
    const newCategory: Category = {
      ...catData,
      id: "cat-" + Date.now(),
    };
    setCategories((prev) => [...prev, newCategory]);
    logAction("CATEGORY_CREATE", "CATEGORIES", `Created category: ${newCategory.name}`);
    toast.success(`Category "${newCategory.name}" added!`);
    return newCategory;
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData } : c))
    );
    logAction("CATEGORY_UPDATE", "CATEGORIES", `Updated category: ${id}`);
    toast.success("Category updated successfully!");
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAction("CATEGORY_DELETE", "CATEGORIES", `Deleted category: ${id}`);
    toast.success("Category deleted!");
  };

  // Inventory
  const adjustStock = (productId: string, qty: number, type: "IN" | "ADJUSTMENT", reference: string, notes: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const previousStock = prod.stockQuantity;
    const newStock = type === "IN" ? previousStock + qty : Math.max(0, previousStock + qty);

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p))
    );

    // Add inventory log
    const log: InventoryLog = {
      id: "log-" + Date.now(),
      productId,
      productName: prod.name,
      type,
      quantity: qty,
      previousStock,
      newStock,
      reference: reference || "STOCK-ADJUST",
      notes: notes || (type === "IN" ? "Stock replenishment" : "Stock correction"),
      createdAt: new Date().toISOString(),
      performedBy: currentUser?.name || "Admin",
    };
    setInventoryLogs((prev) => [log, ...prev]);

    logAction("STOCK_ADJUSTMENT", "INVENTORY", `Adjusted stock for ${prod.name}: ${previousStock} -> ${newStock}`);
    toast.success(`Stock updated for ${prod.name}! New balance: ${newStock}`);
  };

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

  // Orders & POS Billing
  const updateOrderStatus = (id: string, status: Order["status"]) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      logAction("ORDER_STATUS_UPDATE", "ORDERS", `Order ${order.orderNumber} status changed to ${status}`);
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    toast.success(`Order status updated to ${status}!`);
  };

  const createPOSOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    items: Order["items"];
    subtotal: number;
    discountAmount: number;
    grandTotal: number;
    paymentMethod: Order["paymentMethod"];
    notes?: string;
  }): Order => {
    const orderNum = "POS-2026-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: "ord-" + Date.now(),
      orderNumber: orderNum,
      customerName: orderData.customerName || "Walk-in Customer",
      customerPhone: orderData.customerPhone || "-",
      shippingAddress: null,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount,
      taxAmount: 0,
      grandTotal: orderData.grandTotal,
      paymentMethod: orderData.paymentMethod,
      status: "DELIVERED",
      channel: "POS",
      notes: orderData.notes || "In-store POS counter transaction",
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for all items
    const itemQtyMap = new Map(orderData.items.map((i) => [i.productId, i.quantity]));
    setProducts((prev) =>
      prev.map((p) => {
        const qty = itemQtyMap.get(p.id);
        if (qty !== undefined) {
          return { ...p, stockQuantity: Math.max(0, p.stockQuantity - qty) };
        }
        return p;
      })
    );

    // Record inventory logs
    const newInventoryLogs: InventoryLog[] = orderData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const prevStock = prod?.stockQuantity || 0;
      return {
        id: "log-" + Date.now() + "-" + item.productId,
        productId: item.productId,
        productName: item.productName,
        type: "SALE",
        quantity: -item.quantity,
        previousStock: prevStock,
        newStock: Math.max(0, prevStock - item.quantity),
        reference: orderNum,
        notes: `POS counter checkout ${orderNum}`,
        createdAt: new Date().toISOString(),
        performedBy: currentUser?.name || "Billing Staff",
      };
    });

    setInventoryLogs((prevLogs) => [...newInventoryLogs, ...prevLogs]);

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer history or record new customer
    if (orderData.customerPhone && orderData.customerPhone !== "-") {
      setCustomers((prevCusts) => {
        const existing = prevCusts.find((c) => c.phone.includes(orderData.customerPhone.trim()));
        if (existing) {
          return prevCusts.map((c) =>
            c.id === existing.id
              ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + orderData.grandTotal }
              : c
          );
        } else {
          return [
            {
              id: "cust-" + Date.now(),
              name: orderData.customerName || "Walk-in Customer",
              phone: orderData.customerPhone,
              city: "Sivakasi",
              totalOrders: 1,
              totalSpent: orderData.grandTotal,
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            ...prevCusts,
          ];
        }
      });
    }

    logAction("POS_TRANSACTION", "BILLING", `Completed POS Bill ${orderNum} for ${orderData.customerName} (${orderData.grandTotal})`);
    toast.success(`Sale completed! Receipt #${orderNum} issued.`);
    return newOrder;
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, "id" | "createdAt" | "totalOrders" | "totalSpent">) => {
    const newCust: Customer = {
      ...custData,
      id: "cust-" + Date.now(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    toast.success(`Customer ${newCust.name} added!`);
  };

  const updateCustomer = (id: string, custData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...custData } : c))
    );
    toast.success("Customer profile updated!");
  };

  const toggleCustomerActive = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    toast.info("Customer status updated.");
  };

  // Coupons
  const addCoupon = (coupData: Omit<Coupon, "id" | "usageCount">) => {
    const newCoupon: Coupon = {
      ...coupData,
      id: "coup-" + Date.now(),
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    toast.success(`Coupon ${newCoupon.code} created!`);
  };

  const updateCoupon = (id: string, coupData: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...coupData } : c))
    );
    toast.success("Coupon updated!");
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Coupon deleted!");
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    toast.info("Coupon status toggled.");
  };

  const validateCoupon = (code: string, orderTotal: number) => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!found) {
      return { valid: false, discount: 0, error: "Invalid or inactive coupon code." };
    }
    if (orderTotal < found.minOrderValue) {
      return { valid: false, discount: 0, error: `Minimum order amount for this coupon is ₹${found.minOrderValue}.` };
    }
    let discount = 0;
    if (found.discountType === "FLAT") {
      discount = Math.min(found.discountValue, orderTotal);
    } else {
      discount = (orderTotal * found.discountValue) / 100;
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    }
    return { valid: true, discount: Math.round(discount), coupon: found };
  };

  // Offers
  const addOffer = (offData: Omit<Offer, "id">) => {
    const newOffer: Offer = { ...offData, id: "off-" + Date.now() };
    setOffers((prev) => [newOffer, ...prev]);
    toast.success(`Offer "${newOffer.title}" published!`);
  };

  const updateOffer = (id: string, offData: Partial<Offer>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...offData } : o)));
    toast.success("Offer updated!");
  };

  const deleteOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success("Offer removed!");
  };

  const toggleOfferActive = (id: string) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, isActive: !o.isActive } : o)));
    toast.info("Offer status updated.");
  };

  // Banners
  const addBanner = (banData: Omit<Banner, "id">) => {
    const newBan: Banner = { ...banData, id: "ban-" + Date.now() };
    setBanners((prev) => [...prev, newBan]);
    toast.success(`Banner "${newBan.title}" added!`);
  };

  const updateBanner = (id: string, banData: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...banData } : b)));
    toast.success("Banner updated!");
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success("Banner deleted!");
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
    toast.info("Banner status updated.");
  };

  // Audit Logs
  const addAuditLog = (action: string, module: string, description: string) => {
    logAction(action, module, description);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    toast.info("Audit trail logs cleared.");
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAction("SETTINGS_UPDATE", "SETTINGS", "Store configuration updated");
    toast.success("Settings saved successfully!");
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setInventoryLogs(INITIAL_INVENTORY_LOGS);
    setCustomers(INITIAL_CUSTOMERS);
    setCoupons(INITIAL_COUPONS);
    setOffers(INITIAL_OFFERS);
    setBanners(INITIAL_BANNERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("All demo data reset to factory initial state!");
  };

  return (
    <AdminStoreContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        toggleProductFeatured,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        inventoryLogs,
        adjustStock,
        lowStockCount,
        orders,
        updateOrderStatus,
        createPOSOrder,
        customers,
        addCustomer,
        updateCustomer,
        toggleCustomerActive,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        validateCoupon,
        offers,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferActive,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        auditLogs,
        addAuditLog,
        clearAuditLogs,
        settings,
        updateSettings,
        resetToDefaultData,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider");
  }
  return context;
}
