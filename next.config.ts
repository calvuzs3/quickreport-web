import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker multi-stage build
  output: "standalone",
};

export default nextConfig;