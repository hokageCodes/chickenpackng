"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message ?? "";
    // After a new deployment the open page can reference chunks that no longer
    // exist — reload to fetch the current build.
    if (/ChunkLoadError|Loading chunk|dynamically imported module|module script failed|Failed to fetch/i.test(msg)) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle size={22} />
      </span>
      <p className="text-lg font-bold">Something went wrong</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. You can try again or reload the page.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
