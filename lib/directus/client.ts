export function directusBaseUrl(): string {
  const url = process.env.DIRECTUS_URL;
  if (!url) throw new Error("DIRECTUS_URL is not set");
  return url.replace(/\/$/, "");
}

export async function directusGet<T>(path: string, init?: RequestInit): Promise<T> {
  const base = directusBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      // если ты выдашь public read права — токен не нужен
      ...(process.env.DIRECTUS_TOKEN ? { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` } : {}),
    },
    // для Next server components:
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Directus GET ${path} failed: ${res.status} ${res.statusText}. ${text}`);
  }

  return res.json() as Promise<T>;
}

export function directusAssetUrl(fileId: string): string {
  const base = directusBaseUrl();
  return `${base}/assets/${fileId}`;
}
