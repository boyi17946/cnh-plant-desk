"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/states";
import { usePlantApi } from "@/hooks/use-plant-api";
import { formatWhen } from "@/lib/format";
import type { DashboardPayload } from "@/lib/payloads";

export function ShiftBoard({ initial }: { initial: DashboardPayload }) {
  const { data, error, loading, reload } = usePlantApi<DashboardPayload>(
    "/api/dashboard",
    initial,
  );
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function resetSeed() {
    setResetting(true);
    setResetError(null);
    try {
      const res = await fetch("/api/dashboard", { method: "POST" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Reset failed");
      await reload();
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  if (loading) return <LoadingState label="Loading the shift board from the plant store…" />;
  if (error || !data) {
    return <ErrorState message={error || "No payload"} onRetry={reload} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Live shift board</h2>
          <p className="text-sm text-muted-foreground">
            {data.meta.shift} · Saturday overtime catch-up · seed clock{" "}
            {formatWhen(data.meta.seededAt)}
          </p>
        </div>
        <Button variant="outline" onClick={resetSeed} disabled={resetting}>
          {resetting ? "Restoring seed…" : "Restore demo seed"}
        </Button>
      </div>
      {resetError ? (
        <p className="text-sm text-destructive">Seed reset failed: {resetError}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Machines down" value={String(data.counts.down)} tone="bad" />
        <Kpi label="On hold" value={String(data.counts.hold)} />
        <Kpi label="Open faults" value={String(data.counts.openFaults)} />
        <Kpi label="Live jobs" value={String(data.counts.liveJobs)} />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Stations and bays
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.assets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm">{asset.tag}</span>
                  <StatusBadge status={asset.status} />
                </CardTitle>
                <CardDescription>
                  {asset.model} · {asset.station}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {asset.line}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open faults</CardTitle>
            <CardDescription>Operator tags still in the queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.openFaults.length === 0 ? (
              <EmptyState
                title="No open faults"
                body="The floor is clear. Log the next rattle from the fault page."
              />
            ) : (
              data.openFaults.map((fault) => (
                <div key={fault.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs">{fault.asset?.tag}</span>
                    <StatusBadge status={fault.status} />
                  </div>
                  <p className="mt-1 text-sm">{fault.symptom}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fault.reportedBy} · {formatWhen(fault.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wrenches out</CardTitle>
            <CardDescription>Work orders that are not closed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.liveJobs.length === 0 ? (
              <EmptyState
                title="No live jobs"
                body="Diagnose a fault and open a work order from the ranked mode."
              />
            ) : (
              data.liveJobs.map((wo) => (
                <div key={wo.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{wo.title}</span>
                    <StatusBadge status={wo.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {wo.technician} · {wo.asset?.tag}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {data.lastHandoff ? (
        <Card>
          <CardHeader>
            <CardTitle>Trusted handoff on the board</CardTitle>
            <CardDescription>
              {data.lastHandoff.fromShift} → {data.lastHandoff.toShift} ·{" "}
              {data.lastHandoff.supervisor}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{data.lastHandoff.notes}</p>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No handoff posted"
          body="Supervisors write the incoming shift notes on the Handoff page."
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bad";
}) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={tone === "bad" ? "text-3xl text-destructive" : "text-3xl"}>
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
