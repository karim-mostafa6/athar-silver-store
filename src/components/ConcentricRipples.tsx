import React from "react";

interface ConcentricRipplesProps {
  className?: string;
  variant?: "hero" | "card" | "story" | "emblem";
  ringCount?: number;
  strokeColor?: string;
}

export const ConcentricRipples: React.FC<ConcentricRipplesProps> = ({
  className = "",
  variant = "hero",
  ringCount,
  strokeColor,
}) => {
  if (variant === "emblem") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-10 h-10 ${className}`}
      >
        <circle cx="50" cy="50" r="46" stroke={strokeColor || "#c5a880"} strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="50" cy="50" r="38" stroke={strokeColor || "#c5a880"} strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="50" cy="50" r="30" stroke={strokeColor || "#c5a880"} strokeWidth="1.2" strokeOpacity="0.8" />
        <circle cx="50" cy="50" r="22" stroke={strokeColor || "#c5a880"} strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="50" cy="50" r="14" stroke={strokeColor || "#c5a880"} strokeWidth="1.2" strokeOpacity="0.9" />
        <circle cx="50" cy="50" r="5" fill={strokeColor || "#c5a880"} fillOpacity="0.9" />
      </svg>
    );
  }

  if (variant === "card") {
    const count = ringCount || 8;
    const baseRadius = 28;
    const step = 22;
    return (
      <svg
        viewBox="0 0 300 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: count }).map((_, i) => (
          <circle
            key={i}
            cx="150"
            cy="180"
            r={baseRadius + i * step}
            stroke={strokeColor || "#b8a892"}
            strokeWidth="0.85"
            strokeOpacity={Math.max(0.12, 0.42 - i * 0.038)}
          />
        ))}
      </svg>
    );
  }

  if (variant === "story") {
    return (
      <svg
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute inset-0 w-full h-full pointer-events-none opacity-20 ${className}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Left concentric cluster */}
        {[80, 140, 200, 260, 320, 380, 440, 500, 560].map((r, i) => (
          <circle
            key={`left-${i}`}
            cx="180"
            cy="200"
            r={r}
            stroke={strokeColor || "#d8c4a5"}
            strokeWidth="0.8"
            strokeOpacity={0.5 - i * 0.04}
          />
        ))}
        {/* Right concentric cluster */}
        {[80, 140, 200, 260, 320, 380, 440, 500, 560].map((r, i) => (
          <circle
            key={`right-${i}`}
            cx="1020"
            cy="200"
            r={r}
            stroke={strokeColor || "#d8c4a5"}
            strokeWidth="0.8"
            strokeOpacity={0.5 - i * 0.04}
          />
        ))}
      </svg>
    );
  }

  // Hero variant: 12 concentric rings radiating from center
  const count = ringCount || 12;
  const baseRadius = 55;
  const step = 28;
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {Array.from({ length: count }).map((_, i) => (
        <circle
          key={i}
          cx="300"
          cy="300"
          r={baseRadius + i * step}
          stroke={strokeColor || "#ffffff"}
          strokeWidth="0.9"
          strokeOpacity={Math.max(0.06, 0.32 - i * 0.02)}
        />
      ))}
    </svg>
  );
};
