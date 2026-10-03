import { partsBySkus, procedureById } from "@/lib/knowledge";
import { fail, json, readJson } from "@/lib/http";
import { updateStore } from "@/lib/store";
import type { AssetStatus, WorkOrderStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES: WorkOrderStatus[] = ["queued", "wrenching", "parts-hold", "closed"];

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await readJson<{
    status?: WorkOrderStatus;
    notes?: string;
    technician?: string;
  }>(req as never);
  if (!body) return fail("Invalid JSON");
  if (body.status && !STATUSES.includes(body.status)) {
    return fail("Invalid work order status");
  }

  try {
    let missing = false;
    const store = await updateStore((current) => {
      const wo = current.workOrders.find((row) => row.id === id);
      if (!wo) {
        missing = true;
        return current;
      }
      const nextWo = {
        ...wo,
        status: body.status ?? wo.status,
        notes: body.notes ?? wo.notes,
        technician: body.technician?.trim() || wo.technician,
        updatedAt: new Date().toISOString(),
      };
      const workOrders = current.workOrders.map((row) =>
        row.id === id ? nextWo : row,
      );
      let assets = current.assets;
      let faults = current.faults;
      if (nextWo.status === "closed") {
        faults = faults.map((f) =>
          f.id === nextWo.faultId ? { ...f, status: "closed" as const } : f,
        );
        const stillOpen = faults.some(
          (f) => f.assetId === nextWo.assetId && f.status !== "closed",
        );
        if (!stillOpen) {
          assets = assets.map((a) =>
            a.id === nextWo.assetId ? { ...a, status: "running" as AssetStatus } : a,
          );
        }
      }
      return { ...current, workOrders, assets, faults };
    });
    if (missing) return fail("Work order not found", 404);
    const wo = store.workOrders.find((row) => row.id === id)!;
    const asset = store.assets.find((a) => a.id === wo.assetId) ?? null;
    return json({
      workOrder: {
        ...wo,
        asset,
        procedure: procedureById(wo.procedureId) ?? null,
        parts: partsBySkus(wo.partSkus),
      },
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Work order update failed", 503);
  }
}
