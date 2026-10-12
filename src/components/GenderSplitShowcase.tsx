"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const GenderSplitShowcase: React.FC = () => {
  return (
    <section className="w-full bg-[#faf8f5] py-12 sm:py-16 border-b border-[#e8ded0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Centered "VIEW ALL" Button - Links to /collection/all */}
        <div className="flex justify-center mb-10">
          <Link
            href="/collection/all"
            className="px-8 py-3 rounded-full bg-[#6b1d2f] hover:bg-[#521524] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 inline-flex items-center gap-2"
          >
            <span>VIEW ALL • كافة القطع</span>
          </Link>
        </div>

        {/* Dual Split 50/50 Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Women's Showcase Banner -> Links to /collection/women */}
          <Link
            href="/collection/women"
            className="group relative h-[380px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 block"
          >
            {/* Background Editorial Photo */}
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85"
              alt="Women's Silver Jewelry Collection"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300" />

            {/* Content Bottom */}
            <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 text-right text-white z-10 space-y-3">
              <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/75">
                COLLECTION FOR HER
              </div>
              <h3 className="text-3xl sm:text-4xl font-light font-alexandria tracking-tight text-[#faf8f5]">
                Women&apos;s
                <span className="block text-sm font-normal text-white/80 mt-1">
                  التشكيلة النسائية
                </span>
              </h3>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/70 text-white text-xs font-bold uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-[#1c1815] transition-all duration-300 shadow-sm">
                  <span>EXPLORE NOW</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Men's Showcase Banner -> Links to /collection/men */}
          <Link
            href="/collection/men"
            className="group relative h-[380px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 block"
          >
            {/* Background Editorial Photo */}
            <img
              src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85"
              alt="Men's Silver Jewelry Collection"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300" />

            {/* Content Bottom */}
            <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 text-right text-white z-10 space-y-3">
              <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/75">
                COLLECTION FOR HIM
              </div>
              <h3 className="text-3xl sm:text-4xl font-light font-alexandria tracking-tight text-[#faf8f5]">
                Men&apos;s
                <span className="block text-sm font-normal text-white/80 mt-1">
                  التشكيلة الرجالية
                </span>
              </h3>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/70 text-white text-xs font-bold uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-[#1c1815] transition-all duration-300 shadow-sm">
                  <span>EXPLORE NOW</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
