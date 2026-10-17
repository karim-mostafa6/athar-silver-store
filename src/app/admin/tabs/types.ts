import type { Order } from "@/context/StoreContext";

export type ActiveTab =
  | "orders" | "customers" | "analytics" | "products" | "collections" | "pages" | "banners" | "checkout"
  | "hero" | "marquee" | "nav" | "story" | "footer" | "payment" | "shipping" | "promos" | "contact"
  | "logo" | "email" | "policies" | "users";

export type OrderDatePreset = "all" | "today" | "yesterday" | "last7" | "last30" | "custom";

export interface ManualOrderForm {
  customerName: string;
  phone: string;
  email: string;
  governorate: string;
  address: string;
  notes: string;
  paymentMethod: "cod" | "wallet" | "card";
  discount: number;
  customShippingFee: number | null;
  items: {
    productId: string;
    name: string;
    arabicName: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    image: string;
  }[];
}

export interface CustomerSummary {
  name: string;
  phone: string;
  governorate: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  lastOrderStatus: Order["status"];
  orders: Order[];
}
