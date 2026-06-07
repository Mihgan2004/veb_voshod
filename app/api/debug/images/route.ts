import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      MEDUSA_BACKEND_URL:
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "(not set)",
      MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        ? "***set***"
        : "(not set)",
      MEDUSA_REGION_ID:
        process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || "(not set)",
    },
  };

  try {
    const products = await catalog.listProducts();

    const productImages = products.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image || "(empty)",
      imagesCount: p.images?.length || 0,
      images: p.images?.slice(0, 3) || [],
    }));

    diagnostics.productsCount = products.length;
    diagnostics.sampleProducts = productImages;

    const firstImageUrl = products.find((p) => p.image)?.image;
    if (firstImageUrl) {
      diagnostics.testImageUrl = firstImageUrl;
      try {
        const imgRes = await fetch(firstImageUrl, {
          method: "HEAD",
          cache: "no-store",
        });
        diagnostics.testImageStatus = imgRes.status;
        diagnostics.testImageOk = imgRes.ok;
        diagnostics.testImageContentType = imgRes.headers.get("content-type");
      } catch (e) {
        diagnostics.testImageError = e instanceof Error ? e.message : String(e);
      }
    }

    return NextResponse.json(diagnostics);
  } catch (e) {
    diagnostics.error = e instanceof Error ? e.message : String(e);
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
