import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin file-tracing to this project (a parent lockfile exists one level up).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
