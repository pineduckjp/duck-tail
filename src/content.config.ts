import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { string } from "astro:schema";

const tail = defineCollection({
  loader: glob({ base: "./src/content", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: string(),
    category: reference("categories").default({
      collection: "categories",
      id: "poem",
    }),
    canonicalUrl: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

const categories = defineCollection({
  loader: file("src/content/categories/categories.yaml"),
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { tail, categories };
