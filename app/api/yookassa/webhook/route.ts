import { handleYooKassaPost } from "@/lib/yookassa/webhook-handler";

export async function POST(req: Request) {
  return handleYooKassaPost(req);
}

export async function GET() {
  return Response.json({ status: "ok", service: "yookassa-webhook" });
}
