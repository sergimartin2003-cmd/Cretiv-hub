import type { NextConfig } from "next";

// NEXT_PUBLIC_BASE_PATH is set in the GitHub Pages workflow (/Cretiv-hub)
// On Vercel or other hosts, leave it unset (no basePath needed)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
