"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlantApi } from "@/hooks/use-plant-api";
import type { BomPart, CatalogMode, Procedure } from "@/lib/types";

type Payload = {
  procedures: Procedure[];
  modes: CatalogMode[];
  parts: BomPart[];
};

export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [family, setFamily] = useState("all");
  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (family !== "all") params.set("family", family);
    const s = params.toString();
    return s ? `/api/library?${s}` : "/api/library";
  }, [q, family]);
  const { data, error, loading, reload } = usePlantApi<Payload>(qs);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Plant library</h2>
        <p className="text-sm text-muted-foreground">
          Mock manuals, TSB steps, and BOM SKUs. Ranking copy may be rewritten; this text is not.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search TSB, symptom, SKU…"
          className="min-h-11"
        />
        <select
          className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
        >
          <option value="all">Both families</option>
          <option value="combine-final">Combine final</option>
          <option value="construction-prep">Construction PDI</option>
        </select>
      </div>
      {loading ? <LoadingState label="Searching the plant manuals…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data && !error ? (
        <Tabs defaultValue="tsb">
          <TabsList>
            <TabsTrigger value="tsb">TSB procedures</TabsTrigger>
            <TabsTrigger value="modes">Failure modes</TabsTrigger>
            <TabsTrigger value="bom">BOM</TabsTrigger>
          </TabsList>
          <TabsContent value="tsb" className="mt-3 space-y-3">
            {data.procedures.length === 0 ? (
              <EmptyState title="No procedures" body="Nothing in the manuals matches that search." />
            ) : (
              data.procedures.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">{p.tsb}</CardTitle>
                    <CardDescription>{p.title}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal space-y-1 pl-4 text-sm">
                      {p.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="modes" className="mt-3 space-y-3">
            {data.modes.length === 0 ? (
              <EmptyState title="No catalog modes" body="The ranker has no family match for that query." />
            ) : (
              data.modes.map((m) => (
                <Card key={m.id}>
                  <CardHeader>
                    <CardTitle>{m.title}</CardTitle>
                    <CardDescription>{m.family}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{m.defaultCopy}</CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="bom" className="mt-3 space-y-2">
            {data.parts.length === 0 ? (
              <EmptyState title="No SKUs" body="Crib bins have nothing for that search." />
            ) : (
              data.parts.map((p) => (
                <div
                  key={p.sku}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-mono">{p.sku}</div>
                    <div>{p.name}</div>
                  </div>
                  <div className="text-muted-foreground">
                    {p.bin} · {p.qtyOnHand} on hand
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
