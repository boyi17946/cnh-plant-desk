import { CATALOG_MODES, procedureById } from "./knowledge";
import type { AssetFamily, FailureModeRank } from "./types";

const LIVE_TIMEOUT_MS = 2200;

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9/+.-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function rankFromCatalog(
  symptom: string,
  family: AssetFamily,
): FailureModeRank[] {
  const tokens = new Set(tokenize(symptom));
  const scored = CATALOG_MODES.filter((mode) => mode.family === family).map(
    (mode) => {
      let hits = 0;
      for (const kw of mode.keywords) {
        if (tokens.has(kw) || symptom.toLowerCase().includes(kw)) hits += 1;
      }
      const confidence = Math.min(0.97, 0.28 + hits * 0.16);
      return { mode, hits, confidence };
    },
  );

  scored.sort((a, b) => b.hits - a.hits || b.confidence - a.confidence);
  const top = scored.filter((row) => row.hits > 0).slice(0, 4);
  const ranked = (top.length ? top : scored.slice(0, 3)).map((row) => ({
    id: row.mode.id,
    title: row.mode.title,
    confidence: Number(row.confidence.toFixed(2)),
    copy: row.mode.defaultCopy,
    procedureId: row.mode.procedureId,
    partSkus: row.mode.partSkus,
  }));

  return ranked.filter((mode) => procedureById(mode.procedureId));
}

function extractJsonArray(text: string): string[] | null {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.map((item) => String(item));
  } catch {
    return null;
  }
}

async function withTimeout<T>(
  work: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);
  try {
    return await work(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function rewriteWithOpenAI(
  copies: string[],
  signal: AbortSignal,
): Promise<string[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Rewrite each diagnosis blurb for a plant technician. Keep facts. Return a JSON array of strings only. Do not invent parts, steps, or SKUs.",
        },
        {
          role: "user",
          content: JSON.stringify(copies),
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return extractJsonArray(json.choices?.[0]?.message?.content ?? "");
}

async function rewriteWithAnthropic(
  copies: string[],
  signal: AbortSignal,
): Promise<string[] | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 400,
      temperature: 0.2,
      system:
        "Rewrite each diagnosis blurb for a plant technician. Keep facts. Return a JSON array of strings only. Do not invent parts, steps, or SKUs.",
      messages: [{ role: "user", content: JSON.stringify(copies) }],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  return extractJsonArray(text);
}

async function maybeRewriteCopy(copies: string[]): Promise<{
  copies: string[];
  usedLive: boolean;
}> {
  const hasKey = Boolean(
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  );
  if (!hasKey) return { copies, usedLive: false };

  try {
    const rewritten = await withTimeout(async (signal) => {
      if (process.env.OPENAI_API_KEY) {
        return rewriteWithOpenAI(copies, signal);
      }
      return rewriteWithAnthropic(copies, signal);
    });
    if (rewritten && rewritten.length === copies.length) {
      return { copies: rewritten, usedLive: true };
    }
  } catch {
    // Catalog copy is the fallback. Live models never own procedures or SKUs.
  }
  return { copies, usedLive: false };
}

export async function diagnoseFault(symptom: string, family: AssetFamily) {
  const ranked = rankFromCatalog(symptom, family);
  const { copies, usedLive } = await maybeRewriteCopy(
    ranked.map((mode) => mode.copy),
  );
  const modes = ranked.map((mode, i) => ({
    ...mode,
    copy: copies[i] ?? mode.copy,
  }));
  return {
    rankedAt: new Date().toISOString(),
    source: usedLive ? ("catalog+live-copy" as const) : ("catalog" as const),
    modes,
  };
}
