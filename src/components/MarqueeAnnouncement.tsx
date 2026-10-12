"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Clock, Truck, ShieldCheck, Gift, Copy, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface MarqueeAnnouncementProps {
  onNotify?: (title: string, message: string, type: "promo" | "info") => void;
}

export const MarqueeAnnouncement: React.FC<MarqueeAnnouncementProps> = ({ onNotify }) => {
  const { storeSettings } = useStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(storeSettings.promoCode);
    setCopied(true);
    onNotify?.("تم نسخ الكود", `كود الخصم ${storeSettings.promoCode} جاهز للاستخدام في السلة`, "promo");
    setTimeout(() => setCopied(false), 2000);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const tickerItems = [
    {
      icon: <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
      text: (
        <span className="flex items-center gap-1.5 font-bold">
          <span>ينتهي العرض الخاص خلال</span>
          <span className="font-mono bg-[#1c1815] text-[#faf8f5] px-2 py-0.5 rounded text-[11px] tracking-wider">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
        </span>
      ),
    },
    {
      icon: <Truck className="w-3.5 h-3.5 text-[#8a7258]" />,
      text: <span>{storeSettings.announcementText}</span>,
    },
    {
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      text: (
        <span className="flex items-center gap-1.5">
          <span>كوبون ترحيبي {storeSettings.promoDiscountPercent}% خصم إضافي:</span>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 bg-[#1c1815] hover:bg-[#382f28] text-white px-2 py-0.5 rounded-full font-mono text-[11px] font-bold transition-transform active:scale-90"
            title="انقر لنسخ الكوبون"
          >
            <span>{storeSettings.promoCode}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-300" />}
          </button>
        </span>
      ),
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
      text: <span>فضة إسترليني إيطالية وتركية عيار 925 مختومة بضمان رسمي مدى الحياة</span>,
    },
    {
      icon: <Gift className="w-3.5 h-3.5 text-rose-500" />,
      text: <span>تغليف إهداء مخملي فاخر مجاناً مع كارت معايدة مخصص لكل طلب</span>,
    },
  ];

  return (
    <div className="w-full bg-[#f4ece0] border-b border-[#e5dacb] overflow-hidden py-2 text-xs text-[#4b3e32] select-none">
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {/* First set */}
        {tickerItems.map((item, idx) => (
          <div key={`t1-${idx}`} className="flex items-center gap-2">
            {item.icon}
            <span>{item.text}</span>
            <span className="text-[#c7b59e] mx-2">✦</span>
          </div>
        ))}
        {/* Duplicate set for seamless looping */}
        {tickerItems.map((item, idx) => (
          <div key={`t2-${idx}`} className="flex items-center gap-2">
            {item.icon}
            <span>{item.text}</span>
            <span className="text-[#c7b59e] mx-2">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
