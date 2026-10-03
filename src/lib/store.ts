import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildSeedStore } from "./seed";
import type { PlantStore } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "plant-store.json");

let queue: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStoreUnlocked(): Promise<PlantStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as PlantStore;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      const seed = buildSeedStore();
      await persistUnlocked(seed);
      return seed;
    }
    throw err;
  }
}

async function persistUnlocked(store: PlantStore) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, STORE_PATH);
}

export function readStore() {
  return serial(readStoreUnlocked);
}

export function writeStore(store: PlantStore) {
  return serial(async () => {
    await persistUnlocked(store);
    return store;
  });
}

export function updateStore(mutator: (store: PlantStore) => PlantStore) {
  return serial(async () => {
    const current = await readStoreUnlocked();
    const next = mutator(current);
    await persistUnlocked(next);
    return next;
  });
}

export function resetStore() {
  return serial(async () => {
    const seed = buildSeedStore();
    await persistUnlocked(seed);
    return seed;
  });
}

export function nextId(prefix: string, existing: { id: string }[]) {
  const nums = existing
    .map((row) => Number.parseInt(row.id.replace(/\D/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `${prefix}-${max + 1}`;
}
