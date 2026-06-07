export class MedusaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MedusaConfigError";
  }
}

export function assertMedusaEnv(): void {
  if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.trim()) {
    throw new MedusaConfigError(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required. Add it to .env.local or server environment.",
    );
  }
  if (!process.env.NEXT_PUBLIC_MEDUSA_REGION_ID?.trim()) {
    throw new MedusaConfigError(
      "NEXT_PUBLIC_MEDUSA_REGION_ID is required. Add it to .env.local or server environment.",
    );
  }
}

export function shouldUseMockCatalog(): boolean {
  const source = (
    process.env.CATALOG_SOURCE ??
    process.env.NEXT_PUBLIC_CATALOG_SOURCE ??
    ""
  ).toLowerCase();
  return source === "mock" && process.env.NODE_ENV !== "production";
}
