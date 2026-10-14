"use client";

import React, { useEffect, useRef, useState, ReactNode, CSSProperties } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 40,
  duration = 600,
  threshold = 0.12,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const getTransform = (): string => {
    if (visible) return "translate3d(0,0,0)";
    switch (direction) {
      case "up":    return `translate3d(0,${distance}px,0)`;
      case "down":  return `translate3d(0,-${distance}px,0)`;
      case "left":  return `translate3d(${distance}px,0,0)`;
      case "right": return `translate3d(-${distance}px,0,0)`;
      default:      return "translate3d(0,0,0)";
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold, once]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: getTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};
