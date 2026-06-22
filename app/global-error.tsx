"use client";

import { useEffect } from "react";

// Catches unhandled client exceptions at the root (replaces the raw white
// "Application error" screen). Auto-reloads on stale-chunk errors that happen
// after a new deployment.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message ?? "";
    if (/ChunkLoadError|Loading chunk|dynamically imported module|module script failed|Failed to fetch/i.test(msg)) {
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
          color: "#171717",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Something went wrong</p>
          <p style={{ fontSize: 14, color: "#737373", margin: "0 0 20px" }}>
            An unexpected error occurred. Please try again.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                borderRadius: 10,
                background: "#EC6809",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 16px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                borderRadius: 10,
                background: "#fff",
                color: "#171717",
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 16px",
                border: "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
