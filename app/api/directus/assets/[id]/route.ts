import { NextResponse } from "next/server";

const CACHE_MAX_AGE = 60 * 60 * 24;

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Same-origin proxy for Directus files — keeps DIRECTUS_TOKEN server-side only.
 */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const fileId = id?.trim();
  if (!fileId || !/^[a-zA-Z0-9-]+$/.test(fileId)) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }

  const base = process.env.DIRECTUS_URL?.replace(/\/+$/, "");
  const token = process.env.DIRECTUS_TOKEN;

  if (!base || !token) {
    return NextResponse.json({ error: "DIRECTUS_NOT_CONFIGURED" }, { status: 503 });
  }

  const upstream = await fetch(`${base}/assets/${encodeURIComponent(fileId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=86400`,
    },
  });
}
