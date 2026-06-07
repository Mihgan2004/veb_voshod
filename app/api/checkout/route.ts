import { NextResponse } from "next/server";

/**
 * DEPRECATED stub — legacy Directus + YooKassa checkout.
 * Frontend must use /api/checkout/medusa. This route will be removed after YooKassa Medusa integration.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "DEPRECATED",
      message: "Use /api/checkout/medusa. Legacy Directus checkout is disabled.",
    },
    { status: 410 },
  );
}
