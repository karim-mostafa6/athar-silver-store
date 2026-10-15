"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const FloatingWhatsApp: React.FC = () => {
  const { storeSettings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip Notification */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#ded1be] shadow-xl text-right animate-float">
          <div className="text-xs">
            <span className="font-bold text-[#1c1815] block">تحتاج مساعدة أو استفسار؟</span>
            <span className="text-[11px] text-[#6d5b4a]">فريق ORMA متاح لمساعدتك فوراً عبر واتساب</span>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="p-1 text-[#8c7865] hover:text-[#1c1815] transition-colors"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={`https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(
          "مرحباً ORMA، أرغب في الاستفسار عن قطع الفضة والطلب"
        )}`}
        target="_blank"
        rel="noreferrer"
        className="relative group p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        aria-label="تواصل عبر واتساب"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
        <MessageCircle className="w-6 h-6 fill-current text-white" />
      </a>
    </div>
  );
};
