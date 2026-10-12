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
            <span className="text-[11px] text-[#6d5b4a]">فريق أَثَر متاح لمساعدتك فوراً عبر واتساب</span>
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
        href={`https://wa.me/${storeSettings.whatsappNumber}?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A3%D8%AB%D9%8E%D8%B1%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%82%D8%B7%D8%B9%20%D8%A7%D9%84%D9%81%D8%B6%D8%A9%20%D9%88%D8%A7%D9%84%D8%B7%D9%84%D8%A8`}
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
