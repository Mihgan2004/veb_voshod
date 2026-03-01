import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "http", hostname: "admin.voshod.shop", pathname: "/assets/**" },
      { protocol: "https", hostname: "admin.voshod.shop", pathname: "/assets/**" },
      { protocol: "http", hostname: "localhost", pathname: "/assets/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/assets/**" },
      // Wildcard для любых Directus хостов (dev/prod)
      { protocol: "http", hostname: "**", pathname: "/assets/**" },
      { protocol: "https", hostname: "**", pathname: "/assets/**" },
    ],
    // Если картинки всё равно не грузятся — раскомментируй:
    // unoptimized: true,
  },
  compress: true,
};

export default withBundleAnalyzer(nextConfig);
