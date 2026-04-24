import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(__filename);

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
