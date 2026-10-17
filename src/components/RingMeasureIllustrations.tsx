import React from "react";

// Small brand-coloured illustrations for the "how to measure" steps.
const INK = "#292722";
const GOLD = "#8E7545";
const CHAMP = "#B7A078";
const SAND = "#D8C8B3";
const SKIN = "#E9D5BD";
const IVORY = "#F5F0E7";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label={label} className="w-full h-auto rounded-xl bg-[#F5F0E7] border border-[#292722]/10">
      {children}
    </svg>
  );
}

/** Step 1: a paper strip / thread and a cm ruler. */
export const IllustrationPrepare = () => (
  <Frame label="شريط ورقي وخيط ومسطرة بالسنتيمتر">
    {/* ruler: 1 cm = 26px, tick every 0.5 cm */}
    <rect x="22" y="100" width="276" height="34" rx="5" fill="#fff" stroke={INK} strokeWidth="1.4" />
    {Array.from({ length: 21 }).map((_, i) => (
      <line key={i} x1={34 + i * 13} y1="100" x2={34 + i * 13} y2={i % 2 === 0 ? 118 : 110} stroke={INK} strokeWidth="1" />
    ))}
    {Array.from({ length: 11 }).map((_, n) => (
      <text key={n} x={34 + n * 26} y="130" fontSize="8.5" textAnchor="middle" fill={INK} fontFamily="monospace">
        {n}
      </text>
    ))}
    <text x="290" y="94" fontSize="9" fill={GOLD} fontWeight="700" textAnchor="end">سم</text>
    {/* paper strip */}
    <rect x="48" y="38" width="184" height="16" rx="3" fill={SAND} stroke={INK} strokeWidth="1.2" />
    <text x="140" y="50" fontSize="8.5" textAnchor="middle" fill={INK}>شريط ورقي</text>
    {/* thread */}
    <path d="M48 78 C 80 64, 110 92, 142 78 S 200 66, 232 80" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" />
    <text x="262" y="82" fontSize="9" fill={GOLD} textAnchor="middle">أو خيط</text>
  </Frame>
);

/** Step 2: thread wrapped around the finger base, mark where it overlaps. */
export const IllustrationWrap = () => (
  <Frame label="لف الخيط حول قاعدة الإصبع وعلّمي نقطة التقاء الطرفين">
    {/* hand: palm + finger */}
    <path d="M110 170 L110 70 Q110 52 128 52 L156 52 Q174 52 174 70 L174 170 Z" fill={SKIN} stroke={INK} strokeWidth="1.4" />
    <path d="M128 52 Q142 40 156 52" fill="none" stroke={INK} strokeWidth="1.2" />
    {/* nail */}
    <path d="M130 56 Q142 44 154 56 Q154 66 142 68 Q130 66 130 56Z" fill="#F6E4D2" stroke={INK} strokeWidth="0.8" />
    {/* wrapped thread at finger base */}
    <path d="M106 112 Q142 128 178 112" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <path d="M108 118 Q142 134 176 118" fill="none" stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.5" />
    {/* overlap mark */}
    <circle cx="168" cy="114" r="5" fill="none" stroke={INK} strokeWidth="1.6" />
    <circle cx="168" cy="114" r="1.8" fill={INK} />
    {/* tail */}
    <path d="M178 112 Q196 106 210 96" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" />
    {/* callouts */}
    <line x1="214" y1="124" x2="174" y2="116" stroke={CHAMP} strokeWidth="1" strokeDasharray="3 2" />
    <rect x="200" y="124" width="104" height="24" rx="12" fill={INK} />
    <text x="252" y="140" fontSize="9.5" fill={IVORY} textAnchor="middle" fontWeight="700">علّمي نقطة الالتقاء</text>
    <rect x="16" y="44" width="78" height="22" rx="11" fill="#fff" stroke={CHAMP} />
    <text x="55" y="59" fontSize="9" fill={INK} textAnchor="middle">قاعدة الإصبع</text>
    <line x1="94" y1="58" x2="108" y2="104" stroke={CHAMP} strokeWidth="1" strokeDasharray="3 2" />
  </Frame>
);

/** Step 3: stretch the strip on the ruler and read the length in cm. */
export const IllustrationRead = () => {
  const x0 = 40;
  const unit = 40; // px per cm
  const len = 5.4 * unit;
  return (
    <Frame label="افردي الشريط على المسطرة واقرئي الطول بالسنتيمتر">
      <rect x="20" y="92" width="290" height="40" rx="5" fill="#fff" stroke={INK} strokeWidth="1.4" />
      {Array.from({ length: 61 }).map((_, i) => {
        const x = x0 + i * 4;
        if (x > 300) return null;
        const major = i % 10 === 0;
        const mid = i % 5 === 0;
        return <line key={i} x1={x} y1="92" x2={x} y2={major ? 112 : mid ? 106 : 100} stroke={INK} strokeWidth={major ? 1.2 : 0.8} />;
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
        <text key={n} x={x0 + n * unit} y="126" fontSize="9" textAnchor="middle" fill={INK} fontFamily="monospace">
          {n}
        </text>
      ))}
      {/* strip */}
      <rect x={x0} y="62" width={len} height="14" rx="2" fill={SAND} stroke={INK} strokeWidth="1.2" />
      {/* end marker */}
      <line x1={x0 + len} y1="52" x2={x0 + len} y2="128" stroke={GOLD} strokeWidth="1.6" strokeDasharray="4 2" />
      {/* bracket + label */}
      <path d={`M${x0} 46 L${x0} 40 L${x0 + len} 40 L${x0 + len} 46`} fill="none" stroke={INK} strokeWidth="1.3" />
      <rect x={x0 + len / 2 - 38} y="14" width="76" height="22" rx="11" fill={INK} />
      <text x={x0 + len / 2} y="29" fontSize="11" fill={IVORY} textAnchor="middle" fontWeight="700">5.4 سم</text>
      <text x="160" y="154" fontSize="9" fill={GOLD} textAnchor="middle">هذا هو محيط إصبعك</text>
    </Frame>
  );
};
