import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.prydwen.gg",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
