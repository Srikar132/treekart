import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  allowedDevOrigins: ['192.168.1.9'],

  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      }
    ],
  },
};

export default nextConfig;
