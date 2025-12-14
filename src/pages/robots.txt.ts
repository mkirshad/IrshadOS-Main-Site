export const prerender = true;

export function GET({ site }: { site?: URL }) {
  const base = site ?? new URL("https://irshados.com");
  const sitemapUrl = new URL("/sitemap.xml", base).toString();

  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

