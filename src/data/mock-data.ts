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
  paymentMethod: "CASH" | "UPI" | "CARD" | "ONLINE";
  status: "PENDING" | "CONFIRMED" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
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

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "One Sound Crackers", nameTamil: "ஒரு சவுண்ட் பட்டாசுகள்", slug: "one-sound-crackers", icon: "💥", sortOrder: 1, isActive: true },
  { id: "cat-2", name: "Super Sonic Bombs", nameTamil: "சூப்பர் சோனிக் பாம்ஸ்", slug: "super-sonic-bombs", icon: "💣", sortOrder: 2, isActive: true },
  { id: "cat-3", name: "ATM Special Paper Bomb", nameTamil: "ஏடிஎம் ஸ்பெஷல் பேப்பர் பாம்", slug: "atm-special-paper-bomb", icon: "📦", sortOrder: 3, isActive: true },
  { id: "cat-4", name: "ATM Grand Varnam Series", nameTamil: "ஏடிஎம் கிராண்ட் வர்ணம் சீரிஸ்", slug: "atm-grand-varnam-series", icon: "✨", sortOrder: 4, isActive: true },
  { id: "cat-5", name: "Flower Pots Supreme", nameTamil: "பிளவர் பாட்ஸ்", slug: "flower-pots-supreme", icon: "🌸", sortOrder: 5, isActive: true },
  { id: "cat-6", name: "Super Ground Chakkar", nameTamil: "சூப்பர் சக்கரம்", slug: "super-ground-chakkar", icon: "🌀", sortOrder: 6, isActive: true },
  { id: "cat-7", name: "Repeating Sky Shots", nameTamil: "ரிப்பீட்டிங் ஸ்கை சாட்ஸ்", slug: "repeating-sky-shots", icon: "🎆", sortOrder: 7, isActive: true },
  { id: "cat-8", name: "Sparklers Deluxe", nameTamil: "ஸ்பார்க்லர்ஸ் டீலக்ஸ்", slug: "sparklers-deluxe", icon: "🪄", sortOrder: 8, isActive: true },
  { id: "cat-9", name: "ATM Gift Boxes 2025", nameTamil: "ஏடிஎம் கிஃப்ட் பாக்சஸ்", slug: "atm-gift-boxes", icon: "🎁", sortOrder: 9, isActive: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: '4" GOLD LAXMI',
    nameTamil: '4" கோல்ட் லட்சுமி',
    sku: "LAX-001",
    price: 295,
    originalPrice: 1475,
    stockQuantity: 450,
    lowStockThreshold: 50,
    categoryId: "cat-1",
    categoryName: "One Sound Crackers",
    unit: "1 Pkt",
    description: "Classic high-decibel festival favourite gold paper wrapped Laxmi cracker.",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "prod-2",
    name: '6" ATM SPL (18 PLY)',
    nameTamil: '6" ATM ஸ்பெஷல் (18PLY)',
    sku: "ATM-006",
    price: 615,
    originalPrice: 3075,
    stockQuantity: 180,
    lowStockThreshold: 30,
    categoryId: "cat-1",
    categoryName: "One Sound Crackers",
    unit: "1 Pkt",
    description: "Signature 18-ply high density Sivakasi thunder cracker with deep boom.",
    imageUrl: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-12T11:00:00.000Z",
  },
  {
    id: "prod-3",
    name: "HYDRO BOMB (10 PCS)",
    nameTamil: "ஹைட்ரோ பாம் (10 பீஸ்)",
    sku: "BMB-011",
    price: 570,
    originalPrice: 2850,
    stockQuantity: 12,
    lowStockThreshold: 25,
    categoryId: "cat-2",
    categoryName: "Super Sonic Bombs",
    unit: "1 Box",
    description: "High impact hydro-shock explosive acoustic sound cracker box.",
    imageUrl: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-15T09:30:00.000Z",
  },
  {
    id: "prod-4",
    name: "ATM KING BOMB - 2",
    nameTamil: "ATM கிங் பாம் - 2",
    sku: "KNG-002",
    price: 1300,
    originalPrice: 6500,
    stockQuantity: 8,
    lowStockThreshold: 15,
    categoryId: "cat-3",
    categoryName: "ATM Special Paper Bomb",
    unit: "1 Box",
    description: "Mega paper wrapped heavy payload festival cracker box.",
    imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-05-18T14:20:00.000Z",
  },
  {
    id: "prod-5",
    name: "1000 VARNAM",
    nameTamil: "1000 வர்ணம்",
    sku: "VRN-1000",
    price: 2200,
    originalPrice: 11000,
    stockQuantity: 65,
    lowStockThreshold: 20,
    categoryId: "cat-4",
    categoryName: "ATM Grand Varnam Series",
    unit: "1 Box",
    description: "Grand continuous multicolour chain cracker roll for celebration events.",
    imageUrl: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-20T16:00:00.000Z",
  },
  {
    id: "prod-6",
    name: "Flower Pot Supreme Giant",
    nameTamil: "பிளவர் பாட்ஸ் சுப்ரீம்",
    sku: "FLW-001",
    price: 340,
    originalPrice: 1200,
    stockQuantity: 280,
    lowStockThreshold: 40,
    categoryId: "cat-5",
    categoryName: "Flower Pots Supreme",
    unit: "1 Box (10 pcs)",
    description: "High altitude golden sparkling fountain with silver glittering shower.",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-22T10:15:00.000Z",
  },
  {
    id: "prod-7",
    name: "Ground Chakra Special 10pcs",
    nameTamil: "தரை சக்கரம் ஸ்பெஷல்",
    sku: "CHK-010",
    price: 180,
    originalPrice: 600,
    stockQuantity: 320,
    lowStockThreshold: 50,
    categoryId: "cat-6",
    categoryName: "Super Ground Chakkar",
    unit: "1 Box",
    description: "Vibrant high-speed spinning wheels with dazzling green and red sparks.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-05-25T11:45:00.000Z",
  },
  {
    id: "prod-8",
    name: "Sky Shot 12 In 1 Multi Colour",
    nameTamil: "ஸ்கை சாட் 12 இன் 1",
    sku: "SKY-012",
    price: 1450,
    originalPrice: 4800,
    stockQuantity: 95,
    lowStockThreshold: 20,
    categoryId: "cat-7",
    categoryName: "Repeating Sky Shots",
    unit: "1 Box",
    description: "12 consecutive aerial bursting bursts with palm tree and willow effects.",
    imageUrl: "https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-28T13:00:00.000Z",
  },
  {
    id: "prod-9",
    name: "Color Sparklers 15cm (Box of 10)",
    nameTamil: "கலர் கம்பி மத்தாப்பு",
    sku: "SPK-015",
    price: 75,
    originalPrice: 250,
    stockQuantity: 850,
    lowStockThreshold: 100,
    categoryId: "cat-8",
    categoryName: "Sparklers Deluxe",
    unit: "1 Box",
    description: "Safe, smokeless low-smoke colourful sparklers loved by kids.",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-05-30T15:30:00.000Z",
  },
  {
    id: "prod-10",
    name: "ATM Mega Family Delight Box (42 Items)",
    nameTamil: "ஏடிஎம் மெகா ஃபேமிலி பாக்ஸ்",
    sku: "GFT-042",
    price: 3850,
    originalPrice: 12500,
    stockQuantity: 34,
    lowStockThreshold: 10,
    categoryId: "cat-9",
    categoryName: "ATM Gift Boxes 2025",
    unit: "1 Master Box",
    description: "Complete Diwali celebration hamper containing sparklers, bombs, pots, and sky shots.",
    imageUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&auto=format&fit=crop&q=60",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2026-8801",
    customerName: "Sundararajan M",
    customerPhone: "+91 98421 55670",
    customerEmail: "sundar.m@example.com",
    shippingAddress: {
      line1: "42 Anna Nagar 2nd Street",
      city: "Madurai",
      pincode: "625020",
      state: "Tamil Nadu",
    },
    items: [
      { productId: "prod-10", productName: "ATM Mega Family Delight Box (42 Items)", productPrice: 3850, quantity: 1, unit: "1 Master Box", lineTotal: 3850 },
      { productId: "prod-8", productName: "Sky Shot 12 In 1 Multi Colour", productPrice: 1450, quantity: 2, unit: "1 Box", lineTotal: 2900 },
      { productId: "prod-9", productName: "Color Sparklers 15cm (Box of 10)", productPrice: 75, quantity: 4, unit: "1 Box", lineTotal: 300 },
    ],
    subtotal: 7050,
    discountAmount: 500,
    taxAmount: 0,
    grandTotal: 6550,
    paymentMethod: "UPI",
    status: "CONFIRMED",
    channel: "ONLINE",
    notes: "Please pack with extra bubble wrap for fragile shots.",
    createdAt: "2026-06-18T10:30:00.000Z",
  },
  {
    id: "ord-2",
    orderNumber: "POS-2026-4412",
    customerName: "Karthik R (Walk-in)",
    customerPhone: "+91 94431 88990",
    shippingAddress: null,
    items: [
      { productId: "prod-1", productName: '4" GOLD LAXMI', productPrice: 295, quantity: 3, unit: "1 Pkt", lineTotal: 885 },
      { productId: "prod-6", productName: "Flower Pot Supreme Giant", productPrice: 340, quantity: 2, unit: "1 Box (10 pcs)", lineTotal: 680 },
      { productId: "prod-7", productName: "Ground Chakra Special 10pcs", productPrice: 180, quantity: 2, unit: "1 Box", lineTotal: 360 },
    ],
    subtotal: 1925,
    discountAmount: 100,
    taxAmount: 0,
    grandTotal: 1825,
    paymentMethod: "CASH",
    status: "DELIVERED",
    channel: "POS",
    notes: "Counter sale completed at Sivakasi Main Branch.",
    createdAt: "2026-06-19T14:15:00.000Z",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-2026-8802",
    customerName: "Priya V",
    customerPhone: "+91 97890 12345",
    customerEmail: "priya.v@gmail.com",
    shippingAddress: {
      line1: "15 Gandhi Road, RS Puram",
      city: "Coimbatore",
      pincode: "641002",
      state: "Tamil Nadu",
    },
    items: [
      { productId: "prod-2", productName: '6" ATM SPL (18 PLY)', productPrice: 615, quantity: 4, unit: "1 Pkt", lineTotal: 2460 },
      { productId: "prod-5", productName: "1000 VARNAM", productPrice: 2200, quantity: 1, unit: "1 Box", lineTotal: 2200 },
    ],
    subtotal: 4660,
    discountAmount: 200,
    taxAmount: 0,
    grandTotal: 4460,
    paymentMethod: "ONLINE",
    status: "PACKING",
    channel: "ONLINE",
    notes: "Fast delivery required.",
    createdAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "ord-4",
    orderNumber: "ORD-2026-8803",
    customerName: "Anand Kumar",
    customerPhone: "+91 98840 99112",
    shippingAddress: {
      line1: "Plot 8, Velachery Main Road",
      city: "Chennai",
      pincode: "600042",
      state: "Tamil Nadu",
    },
    items: [
      { productId: "prod-3", productName: "HYDRO BOMB (10 PCS)", productPrice: 570, quantity: 2, unit: "1 Box", lineTotal: 1140 },
      { productId: "prod-4", productName: "ATM KING BOMB - 2", productPrice: 1300, quantity: 1, unit: "1 Box", lineTotal: 1300 },
    ],
    subtotal: 2440,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 2440,
    paymentMethod: "UPI",
    status: "PENDING",
    channel: "ONLINE",
    notes: "Verify payment confirmation.",
    createdAt: "2026-06-21T11:45:00.000Z",
  },
  {
    id: "ord-5",
    orderNumber: "POS-2026-4413",
    customerName: "Walk-in Customer",
    customerPhone: "+91 99520 11223",
    shippingAddress: null,
    items: [
      { productId: "prod-9", productName: "Color Sparklers 15cm (Box of 10)", productPrice: 75, quantity: 10, unit: "1 Box", lineTotal: 750 },
    ],
    subtotal: 750,
    discountAmount: 50,
    taxAmount: 0,
    grandTotal: 700,
    paymentMethod: "UPI",
    status: "DELIVERED",
    channel: "POS",
    notes: "Quick retail billing.",
    createdAt: "2026-06-21T16:20:00.000Z",
  },
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: "log-1",
    productId: "prod-1",
    productName: '4" GOLD LAXMI',
    type: "IN",
    quantity: 200,
    previousStock: 250,
    newStock: 450,
    reference: "GRN-2026-081",
    notes: "Stock replenishment from Sivakasi factory warehouse batch #12",
    createdAt: "2026-06-15T08:30:00.000Z",
    performedBy: "Super Admin",
  },
  {
    id: "log-2",
    productId: "prod-3",
    productName: "HYDRO BOMB (10 PCS)",
    type: "SALE",
    quantity: -15,
    previousStock: 27,
    newStock: 12,
    reference: "ORD-2026-8799",
    notes: "Wholesale counter dispatch",
    createdAt: "2026-06-18T14:10:00.000Z",
    performedBy: "POS Terminal 1",
  },
  {
    id: "log-3",
    productId: "prod-4",
    productName: "ATM KING BOMB - 2",
    type: "ADJUSTMENT",
    quantity: -2,
    previousStock: 10,
    newStock: 8,
    reference: "AUD-2026-04",
    notes: "Box damaged during display movement",
    createdAt: "2026-06-20T17:00:00.000Z",
    performedBy: "Inventory Manager",
  },
];

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

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "aud-1", action: "SYSTEM_INITIALIZE", module: "SYSTEM", description: "Admin store initialized with Sivakasi demo catalog", userName: "System", ipAddress: "127.0.0.1", timestamp: "2026-06-21T08:00:00.000Z" },
  { id: "aud-2", action: "STOCK_UPDATE", module: "INVENTORY", description: 'Replenished 200 boxes of 4" Gold Laxmi (Batch GRN-2026-081)', userName: "Super Admin", ipAddress: "192.168.1.10", timestamp: "2026-06-21T08:35:00.000Z" },
  { id: "aud-3", action: "COUPON_CREATED", module: "MARKETING", description: "Created discount coupon DIWALI500 (Flat ₹500 off)", userName: "Super Admin", ipAddress: "192.168.1.10", timestamp: "2026-06-21T09:12:00.000Z" },
  { id: "aud-4", action: "POS_SALE", module: "BILLING", description: "Completed in-store counter bill POS-2026-4412 for Karthik R (₹1,825)", userName: "Billing Staff", ipAddress: "192.168.1.15", timestamp: "2026-06-21T14:15:00.000Z" },
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
