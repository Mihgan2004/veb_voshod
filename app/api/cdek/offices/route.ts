import { NextResponse } from "next/server";
import { getOffices } from "@/lib/cdek";
import type { CdekOfficeType } from "@/lib/cdek/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityCodeStr = searchParams.get("cityCode");
    const type = searchParams.get("type") as CdekOfficeType | null;

    if (!cityCodeStr || isNaN(Number(cityCodeStr))) {
      return NextResponse.json(
        { error: "INVALID_PARAMS", message: "cityCode is required" },
        { status: 400 }
      );
    }

    const offices = await getOffices(Number(cityCodeStr), type || undefined);

    return NextResponse.json({
      ok: true,
      offices: offices.map((o) => ({
        code: o.code,
        name: o.name,
        address: o.location.address_full || o.location.address,
        city: o.location.city,
        cityCode: o.location.city_code,
        type: o.type,
        workTime: o.work_time,
        lat: o.location.latitude,
        lng: o.location.longitude,
        hasCashless: o.have_cashless,
        hasCash: o.have_cash,
        isDressingRoom: o.is_dressing_room,
        nearestMetro: o.nearest_metro_station,
        addressComment: o.address_comment,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[cdek/offices] Error:", e);
    return NextResponse.json(
      { error: "FETCH_FAILED", message },
      { status: 500 }
    );
  }
}
