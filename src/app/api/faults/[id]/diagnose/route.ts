import { diagnoseFault } from "@/lib/ai";
import { partsBySkus, procedureById } from "@/lib/knowledge";
import { fail, json } from "@/lib/http";
import { readStore, updateStore } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const store = await readStore();
    const fault = store.faults.find((f) => f.id === id);
    if (!fault) return fail("Fault not found", 404);
    const asset = store.assets.find((a) => a.id === fault.assetId);
    if (!asset) return fail("Asset missing for fault", 409);

    const diagnosis = await diagnoseFault(fault.symptom, asset.family);
    const next = await updateStore((current) => ({
      ...current,
      faults: current.faults.map((row) =>
        row.id === id
          ? {
              ...row,
              diagnosis,
              status: row.status === "open" ? "diagnosed" : row.status,
            }
          : row,
      ),
    }));
    const updated = next.faults.find((f) => f.id === id)!;
    const modes = (updated.diagnosis?.modes ?? []).map((mode) => ({
      ...mode,
      procedure: procedureById(mode.procedureId) ?? null,
      parts: partsBySkus(mode.partSkus),
    }));

    return json({
      fault: { ...updated, asset },
      diagnosis: { ...updated.diagnosis, modes },
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Diagnose failed", 503);
  }
}
