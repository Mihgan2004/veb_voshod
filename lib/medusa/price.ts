/**
 * Normalizes Medusa Store API price amounts for UI display (rubles).
 *
 * By default Medusa returns amounts in the smallest currency unit (kopecks for RUB).
 * Set MEDUSA_PRICE_IN_MAJOR_UNITS=true if your backend already returns major units.
 */
export function normalizeMedusaPrice(
  amount: number | null | undefined,
  currencyCode?: string | null,
): number {
  if (amount == null || !Number.isFinite(amount)) return 0;

  if (process.env.MEDUSA_PRICE_IN_MAJOR_UNITS === "true") {
    return amount;
  }

  const code = (currencyCode ?? "rub").toLowerCase();
  const zeroDecimal = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);
  if (zeroDecimal.has(code)) {
    return amount;
  }

  return amount / 100;
}
