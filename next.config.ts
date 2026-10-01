import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Multiple lockfiles exist above this directory; pin the workspace root so
  // Turbopack does not infer the wrong one.
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
