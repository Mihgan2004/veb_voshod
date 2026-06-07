import { NextResponse } from "next/server";

/** Legacy Directus + YooKassa checkout — replaced by /api/checkout/medusa */
export async function POST() {
  return NextResponse.json(
    {
      error: "DEPRECATED",
      message: "Use /api/checkout/medusa. Legacy Directus checkout is disabled.",
    },
    { status: 410 },
  );
}
