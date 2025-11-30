import type { NextConfig } from "next";
import { protocol } from "socket.io-client";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ]
  }
};

export default nextConfig;
