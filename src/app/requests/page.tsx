import { Suspense } from "react";
import { RequestsContent } from "./requests-content";

export default function ServiceRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
          Loading…
        </div>
      }
    >
      <RequestsContent />
    </Suspense>
  );
}
