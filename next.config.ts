import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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
  async headers() {
    const staticAssetPaths = [
      "/logo/:path*",
      "/brand/:path*",
      "/header/:path*",
      "/assets/:path*",
      "/lookbook/:path*",
      "/video/:path*",
      "/_next/static/:path*",
    ];
    return staticAssetPaths.map((source) => ({
      source,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    }));
  },
};

export default withBundleAnalyzer(nextConfig);
