"use client";

import { useEffect, useRef } from "react";
import { BUILD_ID } from "@/lib/version";

/**
 * MobileSafariCacheBuster
 * Dedicated ultra-lightweight client component to handle Mobile Safari & Social In-App WebViews
 * (Instagram, Facebook, TikTok) that aggressively cache HTML and JS bundles.
 * 
 * Performs non-destructive auto-eviction of stale cache when a new Build ID is detected on Vercel.
 */
export function MobileSafariCacheBuster() {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    try {
      const storedBuild = localStorage.getItem("athar_client_build_id");
      if (!storedBuild) {
        localStorage.setItem("athar_client_build_id", BUILD_ID);
      } else if (storedBuild !== BUILD_ID) {
        console.log(`[Cache Buster] Bundle mismatch detected (client: ${storedBuild}, bundle: ${BUILD_ID}). Upgrading cache...`);
        localStorage.setItem("athar_client_build_id", BUILD_ID);

        // Evict outdated product & settings caches from localStorage without touching sessions
        localStorage.removeItem("athar_custom_products");
        localStorage.removeItem("athar_store_settings");

        // Clear browser Caches API if available (used by Service Workers / Safari)
        if ("caches" in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          }).catch(() => {});
        }
      }
    } catch {}

    // Periodic Background Version Check (every 60s) for long-lived tabs & social webviews
    const interval = setInterval(() => {
      fetch(`/api/version?_cb=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.buildId) {
            const currentStored = localStorage.getItem("athar_client_build_id");
            if (currentStored && currentStored !== data.buildId) {
              console.log(`[Cache Buster] Upstream update detected: ${data.buildId}. Refreshing app smoothly...`);
              localStorage.setItem("athar_client_build_id", data.buildId);
              localStorage.removeItem("athar_custom_products");
              localStorage.removeItem("athar_store_settings");

              if ("caches" in window) {
                caches.keys().then((keys) => {
                  keys.forEach((key) => caches.delete(key));
                }).catch(() => {});
              }

              // Reload smoothly to load latest build assets
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }
          }
        })
        .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
