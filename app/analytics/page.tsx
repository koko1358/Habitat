import { EmptyState } from "@/components/shared/empty-state";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <EmptyState
        icon="📊"
        title="Coming up next"
        description="Analytics is being built after the core dashboard, habits, and history are solid. Charts and trends will land here."
      />
    </div>
  );
}
