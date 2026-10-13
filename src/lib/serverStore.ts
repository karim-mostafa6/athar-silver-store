import fs from "fs";
import path from "path";
import { Product, PRODUCTS, DEFAULT_CATEGORIES } from "@/data/products";
import { StoreSettings, Order } from "@/context/StoreContext";

export interface ServerStoreData {
  products: Product[];
  settings: Partial<StoreSettings>;
  orders: Order[];
  updatedAt: string;
  isDefault?: boolean;
}

// File path detection: prefer process.cwd()/store-data.json, fallback to /tmp/store-data.json if read-only
function getStoreFilePath(): string {
  const rootPath = path.join(process.cwd(), "store-data.json");
  try {
    // Check if writable or readable
    if (fs.existsSync(rootPath)) return rootPath;
    fs.writeFileSync(rootPath, "", { flag: "a" });
    return rootPath;
  } catch {
    // If process.cwd() is read-only (e.g. serverless environment), use /tmp
    return path.join("/tmp", "store-data.json");
  }
}

// ----------------------------------------------------
// UPSTASH / VERCEL KV CLOUD STORAGE (If configured)
// ----------------------------------------------------
async function getCloudData(): Promise<ServerStoreData | null> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/athar_ecommerce_store_data`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result) {
      const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to fetch from Cloud KV:", err);
  }
  return null;
}

async function saveCloudData(data: ServerStoreData): Promise<boolean> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;

  try {
    await fetch(`${url}/set/athar_ecommerce_store_data`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return true;
  } catch (err) {
    console.warn("Failed to save to Cloud KV:", err);
    return false;
  }
}

const DEMO_ORDER_IDS = new Set(["ATH-819230", "ATH-928174", "ATH-583920", "ATH-741952"]);
function cleanOrders(orders: unknown): Order[] {
  if (!Array.isArray(orders)) return [];
  return (orders as Order[]).filter((o) => o && o.id && !DEMO_ORDER_IDS.has(o.id));
}

// ----------------------------------------------------
// GET STORE DATA (Cloud -> Local File -> Defaults)
// ----------------------------------------------------
export async function getServerStoreData(): Promise<ServerStoreData> {
  // 1. Try Cloud KV first if available
  const cloudData = await getCloudData();
  if (cloudData && Array.isArray(cloudData.products) && cloudData.products.length > 0) {
    cloudData.orders = cleanOrders(cloudData.orders);
    return cloudData;
  }

  // 2. Try Local File Storage
  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      if (raw.trim()) {
        const parsed = JSON.parse(raw) as ServerStoreData;
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          parsed.orders = cleanOrders(parsed.orders);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Error reading store-data.json:", err);
  }

  // 3. Fallback to Initial Default State
  const defaultData: ServerStoreData = {
    products: PRODUCTS,
    settings: {
      categories: DEFAULT_CATEGORIES,
      senderEmail: process.env.GMAIL_USER || "theathar.eg@gmail.com",
      senderEmailName: process.env.GMAIL_SENDER_NAME || "أَثَـر للفضة 925",
    },
    orders: [],
    updatedAt: new Date().toISOString(),
    isDefault: true,
  };

  // Save initial file so it's persistent
  try {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
  } catch {
    // Ignore if not writable
  }

  return defaultData;
}

// ----------------------------------------------------
// SAVE STORE DATA (Local File + Cloud Sync)
// ----------------------------------------------------
export async function saveServerStoreData(
  updates: Partial<ServerStoreData>
): Promise<ServerStoreData> {
  const current = await getServerStoreData();

  const updated: ServerStoreData = {
    products: updates.products !== undefined ? updates.products : current.products,
    settings: updates.settings !== undefined ? { ...current.settings, ...updates.settings } : current.settings,
    orders: updates.orders !== undefined ? cleanOrders(updates.orders) : current.orders,
    updatedAt: new Date().toISOString(),
    isDefault: false,
  };

  // 1. Save to Local File
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write store-data.json:", err);
  }

  // 2. Save to Cloud KV (in parallel / non-blocking)
  saveCloudData(updated).catch(() => {});

  return updated;
}
