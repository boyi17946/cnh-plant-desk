import { BOM } from "@/lib/knowledge";
import { fail, json } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const family = url.searchParams.get("family");
    const parts = BOM.filter((part) => {
      if (family && part.family !== family) return false;
      if (!q) return true;
      return (
        part.sku.toLowerCase().includes(q) ||
        part.name.toLowerCase().includes(q) ||
        part.bin.toLowerCase().includes(q)
      );
    });
    return json({ parts });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Parts read failed", 503);
  }
}
