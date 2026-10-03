import { json } from "@/lib/http";

export async function GET() {
  return json({
    ok: true,
    service: "cnh-plant-desk",
    ts: new Date().toISOString(),
  });
}
