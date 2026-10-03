import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { diagnoseFault } from "@/lib/ai";
import { fail, json, readJson } from "@/lib/http";
import { nextId, readStore, updateStore } from "@/lib/store";
import type { Asset, Fault, FaultSeverity } from "@/lib/types";

function assetMap(assets: Asset[]) {
  return Object.fromEntries(assets.map((a) => [a.id, a]));
}

export async function GET() {
  try {
    const store = await readStore();
    const assets = assetMap(store.assets);
    return json({
      faults: store.faults.map((fault) => ({
        ...fault,
        asset: assets[fault.assetId] ?? null,
      })),
      assets: store.assets,
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Faults read failed", 503);
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let assetId = "";
    let reportedBy = "";
    let shift = "";
    let symptom = "";
    let severity: FaultSeverity = "slow";
    let photoUrl: string | undefined;
    let diagnose = false;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      assetId = String(form.get("assetId") ?? "");
      reportedBy = String(form.get("reportedBy") ?? "");
      shift = String(form.get("shift") ?? "");
      symptom = String(form.get("symptom") ?? "");
      severity = (String(form.get("severity") ?? "slow") as FaultSeverity) || "slow";
      diagnose = String(form.get("diagnose") ?? "") === "true";
      const photo = form.get("photo");
      if (photo instanceof File && photo.size > 0) {
        const uploads = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploads, { recursive: true });
        const ext = path.extname(photo.name) || ".bin";
        const filename = `fault-${Date.now()}${ext}`;
        const buffer = Buffer.from(await photo.arrayBuffer());
        await writeFile(path.join(uploads, filename), buffer);
        photoUrl = `/uploads/${filename}`;
      }
    } else {
      const body = await readJson<{
        assetId?: string;
        reportedBy?: string;
        shift?: string;
        symptom?: string;
        severity?: FaultSeverity;
        diagnose?: boolean;
        photoUrl?: string;
      }>(req as never);
      if (!body) return fail("Invalid JSON");
      assetId = body.assetId ?? "";
      reportedBy = body.reportedBy ?? "";
      shift = body.shift ?? "";
      symptom = body.symptom ?? "";
      severity = body.severity ?? "slow";
      diagnose = Boolean(body.diagnose);
      photoUrl = body.photoUrl;
    }

    if (!assetId || !symptom.trim() || !reportedBy.trim()) {
      return fail("assetId, reportedBy, and symptom are required");
    }
    if (!["stop", "slow", "watch"].includes(severity)) {
      return fail("severity must be stop, slow, or watch");
    }

    const created = await updateStore((store) => {
      const asset = store.assets.find((a) => a.id === assetId);
      if (!asset) {
        throw new Error("Unknown asset");
      }
      const fault: Fault = {
        id: nextId("flt", store.faults),
        assetId,
        reportedBy: reportedBy.trim(),
        shift: shift.trim() || store.meta.shift,
        symptom: symptom.trim(),
        severity,
        status: "open",
        photoUrl,
        createdAt: new Date().toISOString(),
      };
      const nextAssets = store.assets.map((row) => {
        if (row.id !== assetId) return row;
        if (severity === "stop") return { ...row, status: "down" as const };
        if (severity === "slow" && row.status === "running") {
          return { ...row, status: "hold" as const };
        }
        return row;
      });
      return {
        ...store,
        assets: nextAssets,
        faults: [fault, ...store.faults],
      };
    });

    const assets = assetMap(created.assets);
    let fault = created.faults[0];

    if (diagnose) {
      const asset = assets[fault.assetId];
      if (asset) {
        const diagnosis = await diagnoseFault(fault.symptom, asset.family);
        const withDx = await updateStore((store) => ({
          ...store,
          faults: store.faults.map((row) =>
            row.id === fault.id
              ? { ...row, diagnosis, status: "diagnosed" as const }
              : row,
          ),
        }));
        fault = withDx.faults.find((row) => row.id === fault.id) ?? fault;
      }
    }

    return json({ fault: { ...fault, asset: assets[fault.assetId] ?? null } }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fault create failed";
    const status = message === "Unknown asset" ? 400 : 503;
    return fail(message, status);
  }
}
