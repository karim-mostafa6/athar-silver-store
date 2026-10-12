"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Clock, Truck, ShieldCheck, Gift, Copy, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface MarqueeAnnouncementProps {
  onNotify?: (title: string, message: string, type: "promo" | "info") => void;
}

export const MarqueeAnnouncement: React.FC<MarqueeAnnouncementProps> = ({ onNotify }) => {
  const { storeSettings } = useStore();
  const initialHours = storeSettings.marqueeCountdownHours || 6;
  const [timeLeft, setTimeLeft] = useState({ hours: initialHours, minutes: 42, seconds: 18 });
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
          return { hours: storeSettings.marqueeCountdownHours || 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [storeSettings.marqueeCountdownHours]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(storeSettings.promoCode);
    setCopied(true);
    onNotify?.("تم نسخ الكود", `كود الخصم ${storeSettings.promoCode} جاهز للاستخدام في السلة`, "promo");
    setTimeout(() => setCopied(false), 2000);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  if (storeSettings.showMarquee === false) {
    return null;
  }

  const tickerItems: { icon: React.ReactNode; text: React.ReactNode }[] = [];

  // 1. Countdown item
  if (storeSettings.marqueeShowCountdown !== false) {
    tickerItems.push({
      icon: <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
      text: (
        <span className="flex items-center gap-1.5 font-bold">
          <span>{storeSettings.marqueeCountdownLabel || "ينتهي العرض الخاص خلال"}</span>
          <span className="font-mono bg-[#1c1815] text-[#faf8f5] px-2 py-0.5 rounded text-[11px] tracking-wider border border-[#483d32]">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
        </span>
      ),
    });
  }

  // 2. Free Shipping item
  if (storeSettings.marqueeShowFreeShipping !== false) {
    tickerItems.push({
      icon: <Truck className="w-3.5 h-3.5 text-amber-500" />,
      text: (
        <span>
          {storeSettings.marqueeFreeShippingText ||
            storeSettings.announcementText ||
            `شحن مجاني على جميع الطلبات بقيمة ${storeSettings.freeShippingThreshold.toLocaleString(
              "ar-EG"
            )} ج.م أو أكثر لجميع المحافظات`}
        </span>
      ),
    });
  }

  // 3. Promo code item
  if (storeSettings.marqueeShowPromo !== false && storeSettings.promoCode) {
    tickerItems.push({
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      text: (
        <span className="flex items-center gap-1.5">
          <span>
            {storeSettings.marqueePromoPrefix ||
              `كوبون ترحيبي ${storeSettings.promoDiscountPercent}% خصم إضافي:`}
          </span>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 bg-[#1c1815] hover:bg-[#382f28] text-white px-2 py-0.5 rounded-full font-mono text-[11px] font-bold transition-transform active:scale-90 border border-amber-500/30 shadow-sm"
            title="انقر لنسخ الكوبون"
          >
            <span>{storeSettings.promoCode}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-300" />}
          </button>
        </span>
      ),
    });
  }

  // 4. Lifetime warranty item
  if (storeSettings.marqueeShowWarranty !== false) {
    tickerItems.push({
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
      text: (
        <span>
          {storeSettings.marqueeWarrantyText ||
            "فضة إسترليني إيطالية وتركية عيار 925 مختومة بضمان رسمي مدى الحياة"}
        </span>
      ),
    });
  }

  // 5. Gift wrap item
  if (storeSettings.marqueeShowGiftWrap !== false) {
    tickerItems.push({
      icon: <Gift className="w-3.5 h-3.5 text-rose-500" />,
      text: (
        <span>
          {storeSettings.marqueeGiftWrapText ||
            "تغليف إهداء مخملي فاخر مجاناً مع كارت معايدة مخصص لكل طلب"}
        </span>
      ),
    });
  }

  // 6. Custom legacy text item
  if (storeSettings.marqueeCustomText && storeSettings.marqueeCustomText.trim()) {
    tickerItems.push({
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      text: <span>{storeSettings.marqueeCustomText}</span>,
    });
  }

  // 7. Unlimited Extra Custom Announcements
  if (storeSettings.marqueeExtraMessages && storeSettings.marqueeExtraMessages.length > 0) {
    storeSettings.marqueeExtraMessages.forEach((extra) => {
      if (extra.visible && extra.text.trim()) {
        tickerItems.push({
          icon: <span className="text-sm">{extra.icon || "✦"}</span>,
          text: <span>{extra.text}</span>,
        });
      }
    });
  }

  if (tickerItems.length === 0) return null;

  // Visual Theme Styling
  const themeClass =
    storeSettings.marqueeTheme === "dark"
      ? "bg-[#14110e] text-[#f5efe6] border-[#2e261f]"
      : storeSettings.marqueeTheme === "gold"
      ? "bg-[#7d5f26] text-white border-[#9c7835]"
      : storeSettings.marqueeTheme === "burgundy"
      ? "bg-[#451421] text-[#fce7ef] border-[#5d1d2e]"
      : "bg-[#f4ece0] text-[#4b3e32] border-[#e5dacb]";

  const speedDuration =
    storeSettings.marqueeSpeed === "slow"
      ? "38s"
      : storeSettings.marqueeSpeed === "fast"
      ? "16s"
      : "26s";

  const pauseClass =
    storeSettings.marqueePauseOnHover !== false ? "hover:[animation-play-state:paused]" : "";

  return (
    <div className={`w-full border-b overflow-hidden py-2 text-xs select-none transition-colors ${themeClass}`}>
      <div
        className={`animate-marquee flex items-center gap-8 whitespace-nowrap ${pauseClass}`}
        style={{ animationDuration: speedDuration }}
      >
        {/* First set */}
        {tickerItems.map((item, idx) => (
          <div key={`t1-${idx}`} className="flex items-center gap-2">
            {item.icon}
            <span>{item.text}</span>
            <span className="opacity-60 mx-2">✦</span>
          </div>
        ))}
        {/* Duplicate set for seamless looping */}
        {tickerItems.map((item, idx) => (
          <div key={`t2-${idx}`} className="flex items-center gap-2">
            {item.icon}
            <span>{item.text}</span>
            <span className="opacity-60 mx-2">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
