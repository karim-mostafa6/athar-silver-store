import type { StoreSettings } from "@/context/StoreContext";

export interface TileCandidate {
  key: string; // "gender:women" | "gender:men" | "cat:<id>"
  label: string;
  href: string;
  count: number;
  image: string; // auto image (collection banner or first product photo)
}

interface P {
  category?: string;
  gender?: string;
  images?: string[];
}

/** Every tile the dashboard can offer for "Shop by category": women, men, then each category. */
export function tileCandidates(settings: StoreSettings, products: P[]): TileCandidate[] {
  const firstImage = (list: P[]) => list.find((p) => p.images?.[0])?.images?.[0] || "";
  const out: TileCandidate[] = [];
  for (const [g, fallback] of [["women", "نسائي"], ["men", "رجالي"]] as const) {
    const inG = products.filter((p) => p.gender === g);
    const page = settings.collectionPages?.[g];
    out.push({
      key: `gender:${g}`,
      label: page?.title || fallback,
      href: `/collection/${g}`,
      count: inG.length,
      image: (page?.showBanner !== false && page?.bannerImage) || firstImage(inG),
    });
  }
  const cats = settings.categories && settings.categories.length > 0 ? settings.categories : [
    { id: "rings", label: "خواتم" }, { id: "chains", label: "سلاسل" }, { id: "bracelets", label: "أساور" }, { id: "earrings", label: "أقراط" },
  ];
  for (const c of cats) {
    const inCat = products.filter((p) => p.category === c.id);
    const page = settings.collectionPages?.[c.id];
    out.push({
      key: `cat:${c.id}`,
      label: page?.title || c.label,
      href: `/collection/${c.id}`,
      count: inCat.length,
      image: (page?.showBanner !== false && page?.bannerImage) || firstImage(inCat),
    });
  }
  return out;
}

/** Ordered, visible tiles: dashboard choice if saved, otherwise women, men and the first populated categories (max 4). */
export function resolveHomeTiles(settings: StoreSettings, products: P[]) {
  const all = tileCandidates(settings, products);
  const pool = products.map((p) => p.images?.[0]).filter(Boolean) as string[];
  const withImage = (t: TileCandidate, i: number, override?: string) => ({
    ...t,
    image: override || t.image || (pool.length ? pool[(i * 3 + 1) % pool.length] : ""),
  });
  const saved = settings.homeTiles;
  if (saved && saved.length > 0) {
    return saved
      .filter((s) => s.show)
      .map((s, i) => {
        const t = all.find((a) => a.key === s.key);
        return t ? withImage(t, i, s.image) : null;
      })
      .filter(Boolean) as ReturnType<typeof withImage>[];
  }
  const picked = all.filter((t) => t.key.startsWith("gender:") || t.count > 0).slice(0, 4);
  return picked.map((t, i) => withImage(t, i));
}
