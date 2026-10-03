import { FaultsDesk } from "@/components/faults-desk";
import { ErrorState } from "@/components/states";
import { loadFaults } from "@/lib/payloads";

export const dynamic = "force-dynamic";

export default async function FaultsPage() {
  let initial;
  try {
    initial = await loadFaults();
  } catch (err) {
    return (
      <ErrorState
        message={err instanceof Error ? err.message : "Faults read failed"}
      />
    );
  }
  return <FaultsDesk initial={initial} />;
}
