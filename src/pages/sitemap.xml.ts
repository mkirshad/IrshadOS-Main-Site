import { getCollection } from "astro:content";

export const prerender = true;

function toUrlXml(loc: string) {
  const escaped = loc
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

  return `<url><loc>${escaped}</loc></url>`;
}

export async function GET({ site }: { site?: URL }) {
  const base = site ?? new URL("https://irshados.com");

  const pages = [
    "/",
    "/apps",
    "/ebooks",
    "/awareness",
    "/abdalians-cooperative-housing-society-lahore",
    "/blog",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((p) => new URL(p, base).toString());

  const apps = (await getCollection("apps")).map((e) => new URL(`/apps/${e.slug}`, base).toString());
  const ebooks = (await getCollection("ebooks")).map((e) =>
    new URL(`/ebooks/${e.slug}`, base).toString(),
  );
  const blog = (await getCollection("blog")).map((e) => new URL(`/blog/${e.slug}`, base).toString());

  const urls = Array.from(new Set([...pages, ...apps, ...ebooks, ...blog]));
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(toUrlXml).join("") +
    `</urlset>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
