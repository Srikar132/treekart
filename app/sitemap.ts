import { MetadataRoute } from "next";
import { getAvailableTrees } from "@/actions/tree.actions";
import { getMangoProducts } from "@/actions/products.actions";
import { getBlogs } from "@/actions/blog.actions";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  // Static routes — ordered by SEO priority
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/rent`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/store`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic tree routes
  const { trees } = await getAvailableTrees({
    limit: 1000,
    filters: { status: ["available", "rented"] },
  });
  const treeRoutes: MetadataRoute.Sitemap = trees.map((tree) => ({
    url: `${base}/trees/${tree.id}`,
    lastModified: new Date(tree.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic product routes
  const { products } = await getMangoProducts({ limit: 1000 });
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/store/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await getBlogs(1, 1000);
    blogRoutes = posts
      .filter((post) => post.published_at)
      .map((post) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.published_at!),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
  } catch {
    // Blog fetch failure must not break the sitemap
  }

  return [...staticRoutes, ...treeRoutes, ...productRoutes, ...blogRoutes];
}
