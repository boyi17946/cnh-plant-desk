import { ErrorState } from "@/components/states";
import { WorkOrderBoard } from "@/components/work-order-board";
import { loadWorkOrders } from "@/lib/payloads";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
  let initial;
  try {
    initial = await loadWorkOrders();
  } catch (err) {
    return (
      <ErrorState
        message={err instanceof Error ? err.message : "Work orders read failed"}
      />
    );
  }
  return <WorkOrderBoard initial={initial} />;
}
