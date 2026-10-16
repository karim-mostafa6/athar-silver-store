import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { Product, PRODUCTS, DEFAULT_CATEGORIES } from "@/data/products";
import { StoreSettings, Order } from "@/context/StoreContext";
import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";

export interface ServerStoreData {
  products: Product[];
  settings: Partial<StoreSettings>;
  orders: Order[];
  lastOrderSeq?: number;
  deletedOrderIds?: string[];
  updatedAt: string;
  isDefault?: boolean;
}

// In-memory stable timestamp tracker for client sync
let cachedLastUpdated = "2026-10-15T12:00:00.000Z";

// File path detection for local fallback if Supabase is not yet configured
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

// Model Mappers: Product <-> Supabase
export function mapDbProductToModel(row: Record<string, unknown>): Product {
  return {
    id: String(row.id || ""),
    name: String(row.name || ""),
    arabicName: String(row.arabic_name || row.arabicName || ""),
    category: String(row.category || "rings"),
    gender: (row.gender as "men" | "women" | "unisex") || "unisex",
    purity: String(row.purity || "فضة إسترليني عيار 925 معتمدة"),
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    costPrice: row.cost_price ? Number(row.cost_price) : undefined,
    sku: row.sku ? String(row.sku) : undefined,
    stockQuantity: row.stock_quantity !== undefined && row.stock_quantity !== null ? Number(row.stock_quantity) : undefined,
    stoneType: row.stone_type ? String(row.stone_type) : undefined,
    rating: Number(row.rating) || 5.0,
    reviewsCount: Number(row.reviews_count) || 1,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    description: String(row.description || ""),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : [],
    defaultSize: row.default_size ? String(row.default_size) : undefined,
    weightGrams: Number(row.weight_grams) || 0,
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    inStock: row.in_stock !== false,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    collections: Array.isArray(row.collections) ? (row.collections as string[]) : [],
  };
}

export function mapModelProductToDb(p: Product): Record<string, unknown> {
  return {
    id: p.id,
    name: p.name || "",
    arabic_name: p.arabicName,
    category: p.category,
    gender: p.gender,
    purity: p.purity || "فضة إسترليني عيار 925 معتمدة",
    price: p.price,
    original_price: p.originalPrice || null,
    cost_price: p.costPrice || null,
    sku: p.sku || null,
    stock_quantity: p.stockQuantity ?? null,
    stone_type: p.stoneType || null,
    rating: p.rating || 5.0,
    reviews_count: p.reviewsCount || 1,
    images: Array.isArray(p.images) ? p.images : [],
    description: p.description || "",
    features: Array.isArray(p.features) ? p.features : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    default_size: p.defaultSize || null,
    weight_grams: p.weightGrams || 0,
    is_new: Boolean(p.isNew),
    is_best_seller: Boolean(p.isBestSeller),
    in_stock: p.inStock !== false,
    tags: Array.isArray(p.tags) ? p.tags : [],
    collections: Array.isArray(p.collections) ? p.collections : [],
    updated_at: new Date().toISOString(),
  };
}

// Model Mappers: Order <-> Supabase
export function mapDbOrderToModel(row: Record<string, unknown>): Order {
  return {
    id: String(row.id || ""),
    customerName: String(row.customer_name || ""),
    phone: String(row.phone || ""),
    email: row.email ? String(row.email) : undefined,
    governorate: String(row.governorate || ""),
    address: String(row.address || ""),
    notes: row.notes ? String(row.notes) : undefined,
    isGift: Boolean(row.is_gift),
    giftMessage: row.gift_message ? String(row.gift_message) : undefined,
    items: Array.isArray(row.items) ? (row.items as Order["items"]) : [],
    subtotal: Number(row.subtotal) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    status: (row.status as Order["status"]) || "pending",
    paymentMethod: (row.payment_method as Order["paymentMethod"]) || "cod",
    senderWalletNumber: row.sender_wallet_number ? String(row.sender_wallet_number) : undefined,
    paymentReceiptImage: row.payment_receipt_image ? String(row.payment_receipt_image) : undefined,
    cardDetails: row.card_details ? (row.card_details as Order["cardDetails"]) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    phoneConfirmed: Boolean(row.phone_confirmed),
    phoneConfirmedAt: row.phone_confirmed_at ? String(row.phone_confirmed_at) : undefined,
    phoneConfirmationNotes: row.phone_confirmation_notes ? String(row.phone_confirmation_notes) : undefined,
    whatsappConfirmed: Boolean(row.whatsapp_confirmed),
    whatsappConfirmedAt: row.whatsapp_confirmed_at ? String(row.whatsapp_confirmed_at) : undefined,
    cancellationReason: row.cancellation_reason ? String(row.cancellation_reason) : undefined,
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : undefined,
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
  };
}

export function mapModelOrderToDb(o: Order): Record<string, unknown> {
  return {
    id: o.id,
    customer_name: o.customerName,
    phone: o.phone,
    email: o.email || null,
    governorate: o.governorate,
    address: o.address,
    notes: o.notes || null,
    is_gift: Boolean(o.isGift),
    gift_message: o.giftMessage || null,
    items: o.items || [],
    subtotal: o.subtotal,
    shipping_fee: o.shippingFee,
    discount: o.discount || 0,
    total: o.total,
    status: o.status || "pending",
    payment_method: o.paymentMethod || "cod",
    sender_wallet_number: o.senderWalletNumber || null,
    payment_receipt_image: o.paymentReceiptImage || null,
    card_details: o.cardDetails || null,
    admin_notes: o.adminNotes || null,
    phone_confirmed: Boolean(o.phoneConfirmed),
    phone_confirmed_at: o.phoneConfirmedAt || null,
    phone_confirmation_notes: o.phoneConfirmationNotes || null,
    whatsapp_confirmed: Boolean(o.whatsappConfirmed),
    whatsapp_confirmed_at: o.whatsappConfirmedAt || null,
    cancellation_reason: o.cancellationReason || null,
    cancelled_at: o.cancelledAt || null,
    created_at: o.createdAt || new Date().toISOString(),
  };
}

const DEMO_ORDER_IDS = new Set(["ATH-819230", "ATH-928174", "ATH-583920", "ATH-741952", "ORM-819230"]);
export function cleanOrders(orders: unknown): Order[] {
  if (!Array.isArray(orders)) return [];
  return (orders as Order[]).filter((o) => o && o.id && !DEMO_ORDER_IDS.has(o.id));
}

// Extract numeric sequence from order ID (e.g. "ORM-1002" or "ATH-1002" -> 1002)
export function extractOrderSequence(id: string): number | null {
  if (!id) return null;
  const m = id.match(/(?:#?(?:ATH|ORM)-?)(\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1000 && n < 100000 && !DEMO_ORDER_IDS.has(id)) {
      return n;
    }
  }
  return null;
}

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

export function getNextSequentialOrderId(
  ordersList: Order[] = [],
  storedLastSeq?: number,
  deletedIds: string[] = []
): string {
  const highest = calculateHighestOrderSeq(ordersList, storedLastSeq, deletedIds);
  return `ORM-${highest + 1}`;
}

// ----------------------------------------------------
// READ DATA (Supabase First -> Local File Fallback)
// ----------------------------------------------------
export async function getServerStoreData(): Promise<ServerStoreData> {
  // 1. Supabase Cloud Database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      const [productsRes, settingsRes, ordersRes, metaRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("store_settings").select("settings, updated_at").eq("id", "primary").maybeSingle(),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("store_metadata").select("*"),
      ]);

      let products: Product[] = [];
      if (productsRes.data && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
        products = productsRes.data.map(mapDbProductToModel);
      } else {
        // If Supabase products table is empty (fresh project), seed with default catalog
        products = PRODUCTS;
        const dbProducts = PRODUCTS.map(mapModelProductToDb);
        try {
          await supabase.from("products").upsert(dbProducts, { onConflict: "id" });
        } catch {}
      }

      let settings: Partial<StoreSettings> = {};
      if (settingsRes.data && settingsRes.data.settings) {
        settings = settingsRes.data.settings;
      } else {
        settings = {
          categories: DEFAULT_CATEGORIES,
          senderEmail: process.env.GMAIL_USER || "contact@ormasilver.com",
          senderEmailName: process.env.GMAIL_SENDER_NAME || "ORMA للفضة 925",
        };
        try {
          await supabase.from("store_settings").upsert({ id: "primary", settings });
        } catch {}
      }

      let orders: Order[] = [];
      if (ordersRes.data && Array.isArray(ordersRes.data)) {
        orders = cleanOrders(ordersRes.data.map(mapDbOrderToModel));
      } else if (ordersRes.error) {
        console.warn("Supabase orders query warning/error:", ordersRes.error);
      }

      // Offline/Local Resilience: Always merge with local store-data.json orders in case of transient Supabase latency
      try {
        const filePath = getStoreFilePath();
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, "utf-8");
          if (raw.trim()) {
            const parsed = JSON.parse(raw) as ServerStoreData;
            if (Array.isArray(parsed.orders) && parsed.orders.length > 0) {
              const localOrders = cleanOrders(parsed.orders);
              const orderMap = new Map<string, Order>();
              for (const o of orders) {
                if (o && o.id) orderMap.set(o.id, o);
              }
              for (const o of localOrders) {
                if (o && o.id && !orderMap.has(o.id)) {
                  orderMap.set(o.id, o);
                }
              }
              orders = Array.from(orderMap.values()).sort(
                (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              );
            }
          }
        }
      } catch (err) {
        console.warn("Error merging local orders backup:", err);
      }

      let lastOrderSeq = 999;
      let deletedOrderIds: string[] = [];

      if (metaRes.data && Array.isArray(metaRes.data)) {
        for (const row of metaRes.data) {
          if (row.key === "last_order_seq") {
            lastOrderSeq = Number(row.value) || 999;
          } else if (row.key === "deleted_order_ids") {
            deletedOrderIds = Array.isArray(row.value) ? row.value : [];
          }
        }
      }

      lastOrderSeq = calculateHighestOrderSeq(orders, lastOrderSeq, deletedOrderIds);

      const updatedAt =
        (settingsRes.data as { updated_at?: string })?.updated_at ||
        cachedLastUpdated;

      return {
        products,
        settings,
        orders,
        lastOrderSeq,
        deletedOrderIds,
        updatedAt,
        isDefault: false,
      };
    } catch (err) {
      console.warn("Error fetching from Supabase, falling back to local storage:", err);
    }
  }

  // 2. Local File Storage Fallback (Offline / Dev mode before Supabase credentials)
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
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Error reading store-data.json:", err);
  }

  // 3. Absolute Fallback
  return {
    products: PRODUCTS,
    settings: {
      categories: DEFAULT_CATEGORIES,
      senderEmail: process.env.GMAIL_USER || "contact@ormasilver.com",
      senderEmailName: process.env.GMAIL_SENDER_NAME || "ORMA للفضة 925",
    },
    orders: [],
    lastOrderSeq: 999,
    deletedOrderIds: [],
    updatedAt: new Date().toISOString(),
    isDefault: false,
  };
}

// In-memory atomic async mutex to serialize concurrent database/store writes
class AsyncMutex {
  private promise: Promise<void> = Promise.resolve();

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = this.promise;
    this.promise = next;

    try {
      await current;
      return await fn();
    } finally {
      release!();
    }
  }
}

const serverStoreSaveLock = new AsyncMutex();

// ----------------------------------------------------
// SAVE DATA (Supabase Primary + Local File Sync)
// ----------------------------------------------------
export async function saveServerStoreData(
  updates: Partial<ServerStoreData>
): Promise<ServerStoreData> {
  return serverStoreSaveLock.acquire(async () => {
    const current = await getServerStoreData();

  const combinedDeletedIds = Array.from(
    new Set([
      ...(current.deletedOrderIds || []),
      ...(updates.deletedOrderIds || []),
    ])
  );

  let cleanUpdatedOrders: Order[];
  if (updates.orders !== undefined) {
    const cleaned = cleanOrders(updates.orders);
    // CRITICAL: Merge existing orders with incoming orders by ID so historical orders are NEVER deleted/replaced
    const ordersMap = new Map<string, Order>();
    // 1. Keep all current existing orders
    for (const o of current.orders) {
      if (o && o.id && !combinedDeletedIds.includes(o.id)) {
        ordersMap.set(o.id, o);
      }
    }
    // 2. Add or update incoming orders
    for (const o of cleaned) {
      if (o && o.id && !combinedDeletedIds.includes(o.id)) {
        const existing = ordersMap.get(o.id);
        ordersMap.set(o.id, existing ? { ...existing, ...o } : o);
      }
    }
    // 3. Remove any explicitly deleted orders
    for (const delId of combinedDeletedIds) {
      ordersMap.delete(delId);
    }
    cleanUpdatedOrders = Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } else {
    cleanUpdatedOrders = current.orders.filter((o) => !combinedDeletedIds.includes(o.id));
  }

  const newLastOrderSeq = calculateHighestOrderSeq(
    cleanUpdatedOrders,
    Math.max(current.lastOrderSeq || 999, updates.lastOrderSeq || 999),
    combinedDeletedIds
  );

  const updatedProducts = updates.products !== undefined ? updates.products : current.products;
  const updatedSettings = updates.settings !== undefined ? { ...current.settings, ...updates.settings } : current.settings;

  const updated: ServerStoreData = {
    products: updatedProducts,
    settings: updatedSettings,
    orders: cleanUpdatedOrders,
    lastOrderSeq: newLastOrderSeq,
    deletedOrderIds: combinedDeletedIds,
    updatedAt: new Date().toISOString(),
    isDefault: false,
  };

  cachedLastUpdated = updated.updatedAt;

  // 1. Save to Supabase Cloud Database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      if (updates.products !== undefined) {
        const dbProducts = updates.products.map(mapModelProductToDb);
        if (dbProducts.length > 0) {
          const { error: upsertErr } = await supabase.from("products").upsert(dbProducts, { onConflict: "id" });
          if (upsertErr) throw new Error(`خطأ Supabase في جدول المنتجات: ${upsertErr.message}`);
          const activeIds = updates.products.map((p) => p.id);
          // Delete any products in Supabase that are no longer in the active catalog
          const { error: delErr } = await supabase
            .from("products")
            .delete()
            .not("id", "in", `(${activeIds.map((id) => `"${id}"`).join(",")})`);
          if (delErr) console.warn("Supabase products delete warning:", delErr.message);
        } else {
          const { error: delAllErr } = await supabase.from("products").delete().neq("id", "");
          if (delAllErr) throw new Error(`خطأ Supabase في حذف المنتجات: ${delAllErr.message}`);
        }
      }

      if (updates.settings !== undefined) {
        const { error: setErr } = await supabase
          .from("store_settings")
          .upsert({ id: "primary", settings: updatedSettings, updated_at: new Date().toISOString() }, { onConflict: "id" });
        if (setErr) throw new Error(`خطأ Supabase في جدول الإعدادات: ${setErr.message}`);
      }

      if (updates.orders !== undefined) {
        const dbOrders = cleanUpdatedOrders.map(mapModelOrderToDb);
        if (dbOrders.length > 0) {
          const { error: ordErr } = await supabase.from("orders").upsert(dbOrders, { onConflict: "id" });
          if (ordErr) throw new Error(`خطأ Supabase في جدول الطلبات: ${ordErr.message}`);
        }
      }

      if (combinedDeletedIds.length > 0) {
        const { error: delOrdErr } = await supabase.from("orders").delete().in("id", combinedDeletedIds);
        if (delOrdErr) console.warn("Supabase orders delete warning:", delOrdErr.message);
      }

      const { error: metaErr } = await supabase.from("store_metadata").upsert([
        { key: "last_order_seq", value: newLastOrderSeq, updated_at: new Date().toISOString() },
        { key: "deleted_order_ids", value: combinedDeletedIds, updated_at: new Date().toISOString() },
      ], { onConflict: "key" });
      if (metaErr) console.warn("Supabase metadata warning:", metaErr.message);
    } catch (err) {
      console.error("Failed to save to Supabase:", err);
      throw err;
    }
  }

  // 2. Also save to local file for offline resilience
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write store-data.json:", err);
  }

  // 3. Instant On-Demand Revalidation on Vercel
  try {
    revalidatePath("/");
    revalidatePath("/(store)", "layout");
    revalidatePath("/collection/[slug]", "page");
    revalidatePath("/product/[id]", "page");
    revalidatePath("/admin");
  } catch {
    // In background or build contexts revalidatePath might be a no-op
  }

  return updated;
  });
}


// ----------------------------------------------------
// UPDATE ORDER STATUS (Used by Telegram Webhook & APIs)
// ----------------------------------------------------
export async function updateOrderStatusOnServer(
  orderId: string,
  newStatus: Order["status"],
  cancellationReason?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const cleanId = orderId.replace(/^#/, "");
    const current = await getServerStoreData();
    const existing = current.orders.find(
      (o) => o.id === orderId || o.id === cleanId || o.id === `#${cleanId}`
    );

    if (!existing) {
      return { success: false, error: `الطلب رقم ${orderId} غير موجود في قاعدة البيانات` };
    }

    const updatedOrder: Order = {
      ...existing,
      status: newStatus,
      cancellationReason:
        newStatus === "cancelled"
          ? cancellationReason || "تم الإلغاء عبر بوت تليجرام"
          : existing.cancellationReason,
      cancelledAt:
        newStatus === "cancelled"
          ? new Date().toISOString()
          : existing.cancelledAt,
      adminNotes: `${existing.adminNotes || ""} [tg_status:${newStatus}]`.trim(),
    };

    const saved = await saveServerStoreData({
      orders: [updatedOrder],
    });

    const finalOrder =
      saved.orders.find(
        (o) => o.id === orderId || o.id === cleanId || o.id === `#${cleanId}`
      ) || updatedOrder;

    return { success: true, order: finalOrder };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating order status";
    return { success: false, error: errorMsg };
  }
}
