import { fail, json, readJson } from "@/lib/http";
import { nextId, readStore, updateStore } from "@/lib/store";
import type { Handoff } from "@/lib/types";

export async function GET() {
  try {
    const store = await readStore();
    const openFaults = store.faults.filter((f) => f.status !== "closed");
    return json({
      handoffs: [...store.handoffs].reverse(),
      openFaultIds: openFaults.map((f) => f.id),
      openFaults,
      shift: store.meta.shift,
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Handoff read failed", 503);
  }
}

export async function POST(req: Request) {
  const body = await readJson<{
    fromShift?: string;
    toShift?: string;
    supervisor?: string;
    notes?: string;
  }>(req as never);
  if (!body?.fromShift?.trim() || !body.toShift?.trim() || !body.supervisor?.trim() || !body.notes?.trim()) {
    return fail("fromShift, toShift, supervisor, and notes are required");
  }
  try {
    const store = await updateStore((current) => {
      const openFaultIds = current.faults
        .filter((f) => f.status !== "closed")
        .map((f) => f.id);
      const handoff: Handoff = {
        id: nextId("hnd", current.handoffs),
        fromShift: body.fromShift!.trim(),
        toShift: body.toShift!.trim(),
        supervisor: body.supervisor!.trim(),
        notes: body.notes!.trim(),
        openFaultIds,
        createdAt: new Date().toISOString(),
      };
      return {
        ...current,
        meta: { ...current.meta, shift: handoff.toShift },
        handoffs: [...current.handoffs, handoff],
      };
    });
    const handoff = store.handoffs[store.handoffs.length - 1];
    return json({ handoff }, 201);
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Handoff write failed", 503);
  }
}
