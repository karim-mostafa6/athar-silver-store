import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getServerStoreData,
  saveServerStoreData,
  extractOrderSequence,
  mapDbOrderToModel,
  findOrderById,
} from "@/lib/serverStore";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { Order } from "@/context/StoreContext";
import { isSecretEnforced, webhookSecret } from "@/lib/tgWebhook";
import { safeEqual } from "@/lib/rateLimit";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { cancelDelayedWhatsAppJob } from "@/lib/whatsapp";
import { buildOrderKeyboard, formatOrderCompactTelegramMessage, formatOrderInvoiceTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Answer Telegram Callback Query to dismiss the loading spinner and show a toast alert in chat
 */
async function answerCallbackQuery(botToken: string, callbackQueryId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: false,
      }),
    });
  } catch (err) {
    console.error("[Telegram Webhook] Error answering callback query:", err);
  }
}

/**
 * Flexible Order Lookup & Update for Telegram Webhook
 * Searches directly in Supabase (id, order_number, order_id, admin_notes, sequence)
 * with graceful fallback to serverStore / local file.
 */
async function findAndUpdateOrder(
  orderIdInput: string,
  newStatus: Order["status"],
  cancellationReason?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const rawId = String(orderIdInput || "").trim();
    if (!rawId) {
      return { success: false, error: "رقم الطلب غير محدد" };
    }

    const cleanId = rawId.replace(/^#/, "").trim();
    const hashId = cleanId ? `#${cleanId}` : "";

    // Extract digits or sequence number if present (e.g. ORM-1017 -> 1017)
    const numMatch = cleanId.match(/(\d{3,6})/);
    const seqNum = numMatch ? parseInt(numMatch[1], 10) : null;

    // Build comprehensive candidate IDs
    const candidateIds = Array.from(
      new Set(
        [
          rawId,
          cleanId,
          hashId,
          cleanId.toLowerCase(),
          cleanId.toUpperCase(),
          rawId.toLowerCase(),
          rawId.toUpperCase(),
          ...(seqNum
            ? [
                `ORM-${seqNum}`,
                `#ORM-${seqNum}`,
                `ATH-${seqNum}`,
                `#ATH-${seqNum}`,
                `${seqNum}`,
                `#${seqNum}`,
                `orm-${seqNum}`,
                `ath-${seqNum}`,
              ]
            : []),
        ].filter(Boolean)
      )
    );

    // 1. SUPABASE DIRECT MULTI-STRATEGY LOOKUP & UPDATE (Fully standalone from admin dashboard)
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        let dbRow: Record<string, unknown> | null = null;

        // Strategy 1A: Search by 'id' matching any candidate
        try {
          const { data: byIdRows } = await supabase
            .from("orders")
            .select("*")
            .in("id", candidateIds)
            .limit(1);

          if (byIdRows && byIdRows.length > 0) {
            dbRow = byIdRows[0] as Record<string, unknown>;
          }
        } catch (e1) {
          console.warn("[Telegram Webhook] Strategy 1A notice:", e1);
        }

        // Strategy 1B: Search by 'order_number' column if present
        if (!dbRow) {
          try {
            const { data: byOrderNum } = await supabase
              .from("orders")
              .select("*")
              .in("order_number", candidateIds)
              .limit(1);
            if (byOrderNum && byOrderNum.length > 0) {
              dbRow = byOrderNum[0] as Record<string, unknown>;
            }
          } catch {}
        }

        // Strategy 1C: Search by 'order_id' column if present
        if (!dbRow) {
          try {
            const { data: byOrderId } = await supabase
              .from("orders")
              .select("*")
              .in("order_id", candidateIds)
              .limit(1);
            if (byOrderId && byOrderId.length > 0) {
              dbRow = byOrderId[0] as Record<string, unknown>;
            }
          } catch {}
        }

        // Strategy 1D: Search by ilike on 'id' with sequence digits
        if (!dbRow && seqNum) {
          try {
            const { data: byIdLike } = await supabase
              .from("orders")
              .select("*")
              .ilike("id", `%${seqNum}%`)
              .order("created_at", { ascending: false })
              .limit(1);
            if (byIdLike && byIdLike.length > 0) {
              dbRow = byIdLike[0] as Record<string, unknown>;
            }
          } catch {}
        }

        // Strategy 1E: Search by ilike in 'admin_notes'
        if (!dbRow && cleanId) {
          try {
            const { data: byNotes } = await supabase
              .from("orders")
              .select("*")
              .ilike("admin_notes", `%${cleanId}%`)
              .order("created_at", { ascending: false })
              .limit(1);
            if (byNotes && byNotes.length > 0) {
              dbRow = byNotes[0] as Record<string, unknown>;
            }
          } catch {}
        }

        // Strategy 1F: Broad fallback scan of recent orders if still not found
        if (!dbRow) {
          try {
            const { data: recentRows } = await supabase
              .from("orders")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(100);

            if (recentRows && recentRows.length > 0) {
              const candLower = candidateIds.map((c) => c.toLowerCase());
              for (const r of recentRows) {
                const rId = String(r.id || "").trim();
                const rClean = rId.replace(/^#/, "").trim();
                if (
                  candidateIds.includes(rId) ||
                  candidateIds.includes(rClean) ||
                  candLower.includes(rId.toLowerCase()) ||
                  candLower.includes(rClean.toLowerCase())
                ) {
                  dbRow = r as Record<string, unknown>;
                  break;
                }
                if (seqNum !== null && (rId.includes(String(seqNum)) || extractOrderSequence(rId) === seqNum)) {
                  dbRow = r as Record<string, unknown>;
                  break;
                }
              }
            }
          } catch {}
        }

        // If found in Supabase, update immediately directly in Supabase
        if (dbRow && dbRow.id) {
          const targetDbId = String(dbRow.id);
          const existingNotes = String(dbRow.admin_notes || "");
          const updatedNotes = `${existingNotes} [tg_status:${newStatus}]`.trim();

          const updatePayload: Record<string, unknown> = {
            status: newStatus,
            admin_notes: updatedNotes,
          };

          if (newStatus === "cancelled") {
            updatePayload.cancellation_reason = cancellationReason || "تم الإلغاء عبر بوت تليجرام";
            updatePayload.cancelled_at = new Date().toISOString();
            // Automatically cancel any pending 3-minute WhatsApp confirmation
            cancelDelayedWhatsAppJob(targetDbId);
            cancelDelayedWhatsAppJob(rawId);
            cancelDelayedWhatsAppJob(cleanId);
          }

          const { data: updatedRows, error: updateErr } = await supabase
            .from("orders")
            .update(updatePayload)
            .eq("id", targetDbId)
            .select();

          if (updateErr) {
            console.error("[Telegram Webhook] Direct Supabase update error:", updateErr);
          }

          const mergedRow = {
            ...dbRow,
            ...updatePayload,
            ...(updatedRows && updatedRows[0] ? updatedRows[0] : {}),
          };

          const modelOrder = mapDbOrderToModel(mergedRow);

          // Sync with serverStore memory and local disk in background
          try {
            await saveServerStoreData({
              orders: [modelOrder],
            });
          } catch (syncErr) {
            console.warn("[Telegram Webhook] Warning syncing to serverStore:", syncErr);
          }

          return { success: true, order: modelOrder };
        }
      } catch (sbErr) {
        console.warn("[Telegram Webhook] Error during Supabase order lookup:", sbErr);
      }
    }

    // 2. SERVER STORE / LOCAL CACHE FALLBACK LOOKUP & UPDATE
    const currentStore = await getServerStoreData();
    const candidateLower = candidateIds.map((c) => c.toLowerCase());

    const foundInStore = currentStore.orders.find((o) => {
      if (!o || !o.id) return false;
      const oId = String(o.id).trim();
      const oClean = oId.replace(/^#/, "").trim();

      // Direct exact match
      if (candidateIds.includes(oId) || candidateIds.includes(oClean)) return true;
      // Case-insensitive match
      if (candidateLower.includes(oId.toLowerCase()) || candidateLower.includes(oClean.toLowerCase())) {
        return true;
      }

      // Numeric sequence match
      if (seqNum !== null) {
        const oSeq = extractOrderSequence(oId);
        if (oSeq === seqNum) return true;
        if (oId.includes(String(seqNum))) return true;
      }

      // Admin notes match
      if (cleanId && o.adminNotes && o.adminNotes.toLowerCase().includes(cleanId.toLowerCase())) {
        return true;
      }

      return false;
    });

    if (foundInStore) {
      const updatedStoreOrder: Order = {
        ...foundInStore,
        status: newStatus,
        cancellationReason:
          newStatus === "cancelled"
            ? cancellationReason || "تم الإلغاء عبر بوت تليجرام"
            : foundInStore.cancellationReason,
        cancelledAt:
          newStatus === "cancelled"
            ? new Date().toISOString()
            : foundInStore.cancelledAt,
        adminNotes: `${foundInStore.adminNotes || ""} [tg_status:${newStatus}]`.trim(),
      };

      if (newStatus === "cancelled") {
        cancelDelayedWhatsAppJob(foundInStore.id);
        cancelDelayedWhatsAppJob(rawId);
        cancelDelayedWhatsAppJob(cleanId);
      }

      const saved = await saveServerStoreData({
        orders: [updatedStoreOrder],
      });

      const finalOrder =
        saved.orders.find(
          (o) => o.id === updatedStoreOrder.id || o.id === foundInStore.id
        ) || updatedStoreOrder;

      return { success: true, order: finalOrder };
    }

    return {
      success: false,
      error: `الطلب رقم ${orderIdInput} غير موجود في قاعدة البيانات`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating order status";
    console.error("[Telegram Webhook] Exception in findAndUpdateOrder:", err);
    return { success: false, error: errorMsg };
  }
}

/**
 * POST /api/telegram/webhook
 * Receives incoming updates from Telegram (specifically Callback Queries when buttons are clicked)
 */
export async function POST(request: NextRequest) {
  try {
    const rawBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const botToken = rawBotToken ? rawBotToken.trim().replace(/^["']|["']$/g, "") : "";

    if (!botToken) {
      console.error("[Telegram Webhook] TELEGRAM_BOT_TOKEN is not configured");
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 });
    }

    // Only Telegram (which echoes the secret we registered) may call this endpoint.
    if (await isSecretEnforced()) {
      const provided = request.headers.get("x-telegram-bot-api-secret-token") || "";
      if (!safeEqual(provided, webhookSecret())) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));

    // 1. Handle Callback Queries (when a button is clicked)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const queryId = callbackQuery.id;
      const dataStr = String(callbackQuery.data || "").trim();
      const message = callbackQuery.message;
      const chatId = message?.chat?.id || process.env.TELEGRAM_CHAT_ID;
      const messageId = message?.message_id;
      const currentText = String(message?.text || "");

      if (dataStr.startsWith("details:") || dataStr.startsWith("compact:")) {
        const expand = dataStr.startsWith("details:");
        const found = await findOrderById(dataStr.slice(dataStr.indexOf(":") + 1));
        if (!found) {
          await answerCallbackQuery(botToken, queryId, "⚠️ الطلب غير موجود");
          return NextResponse.json({ ok: true });
        }
        await answerCallbackQuery(botToken, queryId, expand ? "📋 التفاصيل" : "🔼 تم الإخفاء");
        // Edit the SAME message in place (keeps the chat short); keep any status banner already on it.
        const bannerIdx = currentText.indexOf("\n\n📌 الحالة الحالية:");
        const banner = bannerIdx >= 0 ? currentText.slice(bannerIdx) : "";
        const active = ["processing", "shipped", "cancelled"].includes(found.status) ? found.status : undefined;
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: `${expand ? formatOrderInvoiceTelegramMessage(found) : formatOrderCompactTelegramMessage(found)}${banner}`,
              disable_web_page_preview: true,
              reply_markup: { inline_keyboard: buildOrderKeyboard(found, active as Order["status"] | undefined, expand) },
            }),
          });
        } catch (e) {
          console.error("[Telegram Webhook] details edit failed:", e);
        }
        return NextResponse.json({ ok: true });
      }

      if (!dataStr.startsWith("status:")) {
        await answerCallbackQuery(botToken, queryId, "إجراء غير معروف");
        return NextResponse.json({ ok: true });
      }

      const parts = dataStr.split(":");
      const newStatus = parts[1] as Order["status"];
      const orderId = parts.slice(2).join(":").trim();

      const validStatuses: Record<string, { label: string; badge: string }> = {
        processing: { label: "جاري التجهيز", badge: "📦" },
        shipped: { label: "تم الشحن", badge: "🚚" },
        cancelled: { label: "ملغي", badge: "❌" },
      };

      const statusMeta = validStatuses[newStatus];
      if (!statusMeta || !orderId) {
        await answerCallbackQuery(botToken, queryId, "حالة أو رقم طلب غير صالح");
        return NextResponse.json({ ok: true });
      }

      // Update the order using flexible multi-strategy lookup (Supabase + local store fallback)
      const updateResult = await findAndUpdateOrder(orderId, newStatus);

      if (!updateResult.success || !updateResult.order) {
        await answerCallbackQuery(
          botToken,
          queryId,
          `⚠️ ${updateResult.error || "تعذر العثور على الطلب لتحديثه"}`
        );
        return NextResponse.json({ ok: true });
      }

      const updatedOrder = updateResult.order;
      const orderNum = updatedOrder.id.startsWith("#") ? updatedOrder.id : `#${updatedOrder.id}`;

      // Acknowledge callback query immediately with toast in Telegram
      await answerCallbackQuery(
        botToken,
        queryId,
        `✅ تم تحديث حالة الطلب ${orderNum} إلى: ${statusMeta.label}`
      );

      // Edit message text in Telegram to display the updated status and Cairo timestamp
      if (chatId && messageId && currentText) {
        const dateStr = new Date().toLocaleString("ar-EG", {
          timeZone: "Africa/Cairo",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const statusBanner = `\n\n📌 الحالة الحالية: ${statusMeta.badge} ${statusMeta.label}\n🕒 تاريخ التحديث: ${dateStr}`;
        const baseText = currentText.split("\n\n📌 الحالة الحالية:")[0].trim();
        const updatedText = `${baseText}${statusBanner}`;

        const keyboard = buildOrderKeyboard(updatedOrder, newStatus, currentText.includes("📦 القطع المطلوبة"));

        try {
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: updatedText,
              reply_markup: {
                inline_keyboard: keyboard,
              },
            }),
          });
        } catch (editErr) {
          console.error("[Telegram Webhook] Failed to edit message:", editErr);
        }
      }

      // Revalidate Admin and Orders paths so dashboard reflects it instantly upon next visit
      try {
        revalidatePath("/admin");
        revalidatePath("/api/orders");
        revalidatePath("/api/data");
      } catch (revErr) {
        console.warn("[Telegram Webhook] Revalidation notice:", revErr);
      }

      return NextResponse.json({
        ok: true,
        orderId: updatedOrder.id,
        newStatus: updatedOrder.status,
      });
    }

    // 2. Handle /start or general bot messages
    if (body.message?.text && body.message.chat?.id) {
      const chatId = body.message.chat.id;
      const text = String(body.message.text).trim();

      const reply = (t: string) =>
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: t }),
        }).catch(() => null);

      if (/^\/id(@\w+)?$/i.test(text)) {
        await reply(`رقم الشات ده: ${chatId}`);
        return NextResponse.json({ ok: true });
      }

      // /setcart (sent inside the new group) routes abandoned-cart alerts to THAT chat.
      // Only the shop owner (a member of the main orders chat) may do this, otherwise a stranger who
      // finds the bot could redirect customer data to themselves.
      if (/^\/setcart(@\w+)?$/i.test(text)) {
        const mainChat = (process.env.TELEGRAM_CHAT_ID || "").trim().replace(/^["']|["']$/g, "");
        const fromId = body.message.from?.id;
        let allowed = Boolean(mainChat && fromId && String(fromId) === mainChat);
        if (!allowed && mainChat && fromId) {
          try {
            const r = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: mainChat, user_id: fromId }),
            });
            const j = await r.json();
            allowed = Boolean(j?.ok && ["creator", "administrator", "member"].includes(j.result?.status));
          } catch {}
        }
        if (!allowed) {
          await reply("⛔ الأمر ده لصاحب المتجر بس.");
          return NextResponse.json({ ok: true });
        }
        try {
          await getSupabaseAdminClient()
            .from("app_config")
            .upsert({ key: "telegram_cart_chat_id", value: String(chatId) });
          await reply("✅ تمام. من دلوقتي تنبيهات السلات المتروكة هتيجي في الشات ده، والطلبات هتفضل في شاتها الأصلي.");
        } catch {
          await reply("⚠️ تعذر الحفظ، جرّب تاني بعد شوية.");
        }
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/start") || text.startsWith("/help")) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "مرحباً بك في بوت متجر أورما للفضة الإسترليني 925 👑⚡\n\nيصلك إشعار فوري عند كل طلب شراء جديد، ويمكنك تغيير حالة أي طلب مباشرة عبر الأزرار التفاعلية أسفل رسالة كل طلب.",
          }),
        }).catch(() => null);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("[Telegram Webhook Error]:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/telegram/webhook
 * Diagnostics & One-Click Telegram Webhook Registration
 */
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: "غير مصرح." }, { status: 401 });
    }
    const rawBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const botToken = rawBotToken ? rawBotToken.trim().replace(/^["']|["']$/g, "") : "";

    if (!botToken) {
      return NextResponse.json(
        { success: false, error: "TELEGRAM_BOT_TOKEN is not configured in environment variables" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const setUrl = searchParams.get("set_url");

    // 1. One-Click Register Webhook
    if (setUrl) {
      const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: setUrl,
          secret_token: webhookSecret(),
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: false,
        }),
      });
      const setResult = await setRes.json();
      return NextResponse.json({
        success: true,
        action: "setWebhook",
        url: setUrl,
        result: setResult,
      });
    }

    // 2. Fetch current Webhook status
    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoResult = await infoRes.json();

    const host = request.headers.get("host") || "your-domain.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const currentWebhookEndpoint = `${protocol}://${host}/api/telegram/webhook`;

    return NextResponse.json({
      success: true,
      currentWebhookEndpoint,
      telegramWebhookInfo: infoResult,
      quickSetupUrl: `${currentWebhookEndpoint}?set_url=${encodeURIComponent(currentWebhookEndpoint)}`,
      instructions: "To register or refresh this webhook with Telegram, simply open the `quickSetupUrl` in your browser.",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error querying webhook info" },
      { status: 500 }
    );
  }
}
