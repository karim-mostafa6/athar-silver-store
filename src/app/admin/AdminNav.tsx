"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Lock, X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Which section each tab belongs to (Shopify-style grouping). Unknown tabs fall into "أخرى".
const GROUP_OF: Record<string, string> = {
  orders: "المبيعات",
  customers: "المبيعات",
  analytics: "المبيعات",
  products: "الكتالوج",
  collections: "الكتالوج",
  pages: "الكتالوج",
  hero: "واجهة المتجر",
  marquee: "واجهة المتجر",
  nav: "واجهة المتجر",
  story: "واجهة المتجر",
  footer: "واجهة المتجر",
  logo: "واجهة المتجر",
  checkout: "الدفع والشحن",
  payment: "الدفع والشحن",
  shipping: "الدفع والشحن",
  promos: "الدفع والشحن",
  contact: "الإعدادات والفريق",
  email: "الإعدادات والفريق",
  policies: "الإعدادات والفريق",
  users: "الإعدادات والفريق",
};
const GROUP_ORDER = ["المبيعات", "الكتالوج", "واجهة المتجر", "الدفع والشحن", "الإعدادات والفريق", "أخرى"];

export function groupNavItems(items: NavItem[]): NavGroup[] {
  const map = new Map<string, NavItem[]>();
  for (const it of items) {
    const g = GROUP_OF[it.id] || "أخرى";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(it);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ title: g, items: map.get(g)! }));
}

// Mobile navigation: one compact bar showing the current section; tapping it opens a full-height
// sheet with every section grouped and big tap targets (replaces the long horizontal tab strip).
export function AdminMobileNav({
  groups,
  activeId,
  onSelect,
  locked,
}: {
  groups: NavGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);
  const all = groups.flatMap((g) => g.items);
  const current = all.find((i) => i.id === activeId);
  const pending = all.find((i) => i.id === "orders")?.badge || 0;

  return (
    <div className="md:hidden mt-2.5 pt-2 border-t border-[#e8ded0]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 px-3.5 rounded-xl bg-white border border-[#ded2c0] text-[#292722] active:scale-[0.99]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-bold min-w-0">
          <span className="text-[#c5a880] shrink-0">{current?.icon}</span>
          <span className="truncate">{current?.label || "القائمة"}</span>
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[#756555] shrink-0">
          {pending > 0 && activeId !== "orders" && (
            <span className="px-1.5 rounded-full bg-amber-500 text-[#292722] font-black">{pending}</span>
          )}
          كل الأقسام
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="أقسام لوحة التحكم">
          <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-[#F5F0E7] rounded-t-3xl max-h-[88dvh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#e8ded0]">
              <span className="font-amiri text-lg font-bold text-[#292722]">أقسام لوحة التحكم</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-[#ded2c0] flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 py-3 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="px-1 pb-1.5 text-[11px] font-bold tracking-wide text-[#8c7865]">{g.title}</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {g.items.map((it) => {
                      const active = it.id === activeId;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onSelect(it.id);
                          }}
                          className={`min-h-[48px] w-full flex items-center justify-between gap-3 px-3.5 rounded-xl text-sm text-right transition-colors ${
                            active
                              ? "bg-[#292722] text-[#F5F0E7] font-bold"
                              : "bg-white border border-[#e8ded0] text-[#3d342b] active:bg-[#ede3d3]"
                          }`}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <span className={active ? "text-[#c5a880]" : "text-[#8c7865]"}>{it.icon}</span>
                            <span className="truncate">{it.label}</span>
                          </span>
                          <span className="flex items-center gap-2 shrink-0">
                            {it.badge ? (
                              <span className="px-1.5 rounded-full bg-amber-500 text-[#292722] text-[10px] font-black">{it.badge}</span>
                            ) : null}
                            {locked && !["orders", "customers", "analytics"].includes(it.id) && (
                              <Lock className="w-3 h-3 text-[#baa996]" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
