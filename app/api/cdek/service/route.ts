import { NextResponse } from "next/server";
import { getToken, getCdekBaseUrl } from "@/lib/cdek";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, params } = body;

    const token = await getToken();
    const baseUrl = getCdekBaseUrl();

    let response: Response;
    let result: unknown;

    switch (action) {
      case "offices": {
        const officeParams = new URLSearchParams();
        if (params.city_code) officeParams.set("city_code", params.city_code);
        if (params.type) officeParams.set("type", params.type);
        if (params.postal_code) officeParams.set("postal_code", params.postal_code);
        if (params.country_code) officeParams.set("country_codes", params.country_code);

        response = await fetch(
          `${baseUrl}/deliverypoints?${officeParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );
        result = await response.json();
        break;
      }

      case "calculate":
        response = await fetch(`${baseUrl}/calculator/tarifflist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(params),
          cache: "no-store",
        });
        result = await response.json();
        break;

      case "cities": {
        const cityParams = new URLSearchParams();
        if (params.city) cityParams.set("city", params.city);
        if (params.country_codes) cityParams.set("country_codes", params.country_codes);
        if (params.size) cityParams.set("size", params.size);

        response = await fetch(
          `${baseUrl}/location/cities?${cityParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );
        result = await response.json();
        break;
      }

      case "regions": {
        const regionParams = new URLSearchParams();
        if (params.country_codes) regionParams.set("country_codes", params.country_codes);
        if (params.size) regionParams.set("size", params.size);

        response = await fetch(
          `${baseUrl}/location/regions?${regionParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );
        result = await response.json();
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[cdek/service] Error:", e);
    return NextResponse.json(
      { error: "SERVICE_ERROR", message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "cdek-proxy" });
}
