import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DIRECTUS_URL: process.env.DIRECTUS_URL || "(not set)",
      DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN ? "***set***" : "(not set)",
      CATALOG_SOURCE: process.env.CATALOG_SOURCE || "(not set)",
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

    // Проверим доступность первой картинки
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

    // Проверим доступность Directus
    const directusUrl = process.env.DIRECTUS_URL;
    if (directusUrl) {
      try {
        const healthRes = await fetch(`${directusUrl}/server/health`, {
          cache: "no-store",
        });
        diagnostics.directusHealth = {
          status: healthRes.status,
          ok: healthRes.ok,
        };
      } catch (e) {
        diagnostics.directusHealthError = e instanceof Error ? e.message : String(e);
      }
    }

    return NextResponse.json(diagnostics);
  } catch (e) {
    diagnostics.error = e instanceof Error ? e.message : String(e);
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
