import { ErrorState } from "@/components/states";
import { ShiftBoard } from "@/components/shift-board";
import { loadDashboard } from "@/lib/payloads";

export const dynamic = "force-dynamic";

export default async function ShiftBoardPage() {
  let initial;
  try {
    initial = await loadDashboard();
  } catch (err) {
    return (
      <ErrorState
        message={err instanceof Error ? err.message : "Store read failed"}
      />
    );
  }
  return <ShiftBoard initial={initial} />;
}
