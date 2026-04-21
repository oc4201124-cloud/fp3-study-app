import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: '/fp3-study-app',
  assetPrefix: '/fp3-study-app',
};

export default nextConfig;
