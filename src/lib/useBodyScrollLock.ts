"use client";

import { useEffect } from "react";

// Shared, reference-counted body scroll lock.
// - Several overlays (cart -> checkout, quick view -> size guide) can be open at once;
//   the page only unlocks when the LAST one closes (the old per-component
//   `overflow` save/restore could leave the page stuck locked or let the
//   background scroll again).
// - iOS Safari ignores `overflow: hidden` on <body>, so the page is pinned with
//   position: fixed and the scroll position is restored on unlock.
let lockCount = 0;
let savedScrollY = 0;
let saved: { position: string; top: string; left: string; right: string; width: string; overflow: string } | null = null;

function lock() {
  if (lockCount++ > 0) return;
  const b = document.body;
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  saved = {
    position: b.style.position,
    top: b.style.top,
    left: b.style.left,
    right: b.style.right,
    width: b.style.width,
    overflow: b.style.overflow,
  };
  b.style.position = "fixed";
  b.style.top = `-${savedScrollY}px`;
  b.style.left = "0";
  b.style.right = "0";
  b.style.width = "100%";
  b.style.overflow = "hidden";
}

function unlock() {
  if (lockCount === 0) return;
  if (--lockCount > 0) return;
  const b = document.body;
  if (saved) {
    b.style.position = saved.position;
    b.style.top = saved.top;
    b.style.left = saved.left;
    b.style.right = saved.right;
    b.style.width = saved.width;
    b.style.overflow = saved.overflow;
    saved = null;
  }
  window.scrollTo(0, savedScrollY);
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return () => unlock();
  }, [active]);
}
