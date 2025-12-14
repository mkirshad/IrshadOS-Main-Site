import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

const site = process.env.SITE_URL || "https://irshados.com";

export default defineConfig({
  site,
  adapter: cloudflare(),
  trailingSlash: "never",
  session: {
    driver: "memory",
  },
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    mdx(),
  ],
});
