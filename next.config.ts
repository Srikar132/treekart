import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },

  // Redirect bare domain → www for canonical consolidation
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "treekart.in" }],
        destination: "https://www.treekart.in/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 1 year, include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Restrict referrer to same-origin for privacy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Minimal permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      // Long-lived caching for static assets
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|webp|svg|woff2|woff|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Allow search engines to index og-image
      {
        source: "/og-image.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
