import { dashboardPayload, fail, json } from "@/lib/http";
import { readStore, resetStore } from "@/lib/store";

export async function GET() {
  try {
    const store = await readStore();
    return json(dashboardPayload(store));
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Store read failed", 503);
  }
}

export async function POST() {
  try {
    const store = await resetStore();
    return json({ reset: true, dashboard: dashboardPayload(store) });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Reset failed", 503);
  }
}
