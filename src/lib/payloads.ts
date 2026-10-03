import { BOM, CATALOG_MODES, PROCEDURES } from "./knowledge";
import { dashboardPayload, enrichStore } from "./http";
import { readStore } from "./store";
import type {
  Asset,
  BomPart,
  CatalogMode,
  Fault,
  Handoff,
  Procedure,
} from "./types";

export type DashboardPayload = ReturnType<typeof dashboardPayload>;

export type FaultsPayload = {
  faults: (Fault & { asset: Asset | null })[];
  assets: Asset[];
};

export type WorkOrdersPayload = {
  workOrders: ReturnType<typeof enrichStore>["workOrders"];
};

export type LibraryPayload = {
  procedures: Procedure[];
  modes: CatalogMode[];
  parts: BomPart[];
};

export type HandoffPayload = {
  handoffs: Handoff[];
  openFaultIds: string[];
  openFaults: Fault[];
  shift: string;
};

export async function loadDashboard() {
  return dashboardPayload(await readStore());
}

export async function loadFaults(): Promise<FaultsPayload> {
  const store = await readStore();
  const assets = Object.fromEntries(store.assets.map((a) => [a.id, a]));
  return {
    assets: store.assets,
    faults: store.faults.map((fault) => ({
      ...fault,
      asset: assets[fault.assetId] ?? null,
    })),
  };
}

export async function loadWorkOrders(): Promise<WorkOrdersPayload> {
  const store = enrichStore(await readStore());
  return { workOrders: store.workOrders };
}

export function loadLibrary(): LibraryPayload {
  return { procedures: PROCEDURES, modes: CATALOG_MODES, parts: BOM };
}

export async function loadHandoff(): Promise<HandoffPayload> {
  const store = await readStore();
  const openFaults = store.faults.filter((f) => f.status !== "closed");
  return {
    handoffs: [...store.handoffs].reverse(),
    openFaultIds: openFaults.map((f) => f.id),
    openFaults,
    shift: store.meta.shift,
  };
}
