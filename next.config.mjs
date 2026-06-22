import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// This project lives under ~/Desktop, which macOS syncs via iCloud Drive.
// iCloud deletes/moves the build dir's temp files mid-write, corrupting the
// Turbopack dev cache (ENOENT on `_buildManifest.js.tmp.*` / `app-build-manifest.json`).
// A folder ending in `.nosync` is excluded from iCloud sync, while staying inside
// the project so Next's compiled server bundles still resolve node_modules.
// On Vercel/CI we keep the default `.next` (their tooling expects it).
const isCI = process.env.VERCEL || process.env.CI;
const distDir = isCI ? ".next" : ".next.nosync";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir,
  // Pin file-tracing to this project (a parent lockfile exists one level up).
  outputFileTracingRoot: __dirname,
  // Allow product image uploads through server actions.
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
