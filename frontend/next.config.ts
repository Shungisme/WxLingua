import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost", port: "3000" }],
  },
};

export default nextConfig;
