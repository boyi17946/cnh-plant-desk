import { partsBySkus, procedureById } from "@/lib/knowledge";
import { fail, json, readJson } from "@/lib/http";
import { nextId, readStore, updateStore } from "@/lib/store";
import type { WorkOrder } from "@/lib/types";

export async function GET() {
  try {
    const store = await readStore();
    const assets = Object.fromEntries(store.assets.map((a) => [a.id, a]));
    return json({
      workOrders: store.workOrders.map((wo) => ({
        ...wo,
        asset: assets[wo.assetId] ?? null,
        procedure: procedureById(wo.procedureId) ?? null,
        parts: partsBySkus(wo.partSkus),
      })),
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Work orders read failed", 503);
  }
}

export async function POST(req: Request) {
  const body = await readJson<{
    faultId?: string;
    technician?: string;
    procedureId?: string;
    partSkus?: string[];
    notes?: string;
    title?: string;
  }>(req as never);
  if (!body?.faultId || !body.technician?.trim()) {
    return fail("faultId and technician are required");
  }

  try {
    const store = await updateStore((current) => {
      const fault = current.faults.find((f) => f.id === body.faultId);
      if (!fault) throw new Error("Unknown fault");
      const top = fault.diagnosis?.modes[0];
      const procedureId = body.procedureId || top?.procedureId;
      if (!procedureId || !procedureById(procedureId)) {
        throw new Error("Diagnose the fault before opening a work order");
      }
      const partSkus = body.partSkus?.length ? body.partSkus : top?.partSkus ?? [];
      const wo: WorkOrder = {
        id: nextId("wo", current.workOrders),
        faultId: fault.id,
        assetId: fault.assetId,
        title:
          body.title?.trim() ||
          `${procedureById(procedureId)?.title ?? "Repair"} · ${fault.id}`,
        status: "queued",
        technician: body.technician!.trim(),
        procedureId,
        partSkus,
        notes: body.notes?.trim() || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...current,
        workOrders: [wo, ...current.workOrders],
        faults: current.faults.map((row) =>
          row.id === fault.id ? { ...row, status: "assigned" as const } : row,
        ),
      };
    });
    const wo = store.workOrders[0];
    const asset = store.assets.find((a) => a.id === wo.assetId) ?? null;
    return json(
      {
        workOrder: {
          ...wo,
          asset,
          procedure: procedureById(wo.procedureId) ?? null,
          parts: partsBySkus(wo.partSkus),
        },
      },
      201,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Work order create failed";
    const status = message.startsWith("Unknown") || message.startsWith("Diagnose") ? 400 : 503;
    return fail(message, status);
  }
}
