"use client";

import React from "react";
import { Sparkles, Gem, Flame, Crown, Gift, Watch } from "lucide-react";

interface StoryHighlightsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedGender: string;
  onSelectGender: (gender: string) => void;
}

export const StoryHighlights: React.FC<StoryHighlightsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedGender,
  onSelectGender,
}) => {
  const highlights = [
    {
      id: "all",
      title: "كل التشكيلة",
      badge: "الكل",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectCategory("all");
        onSelectGender("all");
      },
      isActive: selectedCategory === "all" && selectedGender === "all",
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: "rings",
      title: "خواتم وسوليتير",
      badge: "سوليتير",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectCategory("rings");
        onSelectGender("all");
      },
      isActive: selectedCategory === "rings",
      icon: <Gem className="w-3.5 h-3.5 text-blue-500" />,
    },
    {
      id: "chains",
      title: "سلاسل إيطالي",
      badge: "إيطالي",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectCategory("chains");
        onSelectGender("all");
      },
      isActive: selectedCategory === "chains",
      icon: <Crown className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      id: "bracelets",
      title: "أساور وتنس",
      badge: "تنس",
      image: "https://images.unsplash.com/photo-1611591475102-4a008c3d82a1?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectCategory("bracelets");
        onSelectGender("all");
      },
      isActive: selectedCategory === "bracelets",
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-500" />,
    },
    {
      id: "men",
      title: "تشكيلة رجالي",
      badge: "رجالي",
      image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectGender("men");
        onSelectCategory("all");
      },
      isActive: selectedGender === "men",
      icon: <Watch className="w-3.5 h-3.5 text-stone-700" />,
    },
    {
      id: "sets",
      title: "أطقم وهدايا",
      badge: "هدايا",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectCategory("sets");
        onSelectGender("all");
      },
      isActive: selectedCategory === "sets",
      icon: <Gift className="w-3.5 h-3.5 text-red-500" />,
    },
    {
      id: "bestseller",
      title: "الأكثر طلباً",
      badge: "تريند",
      image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=300&q=80",
      action: () => {
        onSelectCategory("all");
        onSelectGender("all");
      },
      isActive: false,
      icon: <Flame className="w-3.5 h-3.5 text-orange-500" />,
    },
  ];

  return (
    <div className="w-full py-6 border-b border-[#e8ded0] bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
          {highlights.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="flex flex-col items-center group shrink-0 focus:outline-none transition-transform active:scale-95"
            >
              {/* Circular Border Ring */}
              <div
                className={`relative p-[2.5px] rounded-full transition-all duration-300 ${
                  item.isActive
                    ? "bg-gradient-to-tr from-[#9e7a4f] via-[#cdae83] to-[#1c1815] shadow-md scale-105"
                    : "bg-[#e5dacb] group-hover:bg-gradient-to-tr group-hover:from-[#baa68e] group-hover:to-[#5c4a37]"
                }`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-[#faf8f5] overflow-hidden">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-115 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors" />
                  </div>
                </div>

                {/* Badge Overlay */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1c1815] text-[#faf8f5] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm border border-[#e5dacb]/40">
                  {item.badge}
                </div>
              </div>

              {/* Title */}
              <span
                className={`mt-2.5 text-xs font-bold transition-colors ${
                  item.isActive
                    ? "text-[#1c1815] font-black"
                    : "text-[#5a4b3d] group-hover:text-[#1c1815]"
                }`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
