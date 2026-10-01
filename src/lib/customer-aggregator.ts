import type { ApiOrder } from "@/types/order.types";
import type { AggregatedCustomer, CustomerOrderSummary } from "@/types/customer.types";

/**
 * Normalizes any Indian phone number into:
 * - `key`: Canonical 10-digit number (e.g., "9840012345")
 * - `display`: Human-readable format (e.g., "+91 98400 12345")
 * - `waNumber`: 12-digit number for wa.me links (e.g., "919840012345")
 */
export function normalizePhoneNumber(rawPhone?: string): {
  key: string;
  display: string;
  waNumber: string;
} {
  if (!rawPhone) {
    return { key: "UNKNOWN", display: "—", waNumber: "" };
  }

  // Strip everything except digits
  const digits = rawPhone.replace(/\D/g, "");

  let canonical = digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    canonical = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    canonical = digits.slice(1);
  } else if (digits.length > 10) {
    canonical = digits.slice(-10);
  }

  if (canonical.length === 10) {
    const formatted = `+91 ${canonical.slice(0, 5)} ${canonical.slice(5)}`;
    return {
      key: canonical,
      display: formatted,
      waNumber: `91${canonical}`,
    };
  }

  // Fallback for short or non-standard numbers
  return {
    key: digits || rawPhone.trim(),
    display: rawPhone.trim(),
    waNumber: digits.startsWith("91") ? digits : `91${digits}`,
  };
}

/**
 * Extracts and deduplicates unique customers from an array of backend orders.
 * Even if a customer placed 10 orders with the same phone number,
 * they will appear as a single customer with aggregated metrics.
 */
export function aggregateCustomersFromOrders(orders: ApiOrder[]): AggregatedCustomer[] {
  const customerMap = new Map<string, AggregatedCustomer>();

  // Process orders sorted chronologically so earliest and latest orders are tracked properly
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const order of sortedOrders) {
    const rawPhone =
      order.customerMobile ||
      order.customer?.mobile ||
      (order.shippingAddress as any)?.mobile ||
      "";

    const { key, display, waNumber } = normalizePhoneNumber(rawPhone);
    if (!key || key === "UNKNOWN") {
      // If order has no phone, try using customerId as fallback key
      const fallbackKey = order.customerId || order._id;
      if (!customerMap.has(fallbackKey)) {
        const orderSummary: CustomerOrderSummary = {
          orderNumber: order.orderNumber,
          grandTotal: order.grandTotal || 0,
          orderStatus: order.orderStatus || "PENDING",
          paymentStatus: order.paymentStatus || "PENDING",
          createdAt: order.createdAt,
          itemsCount: Array.isArray(order.items) ? order.items.length : 0,
        };

        customerMap.set(fallbackKey, {
          id: fallbackKey,
          name: order.customer?.name || order.shippingAddress?.fullName || "Walk-in Customer",
          mobile: "—",
          cleanMobile: "",
          email: order.customer?.email,
          city: order.shippingAddress?.city || "Sivakasi",
          address: order.shippingAddress?.streetAddress,
          pincode: order.shippingAddress?.pincode,
          totalOrders: 1,
          totalSpent: order.grandTotal || 0,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
          lastOrderNumber: order.orderNumber,
          lastOrderStatus: order.orderStatus,
          orders: [orderSummary],
          status: "ACTIVE",
          source: "ORDER",
        });
      }
      continue;
    }

    const orderSummary: CustomerOrderSummary = {
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal || 0,
      orderStatus: order.orderStatus || "PENDING",
      paymentStatus: order.paymentStatus || "PENDING",
      createdAt: order.createdAt,
      itemsCount: Array.isArray(order.items) ? order.items.length : 0,
    };

    const existing = customerMap.get(key);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += order.grandTotal || 0;
      existing.orders.push(orderSummary);
      existing.lastOrderDate = order.createdAt;
      existing.lastOrderNumber = order.orderNumber;
      existing.lastOrderStatus = order.orderStatus;

      // Update name/email/city if newer order has more complete data
      if (order.customer?.name && order.customer.name.trim().length > 1) {
        existing.name = order.customer.name.trim();
      } else if (order.shippingAddress?.fullName && order.shippingAddress.fullName.trim().length > 1) {
        existing.name = order.shippingAddress.fullName.trim();
      }

      if (order.customer?.email && !existing.email) {
        existing.email = order.customer.email;
      }
      if (order.shippingAddress?.city && (!existing.city || existing.city === "Sivakasi")) {
        existing.city = order.shippingAddress.city;
      }
      if (order.shippingAddress?.streetAddress && !existing.address) {
        existing.address = order.shippingAddress.streetAddress;
      }
      if (order.shippingAddress?.pincode && !existing.pincode) {
        existing.pincode = order.shippingAddress.pincode;
      }
    } else {
      const candidateName =
        order.customer?.name?.trim() ||
        order.shippingAddress?.fullName?.trim() ||
        "Valued Customer";

      customerMap.set(key, {
        id: key,
        name: candidateName,
        mobile: display,
        cleanMobile: waNumber,
        email: order.customer?.email,
        city: order.shippingAddress?.city || "Sivakasi",
        address: order.shippingAddress?.streetAddress,
        pincode: order.shippingAddress?.pincode,
        totalOrders: 1,
        totalSpent: order.grandTotal || 0,
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt,
        lastOrderNumber: order.orderNumber,
        lastOrderStatus: order.orderStatus,
        orders: [orderSummary],
        status: "ACTIVE",
        source: "ORDER",
      });
    }
  }

  // Return customers sorted by most recent activity (latest order first)
  return Array.from(customerMap.values()).sort((a, b) => {
    const timeA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
    const timeB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
    return timeB - timeA;
  });
}
