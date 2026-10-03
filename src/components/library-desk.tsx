"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LibraryPayload } from "@/lib/payloads";

export function LibraryDesk({ initial }: { initial: LibraryPayload }) {
  const [q, setQ] = useState("");
  const [family, setFamily] = useState("all");
  const needle = q.trim().toLowerCase();

  const data = useMemo(() => {
    const familyOk = (f: string) => family === "all" || f === family;
    return {
      procedures: initial.procedures.filter((p) => {
        if (!familyOk(p.family)) return false;
        if (!needle) return true;
        return (
          p.tsb.toLowerCase().includes(needle) ||
          p.title.toLowerCase().includes(needle) ||
          p.steps.some((s) => s.toLowerCase().includes(needle))
        );
      }),
      modes: initial.modes.filter((m) => {
        if (!familyOk(m.family)) return false;
        if (!needle) return true;
        return (
          m.title.toLowerCase().includes(needle) ||
          m.keywords.some((k) => k.includes(needle)) ||
          m.defaultCopy.toLowerCase().includes(needle)
        );
      }),
      parts: initial.parts.filter((p) => {
        if (!familyOk(p.family)) return false;
        if (!needle) return true;
        return p.sku.toLowerCase().includes(needle) || p.name.toLowerCase().includes(needle);
      }),
    };
  }, [family, initial, needle]);

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
    </div>
  );
}
