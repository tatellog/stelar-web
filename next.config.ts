import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `npm run build` emits ./out — deployable to any
  // traditional host (cPanel/FTP) besides Vercel. The whole landing is
  // client-rendered art + a Supabase form, so nothing needs a server.
  output: "export",
  // next/image's optimizer needs a server; on static hosting the images
  // are served as-is (they're already hand-optimized: webp emblems, etc.)
  images: { unoptimized: true },
};

export default nextConfig;
