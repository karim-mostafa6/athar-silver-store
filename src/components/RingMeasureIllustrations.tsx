import React from "react";

// Small brand-coloured illustrations for the "how to measure" steps.
const INK = "#292722";
const GOLD = "#8E7545";
const CHAMP = "#B7A078";
const SAND = "#D8C8B3";
const SKIN = "#E9D5BD";
const IVORY = "#F5F0E7";

function Frame({ children, label, h = 170 }: { children: React.ReactNode; label: string; h?: number }) {
  return (
    <svg viewBox={`0 0 320 ${h}`} role="img" aria-label={label} className="w-full h-auto rounded-xl bg-[#F5F0E7] border border-[#292722]/10">
      {children}
    </svg>
  );
}

/** Step 1: a paper strip / thread and a cm ruler. */
export const IllustrationPrepare = () => (
  <Frame label="شريط ورقي وخيط ومسطرة بالسنتيمتر">
    {/* ruler: 1 cm = 26px, tick every 0.5 cm */}
    <rect x="22" y="100" width="276" height="34" rx="5" fill="#fff" stroke={INK} strokeWidth="1.4" />
    {Array.from({ length: 19 }).map((_, i) => (
      <line key={i} x1={34 + i * 13} y1="100" x2={34 + i * 13} y2={i % 2 === 0 ? 118 : 110} stroke={INK} strokeWidth="1" />
    ))}
    {Array.from({ length: 10 }).map((_, n) => (
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

/** Step 2: strip wrapped around the base of a finger, pencil marks where the ends meet. */
const Badge = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g>
    <circle cx={x} cy={y} r="8" fill={GOLD} stroke={IVORY} strokeWidth="1.5" />
    <text x={x} y={y + 3.4} fontSize="10" fill="#fff" textAnchor="middle" fontWeight="800">{n}</text>
  </g>
);

export const IllustrationWrap = () => (
  <Frame label="لف الشريط حول قاعدة الإصبع وعلّمي بالقلم مكان التقاء الطرفين" h={215}>
    {/* thumb */}
    <path d="M102 156 Q60 146 48 118 Q42 100 58 96 Q72 96 98 124 Z" fill={SKIN} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
    {/* four fingers */}
    <rect x="100" y="38" width="26" height="92" rx="13" fill={SKIN} stroke={INK} strokeWidth="1.4" />
    <rect x="127" y="20" width="26" height="110" rx="13" fill={SKIN} stroke={INK} strokeWidth="1.4" />
    <rect x="154" y="32" width="26" height="98" rx="13" fill={SKIN} stroke={INK} strokeWidth="1.4" />
    <rect x="181" y="54" width="26" height="76" rx="13" fill={SKIN} stroke={INK} strokeWidth="1.4" />
    {/* palm: fill hides the finger bottoms, then only the outer sides are stroked */}
    <path d="M101 116 H207 V160 Q207 208 154 208 Q101 208 101 160 Z" fill={SKIN} />
    <path d="M100 116 V160 Q100 209 154 209 Q208 209 208 160 V116" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M118 158 Q152 174 192 150" fill="none" stroke={INK} strokeOpacity="0.16" strokeWidth="1.2" strokeLinecap="round" />
    {/* paper strip around the ring finger base */}
    <path d="M154 86 Q167 98 180 86 L180 100 Q167 112 154 100 Z" fill="#fff" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M154 93 Q167 105 180 93" fill="none" stroke={CHAMP} strokeWidth="1" strokeOpacity="0.7" />
    {/* overlapping tail */}
    <path d="M175 92 L232 76 L235 86 L179 103 Z" fill="#fff" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    {/* pencil marks the meeting point */}
    <g transform="translate(179 96) rotate(-54)">
      <rect x="0" y="-4.5" width="56" height="9" rx="1.5" fill={CHAMP} stroke={INK} strokeWidth="1.2" />
      <rect x="0" y="-4.5" width="10" height="9" fill={SAND} stroke={INK} strokeWidth="1.2" />
      <path d="M0 -4.5 L-14 0 L0 4.5 Z" fill={SKIN} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M-9 -1.5 L-14 0 L-9 1.5 Z" fill={INK} />
    </g>
    <circle cx="179" cy="96" r="2.2" fill={INK} />
    {/* numbered markers */}
    <Badge x={166} y={126} n={1} />
    <Badge x={196} y={108} n={2} />
    {/* legend */}
    <g>
      <rect x="214" y="116" width="100" height="40" rx="12" fill={INK} />
      <circle cx="226" cy="136" r="7" fill={GOLD} />
      <text x="226" y="139.4" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="800">2</text>
      <text x="274" y="132" fontSize="9.5" fill={IVORY} textAnchor="middle" fontWeight="700">علّمي مكان</text>
      <text x="274" y="146" fontSize="9.5" fill={IVORY} textAnchor="middle" fontWeight="700">التقاء الطرفين</text>
      <rect x="6" y="176" width="92" height="34" rx="12" fill="#fff" stroke={CHAMP} />
      <circle cx="86" cy="193" r="7" fill={GOLD} />
      <text x="86" y="196.4" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="800">1</text>
      <text x="42" y="190" fontSize="9.5" fill={INK} textAnchor="middle" fontWeight="700">لفّي الشريط حول</text>
      <text x="42" y="203" fontSize="9.5" fill={INK} textAnchor="middle" fontWeight="700">قاعدة الإصبع</text>
    </g>
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
