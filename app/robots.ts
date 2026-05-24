import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/store/", "/trees/", "/blog/", "/rent", "/about", "/faq", "/contact"],
        disallow: [
          "/admin/",
          "/checkout/",
          "/account/",
          "/auth/",
          "/farmer/",
          "/api/",
          "/_next/",
          "/blocked",
        ],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/checkout/",
          "/account/",
          "/auth/",
          "/farmer/",
          "/api/",
          "/_next/",
          "/blocked",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
