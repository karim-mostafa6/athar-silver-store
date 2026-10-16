import { NextResponse } from "next/server";
import { BUILD_ID, BUILD_TIMESTAMP, STORE_VERSION } from "@/lib/version";
import { getCatalogVersion } from "@/lib/serverStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const catalogVersion = await getCatalogVersion();
  return NextResponse.json(
    {
      buildId: BUILD_ID,
      catalogVersion,
      buildTimestamp: BUILD_TIMESTAMP,
      version: STORE_VERSION,
      serverTime: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
