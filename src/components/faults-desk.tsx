"use client";

import { useMemo, useState } from "react";
import { DiagnosisPanel, type RankedMode } from "@/components/diagnosis-panel";
import { EmptyState, ErrorState, LoadingState, SeverityBadge, StatusBadge } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { usePlantApi } from "@/hooks/use-plant-api";
import { formatWhen } from "@/lib/format";
import { partsBySkus, procedureById } from "@/lib/knowledge";
import type { FaultsPayload } from "@/lib/payloads";
import type { Diagnosis, Fault, FaultSeverity } from "@/lib/types";

export function FaultsDesk({ initial }: { initial: FaultsPayload }) {
  const { data, error, loading, reload } = usePlantApi<FaultsPayload>(
    "/api/faults",
    initial,
  );
  const [assetId, setAssetId] = useState<string>("");
  const [reportedBy, setReportedBy] = useState("");
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState<FaultSeverity>("stop");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dxBusy, setDxBusy] = useState(false);
  const [woBusy, setWoBusy] = useState(false);

  const selected = useMemo(
    () => data?.faults.find((f) => f.id === openId) ?? null,
    [data, openId],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const form = new FormData();
      form.set("assetId", assetId);
      form.set("reportedBy", reportedBy);
      form.set("shift", "Days (Sat overtime)");
      form.set("symptom", symptom);
      form.set("severity", severity);
      form.set("diagnose", "true");
      if (photo) form.set("photo", photo);
      const res = await fetch("/api/faults", { method: "POST", body: form });
      const body = (await res.json()) as { error?: string; fault?: Fault };
      if (!res.ok) throw new Error(body.error || "Log failed");
      setSymptom("");
      setPhoto(null);
      await reload();
      if (body.fault?.id) setOpenId(body.fault.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Log failed");
    } finally {
      setSaving(false);
    }
  }

  async function diagnose(id: string) {
    setDxBusy(true);
    try {
      const res = await fetch(`/api/faults/${id}/diagnose`, { method: "POST" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Diagnose failed");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Diagnose failed");
    } finally {
      setDxBusy(false);
    }
  }

  async function openWorkOrder(mode: RankedMode, technician: string) {
    if (!selected) return;
    setWoBusy(true);
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faultId: selected.id,
          technician,
          procedureId: mode.procedureId,
          partSkus: mode.partSkus,
          title: `${mode.title} · ${selected.asset?.tag ?? selected.id}`,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Work order failed");
      await reload();
      setOpenId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Work order failed");
    } finally {
      setWoBusy(false);
    }
  }

  if (loading) return <LoadingState label="Pulling the fault log…" />;
  if (error || !data) return <ErrorState message={error || "No payload"} onRetry={reload} />;

  const modes = enrichModes(selected?.diagnosis);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Fault log</h2>
        <p className="text-sm text-muted-foreground">
          Operators tag the asset and the symptom from the tablet. No desktop login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New tag</CardTitle>
          <CardDescription>Photo optional. Ranker runs as soon as you post.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
            <div className="space-y-2 md:col-span-2">
              <Label>Asset</Label>
              <Select value={assetId || null} onValueChange={(v) => setAssetId(String(v ?? ""))}>
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue placeholder="Pick the unit on the station" />
                </SelectTrigger>
                <SelectContent>
                  {data.assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.tag} · {asset.model} · {asset.station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="who">Who is tagging</Label>
              <Input
                id="who"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Name and role"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as FaultSeverity)}>
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stop">Stop the station</SelectItem>
                  <SelectItem value="slow">Run slow</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="symptom">What did you hear / see</Label>
              <Textarea
                id="symptom"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                required
                rows={4}
                placeholder="Feeder house rattling at 1800 rpm after chain pull…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="min-h-11 w-full" disabled={saving || !assetId}>
                {saving ? "Posting tag…" : "Post fault and rank"}
              </Button>
            </div>
            {formError ? (
              <p className="text-sm text-destructive md:col-span-2">{formError}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {data.faults.length === 0 ? (
        <EmptyState
          title="No faults on the board"
          body="That is a real empty log, not a dead API. Tag the next noise from this page."
        />
      ) : (
        <div className="grid gap-3">
          {data.faults.map((fault) => (
            <Card key={fault.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm">
                    {fault.asset?.tag ?? fault.assetId}
                  </span>
                  <span className="flex gap-2">
                    <SeverityBadge severity={fault.severity} />
                    <StatusBadge status={fault.status} />
                  </span>
                </CardTitle>
                <CardDescription>
                  {fault.reportedBy} · {fault.shift} · {formatWhen(fault.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{fault.symptom}</p>
                {fault.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fault.photoUrl}
                    alt="Fault photo"
                    className="max-h-48 rounded-md border bg-muted object-contain"
                  />
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setOpenId(fault.id)}>
                    Open diagnosis
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={dxBusy}
                    onClick={() => diagnose(fault.id)}
                  >
                    Re-rank
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={Boolean(openId)} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Ranked failure modes</SheetTitle>
            <SheetDescription>
              {selected?.asset?.tag} · {selected?.asset?.model}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            {selected && modes.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This tag has not been ranked yet.
                </p>
                <Button disabled={dxBusy} onClick={() => selected && diagnose(selected.id)}>
                  Rank from catalog
                </Button>
              </div>
            ) : (
              <DiagnosisPanel
                source={selected?.diagnosis?.source ?? "catalog"}
                modes={modes}
                onOpenWorkOrder={openWorkOrder}
                busy={woBusy}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function enrichModes(diagnosis?: Diagnosis): RankedMode[] {
  if (!diagnosis) return [];
  return diagnosis.modes.map((mode) => ({
    ...mode,
    procedure: procedureById(mode.procedureId) ?? null,
    parts: partsBySkus(mode.partSkus),
  }));
}
