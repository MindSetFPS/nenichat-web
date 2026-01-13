import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      new URL("https://placehold.co/**"),
    ],
  },
};

export default nextConfig;
