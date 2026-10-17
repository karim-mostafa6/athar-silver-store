import fs from "fs";
import { cache } from "react";
import path from "path";
import { revalidatePath } from "next/cache";
import { Product, PRODUCTS, DEFAULT_CATEGORIES } from "@/data/products";
import { StoreSettings, Order } from "@/context/StoreContext";
import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";
import { externalizeInlineImages } from "./imageStorage";

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
    // cost_price is private: omit when unknown (e.g. public snapshot without it) so it is never wiped; 0 = clear
    ...(p.costPrice === undefined ? {} : { cost_price: p.costPrice > 0 ? p.costPrice : null }),
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
    source: row.source ? String(row.source) : undefined,
    waStatus: row.wa_status ? (String(row.wa_status) as Order["waStatus"]) : undefined,
    waSentAt: row.wa_sent_at ? String(row.wa_sent_at) : undefined,
    waError: row.wa_error ? String(row.wa_error) : undefined,
    needsReview: Boolean(row.needs_review),
    reviewReasons: row.review_reasons ? String(row.review_reasons) : undefined,
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
    source: o.source || null,
    // NOTE: wa_status / wa_sent_at / wa_error are intentionally NOT written here.
    // They are owned by the WhatsApp dispatcher (patchOrderFields) so a stale admin
    // client can never revert "sent" back to "pending" and trigger a duplicate message.
    needs_review: Boolean(o.needsReview),
    review_reasons: o.reviewReasons || null,
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


function maxIsoDate(values: Array<string | null | undefined>): string {
  let best = 0;
  for (const v of values) {
    if (!v) continue;
    const t = new Date(v).getTime();
    if (!Number.isNaN(t) && t > best) best = t;
  }
  return best ? new Date(best).toISOString() : "";
}

/**
 * Cheap freshness probe (two tiny queries, no payloads). Clients poll this instead of
 * downloading the whole catalog + settings just to find out nothing changed.
 */
export async function getCatalogVersion(): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const [prod, sett] = await Promise.all([
        supabase.from("products").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("store_settings").select("updated_at").eq("id", "primary").maybeSingle(),
      ]);
      const v = maxIsoDate([
        (prod.data as { updated_at?: string } | null)?.updated_at,
        (sett.data as { updated_at?: string } | null)?.updated_at,
      ]);
      if (v) return v;
    } catch {
      // fall through
    }
  }
  return (await getServerStoreData()).updatedAt || cachedLastUpdated;
}


/**
 * Storefront snapshot: products + settings only (no orders / customers), straight from the
 * database on every call. Used by the server-rendered layout on each request.
 */
/** Cost price is private business data: never ship it to visitors. */
export function toPublicProduct(p: Product): Product {
  const { costPrice, ...rest } = p;
  void costPrice;
  return rest as Product;
}

export async function getPublicStoreSnapshot(): Promise<{ products: Product[]; settings: Partial<StoreSettings>; updatedAt: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const [productsRes, settingsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("store_settings").select("settings, updated_at").eq("id", "primary").maybeSingle(),
      ]);
      if (productsRes.error) throw new Error(productsRes.error.message);
      if (settingsRes.error) throw new Error(settingsRes.error.message);
      const rows = (productsRes.data || []) as Array<Record<string, unknown>>;
      if (rows.length > 0 && settingsRes.data && settingsRes.data.settings) {
        return {
          products: rows.map(mapDbProductToModel).map(toPublicProduct),
          settings: settingsRes.data.settings as Partial<StoreSettings>,
          updatedAt:
            maxIsoDate([
              (settingsRes.data as { updated_at?: string }).updated_at,
              ...rows.map((r) => r.updated_at as string | undefined),
            ]) || cachedLastUpdated,
        };
      }
    } catch (err) {
      console.warn("getPublicStoreSnapshot: falling back to full read:", err);
    }
  }
  const full = await getServerStoreData();
  return { products: full.products.map(toPublicProduct), settings: full.settings, updatedAt: full.updatedAt };
}

// One read per request: the root layout and page-level metadata share the same snapshot.
export const getPublicStoreSnapshotCached = cache(getPublicStoreSnapshot);

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
          senderEmail: process.env.GMAIL_USER || "",
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

      // Freshness token = the newest change across catalog AND settings.
      // (It used to be settings.updated_at only, so editing just products never changed the
      // token and already-open storefronts / in-app browsers kept showing the old catalog.)
      const productRows = (productsRes.data || []) as Array<{ updated_at?: string }>;
      const updatedAt = maxIsoDate([
        (settingsRes.data as { updated_at?: string } | null)?.updated_at,
        ...productRows.map((r) => r.updated_at),
      ]) || cachedLastUpdated;

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
      senderEmail: process.env.GMAIL_USER || "",
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

  let updatedProducts = updates.products !== undefined ? updates.products : current.products;
  let updatedSettings = updates.settings !== undefined ? { ...current.settings, ...updates.settings } : current.settings;

  // Keep large inline images out of the database: move them to Storage and store URLs only.
  // Runs on the merged settings, so any settings save also migrates images already stored inline.
  if (updates.settings !== undefined) {
    updatedSettings = (await externalizeInlineImages(updatedSettings, "site")).value;
  }
  if (updates.products !== undefined) {
    updatedProducts = (await externalizeInlineImages(updatedProducts, "products")).value;
  }

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
        const dbProducts = updatedProducts.map(mapModelProductToDb);
        if (dbProducts.length > 0) {
          const { error: upsertErr } = await supabase.from("products").upsert(dbProducts, { onConflict: "id" });
          if (upsertErr) throw new Error(`خطأ Supabase في جدول المنتجات: ${upsertErr.message}`);
          const activeIds = new Set(updatedProducts.map((p) => p.id));
          // Delete any products in Supabase that are no longer in the active catalog.
          // Explicit id list (instead of a negated IN filter) and a hard failure: if the delete
          // does not happen the admin must be told, otherwise removed products keep showing to
          // customers while looking deleted on the admin's own screen.
          const { data: existingRows, error: listErr } = await supabase.from("products").select("id");
          if (listErr) throw new Error(`خطأ Supabase في قراءة المنتجات: ${listErr.message}`);
          const toDelete = (existingRows || []).map((r: { id: string }) => r.id).filter((id: string) => !activeIds.has(id));
          if (toDelete.length > 0) {
            const { error: delErr } = await supabase.from("products").delete().in("id", toDelete);
            if (delErr) throw new Error(`خطأ Supabase في حذف المنتجات: ${delErr.message}`);
          }
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
// FAST PATH: save only the products that changed (add / edit / delete one product)
// ----------------------------------------------------
// Sending and rewriting the whole catalog for a single edit was slow, and let a stale admin tab
// overwrite edits made elsewhere. Only the touched rows are written here.
export async function saveProductsDelta(input: {
  upserts?: Product[];
  deletedIds?: string[];
}): Promise<{ catalogVersion: string; savedCount: number; deletedCount: number }> {
  const deletedIds = Array.from(new Set((input.deletedIds || []).filter(Boolean).map(String)));
  const deletedSet = new Set(deletedIds);
  const upserts = (input.upserts || []).filter((p) => p && p.id && !deletedSet.has(p.id));

  if (!isSupabaseConfigured()) {
    const current = await getServerStoreData();
    const map = new Map(current.products.map((p) => [p.id, p]));
    for (const id of deletedIds) map.delete(id);
    for (const p of upserts) map.set(p.id, p);
    const saved = await saveServerStoreData({ products: Array.from(map.values()) });
    return { catalogVersion: saved.updatedAt, savedCount: upserts.length, deletedCount: deletedIds.length };
  }

  return serverStoreSaveLock.acquire(async () => {
    const supabase = getSupabaseAdminClient();
    const { value: cleanUpserts } = await externalizeInlineImages(upserts, "products");

    if (cleanUpserts.length > 0) {
      const { error } = await supabase
        .from("products")
        .upsert(cleanUpserts.map(mapModelProductToDb), { onConflict: "id" });
      if (error) throw new Error(`خطأ Supabase في جدول المنتجات: ${error.message}`);
    }
    if (deletedIds.length > 0) {
      const { error } = await supabase.from("products").delete().in("id", deletedIds);
      if (error) throw new Error(`خطأ Supabase في حذف المنتجات: ${error.message}`);
    }

    const catalogVersion = await getCatalogVersion();
    cachedLastUpdated = catalogVersion || cachedLastUpdated;
    return { catalogVersion, savedCount: cleanUpserts.length, deletedCount: deletedIds.length };
  });
}


// ----------------------------------------------------
// FAST PATH: save only the orders that changed (status changes, notes, deletions)
// ----------------------------------------------------
// The generic saveServerStoreData() re-reads the whole store and re-upserts EVERY order on each
// call, which made each click in the admin orders screen cost several database round trips and
// queue up behind the previous click. This path touches only the rows that actually changed.
// Incoming orders REPLACE the stored row for that id (last write wins per order, not per list),
// so a stale admin tab can no longer overwrite orders it did not touch (e.g. ones the Telegram
// bot confirmed in the meantime).
export async function saveOrdersDelta(input: {
  orders?: Order[];
  deletedOrderIds?: string[];
  lastOrderSeq?: number;
}): Promise<{ lastOrderSeq: number; savedCount: number }> {
  if (!isSupabaseConfigured()) {
    const saved = await saveServerStoreData({
      orders: input.orders,
      deletedOrderIds: input.deletedOrderIds,
      lastOrderSeq: input.lastOrderSeq,
    });
    return { lastOrderSeq: saved.lastOrderSeq || 999, savedCount: (input.orders || []).length };
  }

  return serverStoreSaveLock.acquire(async () => {
    const supabase = getSupabaseAdminClient();
    const deleted = Array.from(new Set((input.deletedOrderIds || []).filter(Boolean).map(String)));
    const deletedSet = new Set(deleted);
    const incoming = cleanOrders(input.orders || []).filter((o) => !deletedSet.has(o.id));

    // Stored bookkeeping (one small read). Missing table => treated as empty, like before.
    let storedSeq = 999;
    let storedDeleted: string[] = [];
    const metaRes = await supabase.from("store_metadata").select("key, value");
    if (!metaRes.error && Array.isArray(metaRes.data)) {
      for (const row of metaRes.data) {
        if (row.key === "last_order_seq") storedSeq = Number(row.value) || 999;
        if (row.key === "deleted_order_ids" && Array.isArray(row.value)) storedDeleted = row.value as string[];
      }
    }

    const newSeq = calculateHighestOrderSeq(
      incoming,
      Math.max(storedSeq, Number(input.lastOrderSeq) || 999),
      deleted
    );
    const mergedDeleted = Array.from(new Set([...storedDeleted, ...deleted]));

    const writes: PromiseLike<{ error: { message: string } | null }>[] = [];
    if (incoming.length > 0) {
      writes.push(
        supabase.from("orders").upsert(incoming.map(mapModelOrderToDb), { onConflict: "id" }) as unknown as PromiseLike<{
          error: { message: string } | null;
        }>
      );
    }
    if (deleted.length > 0) {
      writes.push(
        supabase.from("orders").delete().in("id", deleted) as unknown as PromiseLike<{ error: { message: string } | null }>
      );
    }
    const results = await Promise.all(writes);
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(`خطأ Supabase في جدول الطلبات: ${failed.error.message}`);

    // Bookkeeping only when something actually changed (best effort, never blocks the save).
    if (newSeq !== storedSeq || mergedDeleted.length !== storedDeleted.length) {
      const nowIso = new Date().toISOString();
      const metaWrite = await supabase.from("store_metadata").upsert(
        [
          { key: "last_order_seq", value: newSeq, updated_at: nowIso },
          { key: "deleted_order_ids", value: mergedDeleted, updated_at: nowIso },
        ],
        { onConflict: "key" }
      );
      if (metaWrite.error) console.warn("Supabase metadata warning:", metaWrite.error.message);
    }

    return { lastOrderSeq: newSeq, savedCount: incoming.length };
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


// ----------------------------------------------------
// Targeted order field patch (does not touch other columns / other orders)
// ----------------------------------------------------
export async function patchOrderFields(
  orderId: string,
  fields: Partial<Pick<Order, "waStatus" | "waSentAt" | "waError" | "needsReview" | "reviewReasons" | "adminNotes" | "source">>
): Promise<boolean> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      const row: Record<string, unknown> = {};
      if (fields.waStatus !== undefined) row.wa_status = fields.waStatus;
      if (fields.waSentAt !== undefined) row.wa_sent_at = fields.waSentAt;
      if (fields.waError !== undefined) row.wa_error = fields.waError;
      if (fields.needsReview !== undefined) row.needs_review = fields.needsReview;
      if (fields.reviewReasons !== undefined) row.review_reasons = fields.reviewReasons;
      if (fields.adminNotes !== undefined) row.admin_notes = fields.adminNotes;
      if (fields.source !== undefined) row.source = fields.source;
      const { error } = await supabase.from("orders").update(row).eq("id", orderId);
      return !error;
    }
    const current = await getServerStoreData();
    const existing = current.orders.find((o) => o.id === orderId);
    if (!existing) return false;
    await saveServerStoreData({ orders: [{ ...existing, ...fields }] });
    return true;
  } catch {
    return false;
  }
}
