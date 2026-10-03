"use client";

import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlantApi } from "@/hooks/use-plant-api";
import { formatWhen } from "@/lib/format";
import type { Fault, Handoff } from "@/lib/types";

type Payload = {
  handoffs: Handoff[];
  openFaultIds: string[];
  openFaults: Fault[];
  shift: string;
};

export default function HandoffPage() {
  const { data, error, loading, reload } = usePlantApi<Payload>("/api/handoff");
  const [fromShift, setFromShift] = useState("Days (Sat overtime)");
  const [toShift, setToShift] = useState("Afternoons");
  const [supervisor, setSupervisor] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromShift, toShift, supervisor, notes }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Handoff failed");
      setNotes("");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Handoff failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label="Loading shift handoffs…" />;
  if (error || !data) return <ErrorState message={error || "No payload"} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Changeover handoff</h2>
        <p className="text-sm text-muted-foreground">
          Supervisors pin what the incoming shift must not miss. Current board shift: {data.shift}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post incoming notes</CardTitle>
          <CardDescription>
            Open faults on this board ({data.openFaultIds.length}) are attached automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" value={fromShift} onChange={(e) => setFromShift(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" value={toShift} onChange={(e) => setToShift(e.target.value)} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sup">Supervisor</Label>
              <Input
                id="sup"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="Area lead name"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">What the next crew must know</Label>
              <Textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                placeholder="Do not bump-run ST4-07 until the feeder chains are paired…"
              />
            </div>
            {formError ? <p className="text-sm text-destructive md:col-span-2">{formError}</p> : null}
            <Button type="submit" className="min-h-11 md:col-span-2" disabled={busy}>
              {busy ? "Posting…" : "Post trusted handoff"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {data.openFaults.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Still open at changeover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.openFaults.map((f) => (
              <p key={f.id} className="text-sm">
                <span className="font-mono text-xs">{f.id}</span> · {f.symptom}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="No open faults to carry" body="The incoming crew inherits a clean board." />
      )}

      {data.handoffs.length === 0 ? (
        <EmptyState title="No handoffs yet" body="Post the first changeover note above." />
      ) : (
        data.handoffs.map((h) => (
          <Card key={h.id}>
            <CardHeader>
              <CardTitle>
                {h.fromShift} → {h.toShift}
              </CardTitle>
              <CardDescription>
                {h.supervisor} · {formatWhen(h.createdAt)} · {h.openFaultIds.length} open faults attached
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{h.notes}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
