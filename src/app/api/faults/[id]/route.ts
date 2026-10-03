import { fail, json } from "@/lib/http";
import { readStore } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const store = await readStore();
    const fault = store.faults.find((f) => f.id === id);
    if (!fault) return fail("Fault not found", 404);
    const asset = store.assets.find((a) => a.id === fault.assetId) ?? null;
    return json({ fault: { ...fault, asset } });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Fault read failed", 503);
  }
}
