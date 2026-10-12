"use client";

import React from "react";
import { CheckCircle2, Heart, Sparkles, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "cart" | "wishlist" | "promo" | "info";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#1c1815] text-[#faf8f5] shadow-2xl border border-[#3d3630] animate-pop text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2e2722] border border-[#4d443c] flex items-center justify-center text-[#d8c8b4] shrink-0">
              {toast.type === "cart" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === "wishlist" && <Heart className="w-5 h-5 text-rose-400 fill-current" />}
              {toast.type === "promo" && <Sparkles className="w-5 h-5 text-amber-300" />}
              {toast.type === "info" && <Sparkles className="w-5 h-5 text-[#d8c8b4]" />}
            </div>

            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-white font-alexandria">{toast.title}</h5>
              <p className="text-[11px] text-[#c4b5a2]">{toast.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#faf8f5] text-[#1c1815] font-bold text-xs hover:bg-[#eae0d2] transition-colors whitespace-nowrap"
              >
                {toast.actionLabel}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-[#8f7e6c] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
