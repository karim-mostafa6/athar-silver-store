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
    <div
      dir="rtl"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1.5 pointer-events-none max-w-[92vw] sm:max-w-md"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 py-1.5 px-3.5 rounded-full bg-[#181512]/95 backdrop-blur-md text-[#faf8f5] shadow-xl border border-[#3e3832]/80 animate-pop text-right"
        >
          {/* Micro Icon */}
          <div className="shrink-0 flex items-center justify-center">
            {toast.type === "cart" && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            )}
            {toast.type === "wishlist" && <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />}
            {toast.type === "promo" && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            {toast.type === "info" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300/90" />}
          </div>

          {/* Compact Content */}
          <div className="flex items-center gap-1.5 text-xs select-none">
            <span className="font-bold text-white font-alexandria whitespace-nowrap">
              {toast.title}
            </span>
            {toast.message && (
              <>
                <span className="text-[#6d6154]">•</span>
                <span className="text-[11px] text-[#cfc2b2] truncate max-w-[200px] sm:max-w-[260px]">
                  {toast.message}
                </span>
              </>
            )}
          </div>

          {/* Action button if present */}
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onDismiss(toast.id);
              }}
              className="mr-1 px-2.5 py-0.5 rounded-full bg-[#f7f4ee] text-[#181512] font-bold text-[10px] hover:bg-[#e8ded0] transition-colors whitespace-nowrap"
            >
              {toast.actionLabel}
            </button>
          )}

          {/* Minimal dismiss X */}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-0.5 text-[#8f7e6c] hover:text-white transition-colors mr-0.5"
            aria-label="إغلاق"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

