// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Por defecto tapa el pie del sidebar en desarrollo.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
