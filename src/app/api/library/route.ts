import { BOM, CATALOG_MODES, PROCEDURES } from "@/lib/knowledge";
import { fail, json } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const family = url.searchParams.get("family");

    const procedures = PROCEDURES.filter((p) => {
      if (family && p.family !== family) return false;
      if (!q) return true;
      return (
        p.tsb.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.steps.some((s) => s.toLowerCase().includes(q))
      );
    });
    const modes = CATALOG_MODES.filter((m) => {
      if (family && m.family !== family) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.includes(q)) ||
        m.defaultCopy.toLowerCase().includes(q)
      );
    });
    const parts = BOM.filter((p) => {
      if (family && p.family !== family) return false;
      if (!q) return true;
      return p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    });

    return json({ procedures, modes, parts });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Library read failed", 503);
  }
}
