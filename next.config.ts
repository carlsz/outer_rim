import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloud Run — produces a self-contained build without full node_modules
  output: "standalone",
};

export default nextConfig;
