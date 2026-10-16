"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  id: string;
  imageUrl: string;
  badge?: string;
  title: string;
  titleLine2?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  overlayDarkness?: "light" | "medium" | "dark";
  contentAlign?: "center" | "right" | "left";
}

interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
  onExploreClick?: () => void;
}

const overlayMap = {
  light: "from-black/40 via-black/20 to-transparent",
  medium: "from-black/60 via-black/30 to-transparent",
  dark: "from-black/80 via-black/50 to-transparent",
};

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoPlayInterval = 5000,
  onExploreClick,
}) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (isAnimating || index === current) return;
      setDirection(dir);
      setIsAnimating(true);
      setProgress(0);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 700);
    },
    [isAnimating, current]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, "next");
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "prev");
  }, [current, slides.length, goTo]);

  // Progress bar
  useEffect(() => {
    if (isPaused) return;
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    const step = 100 / (autoPlayInterval / 100);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + step;
      });
    }, 100);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, isPaused, autoPlayInterval]);

  // Auto-play
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      next();
    }, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, isPaused, next, autoPlayInterval, slides.length]);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
  };

  if (!slides || slides.length === 0) return null;

  const slide = slides[current];
  const overlay = overlayMap[slide.overlayDarkness || "medium"];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "min(100vh, 680px)", minHeight: "480px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      dir="rtl"
    >
      {/* Slides */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            idx === current
              ? "opacity-100 z-10"
              : direction === "next"
              ? idx === (current - 1 + slides.length) % slides.length
                ? "opacity-0 -translate-x-full z-0"
                : "opacity-0 translate-x-full z-0"
              : idx === (current + 1) % slides.length
              ? "opacity-0 translate-x-full z-0"
              : "opacity-0 -translate-x-full z-0"
          }`}
        >
          {/* Background Image with Ken Burns effect on active */}
          <img
            src={s.imageUrl}
            alt={s.title}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
              idx === current ? "scale-110" : "scale-100"
            }`}
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-l ${overlay}`} />

          {/* Soft bottom fade into page background */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f7f4ee] to-transparent" />
        </div>
      ))}

      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 w-full">
          <div
            className={`max-w-2xl transition-all duration-700 delay-200 ${
              isAnimating ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
            } ${
              slide.contentAlign === "center"
                ? "mx-auto text-center"
                : slide.contentAlign === "left"
                ? "ml-auto text-left"
                : "mr-auto text-right"
            }`}
          >
            {/* Badge */}
            {slide.badge && (
              <div className="mb-4">
                <span className="inline-block text-[10px] font-mono tracking-[0.3em] uppercase bg-white/15 backdrop-blur-sm border border-white/30 text-white px-4 py-1.5 rounded-full">
                  {slide.badge}
                </span>
              </div>
            )}

            {/* Main Title */}
            <h1 className="font-cairo text-3xl sm:text-5xl lg:text-6xl font-normal sm:font-medium text-white/95 leading-[1.3] sm:leading-[1.25] tracking-normal drop-shadow-md mb-4">
              <span className="block">{slide.title}</span>
              {slide.titleLine2 && (
                <span className="block text-[#B7A078]">{slide.titleLine2}</span>
              )}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p className="font-tajawal text-sm sm:text-base text-stone-200/90 leading-relaxed max-w-md drop-shadow-sm mb-8 font-normal">
                {slide.subtitle}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              {slide.primaryButtonText && (
                slide.primaryButtonLink ? (
                  <Link
                    href={slide.primaryButtonLink}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-[#c5a880] text-[#161412] text-xs sm:text-sm font-bold hover:bg-[#d4b896] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <span>{slide.primaryButtonText}</span>
                  </Link>
                ) : (
                  <button
                    onClick={onExploreClick}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-[#c5a880] text-[#161412] text-xs sm:text-sm font-bold hover:bg-[#d4b896] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <span>{slide.primaryButtonText}</span>
                  </button>
                )
              )}
              {slide.secondaryButtonText && (
                slide.secondaryButtonLink ? (
                  <Link
                    href={slide.secondaryButtonLink}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white border-b border-white/50 hover:border-white hover:text-white/90 transition-all duration-300 py-1"
                  >
                    <span>{slide.secondaryButtonText}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={onExploreClick}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white border-b border-white/50 hover:border-white hover:text-white/90 transition-all duration-300 py-1"
                  >
                    <span>{slide.secondaryButtonText}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={next}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200 active:scale-90 shadow-lg"
            aria-label="الشريحة التالية"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={prev}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200 active:scale-90 shadow-lg"
            aria-label="الشريحة السابقة"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators + Progress */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 z-30 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx, idx > current ? "next" : "prev")}
                className={`transition-all duration-400 rounded-full ${
                  idx === current
                    ? "w-6 h-2 bg-[#c5a880]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`الانتقال للشريحة ${idx + 1}`}
              />
            ))}
          </div>
          <div className="w-24 h-[2px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c5a880] rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className="absolute top-6 left-6 z-30 text-white/60 text-xs font-mono tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
};
