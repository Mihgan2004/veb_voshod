import { NextResponse } from "next/server";

/** Legacy Directus orders API — replaced by Medusa checkout */
export async function POST() {
  return NextResponse.json(
    {
      error: "DEPRECATED",
      message: "Directus orders API is disabled. Use Medusa checkout.",
    },
    { status: 410 },
  );
}
