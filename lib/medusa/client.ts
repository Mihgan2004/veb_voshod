import Medusa from "@medusajs/js-sdk";

let instance: Medusa | null = null;

function createClient(): Medusa {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required. Add it to .env.local",
    );
  }

  return new Medusa({
    baseUrl:
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "https://api.projectrassvet.ru",
    publishableKey,
    debug: process.env.NODE_ENV === "development",
  });
}

export function getMedusa(): Medusa {
  if (!instance) {
    instance = createClient();
  }
  return instance;
}

/** Lazy singleton — safe when Medusa env vars are absent (mock catalog fallback). */
export const medusa = new Proxy({} as Medusa, {
  get(_target, prop, receiver) {
    const client = getMedusa();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function getRegionId(): string {
  const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;
  if (!regionId) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_REGION_ID is required. Add it to .env.local",
    );
  }
  return regionId;
}
