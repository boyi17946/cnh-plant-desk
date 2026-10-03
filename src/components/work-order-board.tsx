"use client";

import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlantApi } from "@/hooks/use-plant-api";
import { formatWhen } from "@/lib/format";
import type { WorkOrdersPayload } from "@/lib/payloads";
import type { WorkOrder, WorkOrderStatus } from "@/lib/types";
import { useState } from "react";

const NEXT: Record<WorkOrderStatus, WorkOrderStatus | null> = {
  queued: "wrenching",
  wrenching: "closed",
  "parts-hold": "wrenching",
  closed: null,
};

export function WorkOrderBoard({ initial }: { initial: WorkOrdersPayload }) {
  const { data, error, loading, reload } = usePlantApi<WorkOrdersPayload>(
    "/api/work-orders",
    initial,
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function patch(id: string, status: WorkOrderStatus) {
    setBusy(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Update failed");
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <LoadingState label="Loading work orders…" />;
  if (error || !data) return <ErrorState message={error || "No payload"} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Work orders</h2>
        <p className="text-sm text-muted-foreground">
          Opened from a ranked failure mode. Parts and TSB steps stay on the job card.
        </p>
      </div>
      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {data.workOrders.length === 0 ? (
        <EmptyState
          title="No work orders"
          body="Diagnose a fault on the fault log, then open a job from the top mode."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tech</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell>
                      <div className="font-medium">{wo.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">{wo.id}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{wo.asset?.tag}</TableCell>
                    <TableCell>{wo.technician}</TableCell>
                    <TableCell>
                      <StatusBadge status={wo.status} />
                    </TableCell>
                    <TableCell className="text-xs">{formatWhen(wo.updatedAt)}</TableCell>
                    <TableCell>
                      <WoActions wo={wo} busy={busy === wo.id} onPatch={patch} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {data.workOrders.map((wo) => (
              <Card key={wo.id}>
                <CardHeader>
                  <CardTitle className="text-base">{wo.title}</CardTitle>
                  <CardDescription>
                    {wo.technician} · {wo.asset?.tag}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatusBadge status={wo.status} />
                  <p className="text-sm">{wo.notes || "No wrench notes yet."}</p>
                  <WoActions wo={wo} busy={busy === wo.id} onPatch={patch} />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-3">
            {data.workOrders.map((wo) =>
              wo.procedure ? (
                <Card key={`${wo.id}-detail`} className="hidden md:block">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">{wo.procedure.tsb}</CardTitle>
                    <CardDescription>{wo.procedure.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <ol className="list-decimal space-y-1 pl-4 text-sm">
                      {wo.procedure.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    <ul className="text-sm">
                      {wo.parts.map((p) => (
                        <li key={p.sku}>
                          <span className="font-mono">{p.sku}</span> · {p.name} · {p.bin}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null,
            )}
          </div>
        </>
      )}
    </div>
  );
}

function WoActions({
  wo,
  busy,
  onPatch,
}: {
  wo: WorkOrder;
  busy: boolean;
  onPatch: (id: string, status: WorkOrderStatus) => void;
}) {
  const next = NEXT[wo.status];
  return (
    <div className="flex flex-wrap gap-2">
      {wo.status !== "parts-hold" && wo.status !== "closed" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onPatch(wo.id, "parts-hold")}
        >
          Parts hold
        </Button>
      ) : null}
      {next ? (
        <Button size="sm" disabled={busy} onClick={() => onPatch(wo.id, next)}>
          {next === "wrenching" ? "Start wrenching" : "Close job"}
        </Button>
      ) : null}
    </div>
  );
}
