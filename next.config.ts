import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "http", hostname: "admin.voshod.shop" },
      { protocol: "https", hostname: "admin.voshod.shop" },
    ],
  },
};

export default nextConfig;
