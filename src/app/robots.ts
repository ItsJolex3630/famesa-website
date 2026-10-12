import type { MetadataRoute } from "next";
import { CONTACT } from "@/lib/contact-data";

export default function robots(): MetadataRoute.Robots {
  const base = CONTACT.siteUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
