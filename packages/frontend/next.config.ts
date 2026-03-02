import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly set the monorepo root to avoid Turbopack scanning parent directories
  // and warn about additional lockfiles outside the workspace.
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  // Configure for Cloudflare Pages
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
  },
};

export default nextConfig;
