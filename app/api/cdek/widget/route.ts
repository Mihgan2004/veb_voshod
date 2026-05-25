import { NextResponse } from "next/server";
import { getToken, getCdekBaseUrl } from "@/lib/cdek";

const ALLOWED_ACTIONS = new Set(["offices", "calculate", "cities"]);

type WidgetBody = {
  action?: string;
  params?: Record<string, unknown>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Restricted adapter for the official CDEK map widget (replaces open /api/cdek/service proxy).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WidgetBody;
    const action = typeof body.action === "string" ? body.action : "";
    const params = isRecord(body.params) ? body.params : {};

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const token = await getToken();
    const baseUrl = getCdekBaseUrl();

    if (action === "offices") {
      const officeParams = new URLSearchParams();
      if (typeof params.city_code === "number" || typeof params.city_code === "string") {
        officeParams.set("city_code", String(params.city_code));
      }
      if (typeof params.type === "string") officeParams.set("type", params.type);
      if (typeof params.postal_code === "string") {
        officeParams.set("postal_code", params.postal_code);
      }
      if (typeof params.country_code === "string") {
        officeParams.set("country_codes", params.country_code);
      }

      const response = await fetch(
        `${baseUrl}/deliverypoints?${officeParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const result = await response.json();
      return NextResponse.json(result, { status: response.status });
    }

    if (action === "calculate") {
      const response = await fetch(`${baseUrl}/calculator/tarifflist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
        cache: "no-store",
      });
      const result = await response.json();
      return NextResponse.json(result, { status: response.status });
    }

    if (action === "cities") {
      const cityParams = new URLSearchParams();
      if (typeof params.city === "string") cityParams.set("city", params.city);
      if (typeof params.country_codes === "string") {
        cityParams.set("country_codes", params.country_codes);
      }
      if (typeof params.size === "number" || typeof params.size === "string") {
        cityParams.set("size", String(params.size));
      }

      const response = await fetch(
        `${baseUrl}/location/cities?${cityParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const result = await response.json();
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[cdek/widget] Error:", message);
    return NextResponse.json(
      { error: "WIDGET_ERROR", message: "CDEK request failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "cdek-widget" });
}
