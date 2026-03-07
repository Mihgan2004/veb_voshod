import { NextResponse } from "next/server";
import { searchCities } from "@/lib/cdek";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "INVALID_QUERY", message: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const cities = await searchCities(query);

    return NextResponse.json({
      ok: true,
      cities: cities.map((c) => ({
        code: c.code,
        name: c.city,
        region: c.region || "",
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[cdek/cities] Error:", e);
    return NextResponse.json(
      { error: "SEARCH_FAILED", message },
      { status: 500 }
    );
  }
}
