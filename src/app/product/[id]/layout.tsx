import type { Metadata } from "next";
import { getPublicStoreSnapshotCached as getPublicStoreSnapshot } from "@/lib/serverStore";

// Server-side wrapper so shared product links (WhatsApp, Facebook, Google) show the
// product photo, name and price. The page itself stays a client component.
async function findProduct(id: string) {
  try {
    const { products } = await getPublicStoreSnapshot();
    return products.find((p) => p.id === id) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await findProduct(decodeURIComponent(params.id));
  if (!product) return { title: "ORMA | القطعة غير متوفرة" };

  const title = product.metaTitle?.trim() || `${product.arabicName} | ORMA`;
  const description =
    product.metaDescription?.trim() ||
    (product.description || "").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${product.arabicName} من ORMA - فضة إسترليني عيار 925`;
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title,
      description,
      url: `/product/${product.id}`,
      siteName: "ORMA | أورما لفضة 925",
      locale: "ar_EG",
      type: "website",
      images: image ? [{ url: image, alt: product.arabicName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const product = await findProduct(decodeURIComponent(params.id));
  const inStock =
    !!product && product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.arabicName,
        image: product.images,
        description: product.description,
        sku: product.sku || product.id,
        brand: { "@type": "Brand", name: "ORMA" },
        offers: {
          "@type": "Offer",
          priceCurrency: "EGP",
          price: product.price,
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Escape "<" so product text can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      {children}
    </>
  );
}
