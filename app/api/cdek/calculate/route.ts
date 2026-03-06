import { NextResponse } from "next/server";
import {
  calculateTariff,
  getFromCityCode,
  getDefaultPackage,
  type CdekTariffCode,
  type CdekPackage,
  CDEK_TARIFF_CODES,
} from "@/lib/cdek";

type CalculateRequestBody = {
  toCityCode: number;
  tariffCode?: CdekTariffCode;
  packages?: CdekPackage[];
};

function validateBody(body: unknown): body is CalculateRequestBody {
  if (!body || typeof body !== "object") return false;

  const b = body as Record<string, unknown>;

  if (typeof b.toCityCode !== "number" || b.toCityCode <= 0) return false;

  if (b.tariffCode !== undefined) {
    const validCodes = Object.values(CDEK_TARIFF_CODES);
    if (!validCodes.includes(b.tariffCode as CdekTariffCode)) return false;
  }

  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { toCityCode, tariffCode, packages } = body;

    const fromCityCode = getFromCityCode();
    const tariff = tariffCode ?? CDEK_TARIFF_CODES.WAREHOUSE_TO_OFFICE;
    const pkgs = packages ?? [getDefaultPackage()];

    const result = await calculateTariff(fromCityCode, toCityCode, pkgs, tariff);

    return NextResponse.json({
      ok: true,
      delivery_sum: result.delivery_sum,
      total_sum: result.total_sum,
      period_min: result.period_min,
      period_max: result.period_max,
      currency: result.currency,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[cdek/calculate] Error:", e);
    return NextResponse.json(
      { error: "CALCULATION_FAILED", message },
      { status: 500 }
    );
  }
}
