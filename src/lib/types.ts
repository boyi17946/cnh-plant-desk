export type AssetFamily = "combine-final" | "construction-prep";

export type AssetStatus = "running" | "down" | "hold";

export type Asset = {
  id: string;
  tag: string;
  model: string;
  family: AssetFamily;
  station: string;
  line: string;
  status: AssetStatus;
};

export type FaultSeverity = "stop" | "slow" | "watch";
export type FaultStatus = "open" | "diagnosed" | "assigned" | "closed";

export type FailureModeRank = {
  id: string;
  title: string;
  confidence: number;
  copy: string;
  procedureId: string;
  partSkus: string[];
};

export type Diagnosis = {
  rankedAt: string;
  source: "catalog" | "catalog+live-copy";
  modes: FailureModeRank[];
};

export type Fault = {
  id: string;
  assetId: string;
  reportedBy: string;
  shift: string;
  symptom: string;
  severity: FaultSeverity;
  status: FaultStatus;
  photoUrl?: string;
  createdAt: string;
  diagnosis?: Diagnosis;
};

export type WorkOrderStatus = "queued" | "wrenching" | "parts-hold" | "closed";

export type WorkOrder = {
  id: string;
  faultId: string;
  assetId: string;
  title: string;
  status: WorkOrderStatus;
  technician: string;
  procedureId: string;
  partSkus: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Handoff = {
  id: string;
  fromShift: string;
  toShift: string;
  supervisor: string;
  notes: string;
  openFaultIds: string[];
  createdAt: string;
};

export type PlantStore = {
  assets: Asset[];
  faults: Fault[];
  workOrders: WorkOrder[];
  handoffs: Handoff[];
  meta: {
    plant: string;
    seededAt: string;
    shift: string;
  };
};

export type Procedure = {
  id: string;
  tsb: string;
  title: string;
  family: AssetFamily;
  steps: string[];
};

export type BomPart = {
  sku: string;
  name: string;
  family: AssetFamily;
  bin: string;
  qtyOnHand: number;
};

export type CatalogMode = {
  id: string;
  title: string;
  family: AssetFamily;
  keywords: string[];
  defaultCopy: string;
  procedureId: string;
  partSkus: string[];
};
