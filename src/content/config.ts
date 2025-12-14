import { defineCollection, z } from "astro:content";

const apps = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    short_description: z.string(),
    long_description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(["live", "coming-soon"]).default("coming-soon"),
    url: z.string().url().optional(),
    repo_url: z.string().url().optional(),
    icon: z.string().optional(),
  }),
});

const ebooks = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    language: z.string().default("en"),
    cover_image: z.string().optional(),
    download_url: z.string().optional(),
    status: z.enum(["free", "coming-soon"]).default("coming-soon"),
  }),
});

const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { apps, ebooks, pages, blog };
