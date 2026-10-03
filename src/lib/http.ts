import type { NextRequest } from "next/server";
import { partsBySkus, procedureById } from "./knowledge";
import type { PlantStore } from "./types";

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function readJson<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function enrichStore(store: PlantStore) {
  const assetsById = Object.fromEntries(store.assets.map((a) => [a.id, a]));
  const faults = store.faults.map((fault) => ({
    ...fault,
    asset: assetsById[fault.assetId] ?? null,
  }));
  const workOrders = store.workOrders.map((wo) => ({
    ...wo,
    asset: assetsById[wo.assetId] ?? null,
    procedure: procedureById(wo.procedureId) ?? null,
    parts: partsBySkus(wo.partSkus),
  }));
  return { ...store, faults, workOrders };
}

export function dashboardPayload(store: PlantStore) {
  const enriched = enrichStore(store);
  const openFaults = enriched.faults.filter((f) => f.status !== "closed");
  const liveJobs = enriched.workOrders.filter((w) => w.status !== "closed");
  const down = store.assets.filter((a) => a.status === "down").length;
  const hold = store.assets.filter((a) => a.status === "hold").length;
  return {
    meta: store.meta,
    counts: {
      assets: store.assets.length,
      down,
      hold,
      openFaults: openFaults.length,
      liveJobs: liveJobs.length,
    },
    assets: store.assets,
    openFaults,
    liveJobs,
    lastHandoff: store.handoffs[store.handoffs.length - 1] ?? null,
  };
}
