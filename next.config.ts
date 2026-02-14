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
      { protocol: "http", hostname: "admin.voshod.shop" },
      { protocol: "https", hostname: "admin.voshod.shop" },
      // Для теста до настройки DNS — добавь IP сервера или localhost
      { protocol: "http", hostname: "localhost", pathname: "/assets/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/assets/**" },
    ],
  },
  // Оптимизация: compress для gzip/brotli
  compress: true,
};

export default withBundleAnalyzer(nextConfig);
