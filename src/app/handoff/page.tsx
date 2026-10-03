import { HandoffDesk } from "@/components/handoff-desk";
import { ErrorState } from "@/components/states";
import { loadHandoff } from "@/lib/payloads";

export const dynamic = "force-dynamic";

export default async function HandoffPage() {
  let initial;
  try {
    initial = await loadHandoff();
  } catch (err) {
    return (
      <ErrorState
        message={err instanceof Error ? err.message : "Handoff read failed"}
      />
    );
  }
  return <HandoffDesk initial={initial} />;
}
