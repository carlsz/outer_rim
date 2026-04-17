import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Native binary packages must run in Node process, not bundled by Turbopack
  serverExternalPackages: ["@resvg/resvg-js"],
};

export default nextConfig;
