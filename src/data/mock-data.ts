export interface Product {
  id: string;
  name: string;
  nameTamil?: string;
  sku: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId: string;
  categoryName: string;
  categoryDisplayOrder?: number;
  displayOrder?: number;
  unit: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameTamil?: string;
  slug: string;
  icon: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  unit: string;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: {
    line1: string;
    city: string;
    pincode: string;
    state: string;
  } | null;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "PACKED"
    | "PACKING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  channel: "ONLINE" | "POS";
  notes?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: "IN" | "ADJUSTMENT" | "SALE";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;
  notes: string;
  createdAt: string;
  performedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  discountPercent: number;
  bannerUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  tagline: string;
  buttonText: string;
  linkUrl: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  description: string;
  userName: string;
  ipAddress: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  gstin: string;
  enableOnlineOrders: boolean;
  minOnlineOrderAmount: number;
  defaultGstPercent: number;
  posReceiptFooter: string;
}

// ─── Products, Categories & Orders are 100% API-driven (Empty initial) ─────────
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// ─── Static Mock Data for Customers, Coupons, Offers, Banners ────────────────
export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Sundararajan M", phone: "+91 98421 55670", email: "sundar.m@example.com", city: "Madurai", totalOrders: 5, totalSpent: 34200, isActive: true, createdAt: "2025-10-12T10:00:00.000Z" },
  { id: "cust-2", name: "Karthik R", phone: "+91 94431 88990", email: "karthik.r@yahoo.com", city: "Sivakasi", totalOrders: 12, totalSpent: 78500, isActive: true, createdAt: "2025-08-04T12:30:00.000Z" },
  { id: "cust-3", name: "Priya V", phone: "+91 97890 12345", email: "priya.v@gmail.com", city: "Coimbatore", totalOrders: 3, totalSpent: 14500, isActive: true, createdAt: "2026-01-15T15:20:00.000Z" },
  { id: "cust-4", name: "Anand Kumar", phone: "+91 98840 99112", email: "anand.kumar@live.com", city: "Chennai", totalOrders: 2, totalSpent: 8900, isActive: true, createdAt: "2026-02-18T09:40:00.000Z" },
  { id: "cust-5", name: "Dinesh Balaji", phone: "+91 97500 44332", email: "dinesh.b@outlook.com", city: "Tirunelveli", totalOrders: 4, totalSpent: 26800, isActive: true, createdAt: "2026-03-22T14:10:00.000Z" },
  { id: "cust-6", name: "Lakshmi Narayanan", phone: "+91 94422 77881", city: "Salem", totalOrders: 1, totalSpent: 4200, isActive: false, createdAt: "2026-04-05T11:00:00.000Z" },
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: "coup-1", code: "DIWALI500", description: "Flat ₹500 off on festive orders above ₹5000", discountType: "FLAT", discountValue: 500, minOrderValue: 5000, expiryDate: "2026-11-15", usageLimit: 1000, usageCount: 142, isActive: true },
  { id: "coup-2", code: "EARLYBIRD10", description: "10% Early Bird festive advance booking discount", discountType: "PERCENTAGE", discountValue: 10, minOrderValue: 3000, maxDiscount: 1000, expiryDate: "2026-10-31", usageLimit: 500, usageCount: 88, isActive: true },
  { id: "coup-3", code: "FREESHIP", description: "Free shipping voucher on orders above ₹2500", discountType: "FLAT", discountValue: 250, minOrderValue: 2500, expiryDate: "2026-12-31", usageLimit: 2000, usageCount: 420, isActive: true },
  { id: "coup-4", code: "VIPMEGA20", description: "20% Exclusive discount for registered wholesale customers", discountType: "PERCENTAGE", discountValue: 20, minOrderValue: 15000, maxDiscount: 4000, expiryDate: "2026-11-20", usageLimit: 100, usageCount: 19, isActive: true },
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: "off-1",
    title: "Diwali 2026 Mega Advance Booking",
    subtitle: "Flat 80% discount from direct Sivakasi manufacturers pricing!",
    badge: "Limited Season Dhamaka",
    discountPercent: 80,
    bannerUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1000&auto=format&fit=crop&q=80",
    linkUrl: "/products",
    startDate: "2026-06-01",
    endDate: "2026-11-15",
    isActive: true,
  },
  {
    id: "off-2",
    title: "Family Gift Box Special Combo",
    subtitle: "Buy any Mega Box and get free 15cm sparklers pack!",
    badge: "Combo Delight",
    discountPercent: 75,
    bannerUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1000&auto=format&fit=crop&q=80",
    linkUrl: "/products",
    startDate: "2026-06-10",
    endDate: "2026-10-30",
    isActive: true,
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: "ban-1",
    title: "ATM Crackers — Original Sivakasi Crackers",
    tagline: "Direct from the firecrackers capital of India with safe green chemical certifications.",
    buttonText: "Explore Catalog",
    linkUrl: "/products",
    imageUrl: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1200&auto=format&fit=crop&q=80",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "ban-2",
    title: "Spectacular Repeating Sky Shots 2025",
    tagline: "Celebrate in high colour with our 12, 30 & 60-shot grand aerial display shells.",
    buttonText: "View Sky Shots",
    linkUrl: "/products?category=cat-7",
    imageUrl: "https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=1200&auto=format&fit=crop&q=80",
    sortOrder: 2,
    isActive: true,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "ATM Crackers Sivakasi",
  tagline: "Premium Festive Fireworks & Sivakasi Direct Wholesale",
  phone: "+91 94431 88990",
  whatsapp: "+91 94431 88990",
  email: "contact@atmcrackers.com",
  address: "128, By-Pass Road, Near Old Bus Stand, Sivakasi",
  city: "Sivakasi, Tamil Nadu - 626123",
  gstin: "33AAAAA0000A1Z5",
  enableOnlineOrders: true,
  minOnlineOrderAmount: 2500,
  defaultGstPercent: 0,
  posReceiptFooter: "Thank you for shopping with ATM Crackers! Happy and safe celebrations!",
};
