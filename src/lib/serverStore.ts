import fs from "fs";
import path from "path";
import { Product, PRODUCTS, DEFAULT_CATEGORIES } from "@/data/products";
import { StoreSettings, Order } from "@/context/StoreContext";

export interface ServerStoreData {
  products: Product[];
  settings: Partial<StoreSettings>;
  orders: Order[];
  lastOrderSeq?: number;
  deletedOrderIds?: string[];
  updatedAt: string;
  isDefault?: boolean;
}

// ----------------------------------------------------
// DEDICATED HIGH-SPEED CLOUD REDIS STORE (UPSTASH / VERCEL KV)
// ----------------------------------------------------
const FALLBACK_CLOUD_URL = "https://select-viper-229752.upstash.io";
const FALLBACK_CLOUD_TOKEN = "gQAAAAAAA4F4AQIgcDE4YmYyZTdiZDRjMWQ0ZWVkODYyMTk2MDliYjQ1NGQxNw";

function getCloudCredentials(): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || FALLBACK_CLOUD_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || FALLBACK_CLOUD_TOKEN;
  return { url, token };
}

// File path detection for local development
function getStoreFilePath(): string {
  const rootPath = path.join(process.cwd(), "store-data.json");
  try {
    if (fs.existsSync(rootPath)) return rootPath;
    fs.writeFileSync(rootPath, "", { flag: "a" });
    return rootPath;
  } catch {
    return path.join("/tmp", "store-data.json");
  }
}

// ----------------------------------------------------
// READ FROM CENTRAL CLOUD DATABASE
// ----------------------------------------------------
async function getCloudData(): Promise<ServerStoreData | null> {
  const { url, token } = getCloudCredentials();
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", "athar_ecommerce_store_data"]),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.result) {
      const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch from Cloud KV:", err);
  }
  return null;
}

// ----------------------------------------------------
// WRITE TO CENTRAL CLOUD DATABASE
// ----------------------------------------------------
async function saveCloudData(data: ServerStoreData): Promise<boolean> {
  const { url, token } = getCloudCredentials();
  if (!url || !token) return false;

  try {
    const payload = JSON.stringify(data);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", "athar_ecommerce_store_data", payload]),
      cache: "no-store",
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn("Failed to save to Cloud KV:", err);
  }
  return false;
}

const DEMO_ORDER_IDS = new Set(["ATH-819230", "ATH-928174", "ATH-583920", "ATH-741952"]);
export function cleanOrders(orders: unknown): Order[] {
  if (!Array.isArray(orders)) return [];
  return (orders as Order[]).filter((o) => o && o.id && !DEMO_ORDER_IDS.has(o.id));
}

// Extract numeric sequence from an order ID (e.g. "ATH-1002" -> 1002)
export function extractOrderSequence(id: string): number | null {
  if (!id) return null;
  const m = id.match(/(?:#?ATH-?)(\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1000 && n < 100000 && !DEMO_ORDER_IDS.has(id)) {
      return n;
    }
  }
  return null;
}

// Calculate the absolute highest sequence number ever used across active orders, stored sequence, and deleted orders
export function calculateHighestOrderSeq(
  ordersList: Order[] = [],
  storedLastSeq?: number,
  deletedIds: string[] = []
): number {
  let highest = Math.max(999, Number(storedLastSeq) || 999);

  if (Array.isArray(ordersList)) {
    for (const o of ordersList) {
      if (o && o.id) {
        const seq = extractOrderSequence(o.id);
        if (seq !== null && seq > highest) {
          highest = seq;
        }
      }
    }
  }

  if (Array.isArray(deletedIds)) {
    for (const id of deletedIds) {
      if (!id) continue;
      const seq = extractOrderSequence(String(id));
      if (seq !== null && seq > highest) {
        highest = seq;
      }
    }
  }

  return highest;
}

// Helper to generate sequential 4-digit order numbers starting from ATH-1000 (#ATH-1000, #ATH-1001, etc.)
// Strictly monotonic: even if orders are deleted, this sequence never goes backward
export function getNextSequentialOrderId(
  ordersList: Order[] = [],
  storedLastSeq?: number,
  deletedIds: string[] = []
): string {
  const highest = calculateHighestOrderSeq(ordersList, storedLastSeq, deletedIds);
  return `ATH-${highest + 1}`;
}

// ----------------------------------------------------
// GET STORE DATA (Cloud -> Local File -> Defaults)
// ----------------------------------------------------
export async function getServerStoreData(): Promise<ServerStoreData> {
  // 1. Try Central Cloud Redis first (Synchronized across all phones and regions)
  const cloudData = await getCloudData();
  if (cloudData && Array.isArray(cloudData.products) && cloudData.products.length > 0) {
    cloudData.orders = cleanOrders(cloudData.orders);
    cloudData.deletedOrderIds = Array.isArray(cloudData.deletedOrderIds) ? cloudData.deletedOrderIds : [];
    cloudData.lastOrderSeq = calculateHighestOrderSeq(
      cloudData.orders,
      cloudData.lastOrderSeq,
      cloudData.deletedOrderIds
    );
    return cloudData;
  }

  // 2. Try Local File Storage (For offline development)
  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      if (raw.trim()) {
        const parsed = JSON.parse(raw) as ServerStoreData;
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          parsed.orders = cleanOrders(parsed.orders);
          parsed.deletedOrderIds = Array.isArray(parsed.deletedOrderIds) ? parsed.deletedOrderIds : [];
          parsed.lastOrderSeq = calculateHighestOrderSeq(
            parsed.orders,
            parsed.lastOrderSeq,
            parsed.deletedOrderIds
          );
          // Seed cloud database in background so next request is instant
          saveCloudData(parsed).catch(() => {});
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Error reading store-data.json:", err);
  }

  // 3. Fallback to Initial Default State & Seed Cloud
  const defaultData: ServerStoreData = {
    products: PRODUCTS,
    settings: {
      categories: DEFAULT_CATEGORIES,
      senderEmail: process.env.GMAIL_USER || "theathar.eg@gmail.com",
      senderEmailName: process.env.GMAIL_SENDER_NAME || "أَثَـر للفضة 925",
    },
    orders: [],
    lastOrderSeq: 999,
    deletedOrderIds: [],
    updatedAt: new Date().toISOString(),
    isDefault: false,
  };

  // Seed the central cloud database immediately so all phones see it
  await saveCloudData(defaultData);

  try {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
  } catch {
    // Ignore if read-only
  }

  return defaultData;
}

// ----------------------------------------------------
// SAVE STORE DATA (Cloud Sync + Local File)
// ----------------------------------------------------
export async function saveServerStoreData(
  updates: Partial<ServerStoreData>
): Promise<ServerStoreData> {
  const current = await getServerStoreData();

  const combinedDeletedIds = Array.from(
    new Set([
      ...(current.deletedOrderIds || []),
      ...(updates.deletedOrderIds || []),
    ])
  );

  const cleanUpdatedOrders = updates.orders !== undefined ? cleanOrders(updates.orders) : current.orders;

  // Strict monotonicity: sequence counter can only increase, never decrease
  const newLastOrderSeq = calculateHighestOrderSeq(
    cleanUpdatedOrders,
    Math.max(current.lastOrderSeq || 999, updates.lastOrderSeq || 999),
    combinedDeletedIds
  );

  const updated: ServerStoreData = {
    products: updates.products !== undefined ? updates.products : current.products,
    settings: updates.settings !== undefined ? { ...current.settings, ...updates.settings } : current.settings,
    orders: cleanUpdatedOrders,
    lastOrderSeq: newLastOrderSeq,
    deletedOrderIds: combinedDeletedIds,
    updatedAt: new Date().toISOString(),
    isDefault: false,
  };

  // 1. Await saving to Central Cloud Redis (Must await so serverless lambda does not terminate before network write finishes!)
  await saveCloudData(updated);

  // 2. Also save to local file if writable
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write store-data.json:", err);
  }

  return updated;
}
