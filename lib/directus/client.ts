// lib/directus/client.ts
type DirectusClientConfig = {
  url: string;
  token?: string;
};

type DirectusError = {
  errors?: Array<{ message?: string }>;
};

export function createDirectusClient({ url, token }: DirectusClientConfig) {
  const base = url.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);

    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });

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
