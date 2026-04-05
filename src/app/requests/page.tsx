import { Suspense } from "react";
import { RequestsContent } from "./requests-content";

export default function ServiceRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <RequestsContent />
    </Suspense>
  );
}
