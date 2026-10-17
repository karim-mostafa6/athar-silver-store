// Lightweight, anonymous, first-party tracking (no cookies, no third parties).
const SRC_KEY = "orma_src";
const SID_KEY = "orma_sid";

const SOURCE_MATCHERS: [string, RegExp][] = [
  ["instagram", /instagram|ig\.me|l\.instagram/i],
  ["tiktok", /tiktok/i],
  ["facebook", /facebook|fb\.com|fb\.me|m\.facebook|l\.facebook|meta/i],
  ["whatsapp", /whatsapp|wa\.me/i],
  ["youtube", /youtube|youtu\.be/i],
  ["snapchat", /snapchat/i],
  ["twitter", /twitter|t\.co|x\.com/i],
  ["google", /google|bing|duckduckgo/i],
];

function detectSource(): string | null {
  try {
    const q = new URLSearchParams(window.location.search);
    const explicit = q.get("utm_source") || q.get("ref") || q.get("src");
    if (explicit) {
      const hit = SOURCE_MATCHERS.find(([, re]) => re.test(explicit));
      return hit ? hit[0] : "other";
    }
    const ref = document.referrer;
    if (ref) {
      const host = new URL(ref).host;
      if (host && host !== window.location.host) {
        const hit = SOURCE_MATCHERS.find(([, re]) => re.test(host));
        return hit ? hit[0] : "other";
      }
    }
  } catch {}
  return null;
}

export function getSid(): string {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, "");
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function getSource(): string {
  try {
    return localStorage.getItem(SRC_KEY) || "direct";
  } catch {
    return "direct";
  }
}

export function trackEvent(type: "view" | "add_to_cart" | "checkout_start") {
  try {
    const sid = getSid();
    if (!sid) return;
    const k = `orma_ev_${type}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    fetch("/api/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid, type, source: getSource() }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function initTracking() {
  try {
    const s = detectSource();
    if (s) localStorage.setItem(SRC_KEY, s);
    trackEvent("view");
  } catch {}
}
