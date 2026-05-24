import type { Metadata } from "next";

// ── Site constants ────────────────────────────────────────────────────────────

export const siteConfig = {
  name: "TreeKart",
  url: "https://www.treekart.in",
  description:
    "Rent a real Alphonso mango tree, track its growth, and get fresh organic mangoes delivered to your doorstep.",
  ogImage: "/og-image.png",
  twitter: "@treekart",
  locale: "en_US",
  phone: "+91-7981365932",
  email: "hello@treekart.in",
  socials: {
    facebook: "https://facebook.com/treekart",
    twitter: "https://twitter.com/treekart",
    instagram: "https://instagram.com/treekart",
  },
} as const;

// ── Keyword bank ──────────────────────────────────────────────────────────────

export const baseKeywords = [
  "TreeKart",
  "treekart.in",
  "mango tree rental India",
  "rent a mango tree",
  "Alphonso mango delivery",
  "buy organic mangoes online",
  "fresh mango delivery India",
  "mango tree adoption",
  "heritage orchard India",
  "organic fruit delivery",
];

export const treeKeywords = [
  "rent mango tree",
  "mango tree orchard rental",
  "Alphonso tree adoption India",
  "organic mango harvest",
  "heritage mango orchard",
  "sustainable mango farming",
  "fresh Alphonso mangoes",
  "tree ownership experience",
  "mango tree yield guarantee",
];

export const storeKeywords = [
  "buy Alphonso mangoes online",
  "premium organic mangoes India",
  "fresh mango box delivery",
  "order mangoes online",
  "Ratnagiri Alphonso mangoes",
  "mango gift box",
  "seasonal mango delivery",
  "natural ripened mangoes",
];

export const blogKeywords = [
  "mango farming blog",
  "organic orchard updates",
  "Alphonso harvest season",
  "mango tree care tips",
  "sustainable agriculture India",
  "seasonal fruit farming",
];

// ── Metadata builder ──────────────────────────────────────────────────────────

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /** Published date for article type */
  publishedAt?: string;
  /** Modified date for article type */
  modifiedAt?: string;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  image = siteConfig.ogImage,
  imageAlt,
  type = "website",
  noindex = false,
  publishedAt,
  modifiedAt,
}: BuildMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const resolvedAlt = imageAlt ?? title;
  const allKeywords = [...baseKeywords, ...keywords];

  return {
    title,
    description,
    keywords: allKeywords,
    authors: [{ name: "TreeKart Team" }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: resolvedAlt }],
      locale: siteConfig.locale,
      type,
      ...(type === "article" && publishedAt
        ? { publishedTime: publishedAt, modifiedTime: modifiedAt ?? publishedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

// ── JSON-LD schema builders ───────────────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/logo.webp`,
      width: 200,
      height: 60,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: Object.values(siteConfig.socials),
    foundingDate: "2024",
    description: siteConfig.description,
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/store?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface ProductSchemaOptions {
  name: string;
  description: string;
  images: string[];
  price: number | null;
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  url: string;
  sku?: string;
  brand?: string;
  /** For tree rentals — duration string e.g. "1 Season" */
  rentalDuration?: string;
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

export function buildProductSchema({
  name,
  description,
  images,
  price,
  currency = "INR",
  availability,
  url,
  sku,
  brand = siteConfig.name,
  aggregateRating,
}: ProductSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images,
    url,
    ...(sku ? { sku } : {}),
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "Offer",
      price: price ?? 0,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: { "@type": "Organization", name: siteConfig.name },
      url,
    },
    ...(aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue,
            reviewCount: aggregateRating.reviewCount,
          },
        }
      : {}),
  };
}

interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedAt: string;
  modifiedAt?: string;
  category?: string;
  keywords?: string[];
}

export function buildArticleSchema({
  title,
  description,
  url,
  image,
  author,
  publishedAt,
  modifiedAt,
  category,
  keywords = [],
}: ArticleSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image,
    url,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.webp`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(category ? { articleSection: category } : {}),
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    inLanguage: "en-IN",
  };
}

interface FAQSchemaQuestion {
  q: string;
  a: string;
}

export function buildFAQSchema(questions: FAQSchemaQuestion[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FoodEstablishment"],
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    image: `${siteConfig.url}/og-image.png`,
    priceRange: "₹₹",
    servesCuisine: "Fresh Fruit Delivery",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: Object.values(siteConfig.socials),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  };
}
