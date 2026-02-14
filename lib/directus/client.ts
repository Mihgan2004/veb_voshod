// lib/directus/client.ts
/** Ревалидация кэша Next.js для GET-запросов (ISR). POST — всегда no-store. */
const CACHE_REVALIDATE_SEC = 60;

type DirectusClientConfig = {
  url: string;
  token?: string;
  /** Секунды для next.revalidate (только GET). По умолчанию 60. */
  revalidate?: number;
};

type DirectusError = {
  errors?: Array<{ message?: string }>;
};

export function createDirectusClient({
  url,
  token,
  revalidate = CACHE_REVALIDATE_SEC,
}: DirectusClientConfig) {
  const base = url.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    const method = (init?.method ?? "GET").toUpperCase();

    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const isGet = method === "GET";
    const { next: _initNext, ...restInit } = init ?? {};
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      ...restInit,
      headers,
      ...(isGet
        ? { next: { revalidate } }
        : { cache: "no-store" as RequestCache }),
    };

    const res = await fetch(`${base}${path}`, fetchOptions);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `Directus request failed: ${res.status} ${res.statusText}`;
      try {
        const parsed = JSON.parse(text) as DirectusError;
        const apiMsg = parsed?.errors?.[0]?.message;
        if (apiMsg) message = `${message}: ${apiMsg}`;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return (await res.json()) as T;
  }

  return { request, base };
}
