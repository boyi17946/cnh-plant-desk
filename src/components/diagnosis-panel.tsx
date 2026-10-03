"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pct } from "@/lib/format";
import type { BomPart, FailureModeRank, Procedure } from "@/lib/types";

export type RankedMode = FailureModeRank & {
  procedure: Procedure | null;
  parts: BomPart[];
};

export function DiagnosisPanel({
  source,
  modes,
  onOpenWorkOrder,
  busy,
}: {
  source: string;
  modes: RankedMode[];
  onOpenWorkOrder: (mode: RankedMode, technician: string) => Promise<void>;
  busy?: boolean;
}) {
  const [tech, setTech] = useState("");
  const [picked, setPicked] = useState(modes[0]?.id ?? "");

  const selected = modes.find((m) => m.id === picked) ?? modes[0];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Ranker: {source === "catalog+live-copy" ? "catalog + live copy rewrite" : "plant catalog"}.
        Steps and SKUs stay in the plant manuals.
      </p>
      <ol className="space-y-2">
        {modes.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              onClick={() => setPicked(mode.id)}
              className={`w-full rounded-lg border p-3 text-left ${
                selected?.id === mode.id ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{mode.title}</span>
                <span className="font-mono text-sm">{pct(mode.confidence)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: pct(mode.confidence) }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{mode.copy}</p>
            </button>
          </li>
        ))}
      </ol>
      {selected?.procedure ? (
        <div className="rounded-lg bg-muted/60 p-3">
          <p className="font-mono text-xs text-primary">{selected.procedure.tsb}</p>
          <p className="font-medium">{selected.procedure.title}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
            {selected.procedure.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {selected ? (
        <div>
          <p className="mb-1 text-sm font-medium">BOM pull</p>
          <ul className="text-sm">
            {selected.parts.map((part) => (
              <li key={part.sku} className="flex justify-between gap-2 py-1">
                <span>
                  <span className="font-mono">{part.sku}</span> · {part.name}
                </span>
                <span className="text-muted-foreground">
                  {part.bin} · {part.qtyOnHand} on hand
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="tech">Technician on the job</Label>
        <Input
          id="tech"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          placeholder="Badge name"
        />
        <Button
          className="w-full min-h-11"
          disabled={!selected || !tech.trim() || busy}
          onClick={() => selected && onOpenWorkOrder(selected, tech.trim())}
        >
          Open work order from this mode
        </Button>
      </div>
    </div>
  );
}
