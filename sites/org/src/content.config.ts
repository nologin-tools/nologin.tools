import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('NoLoginTools.org'),
    version: z.string().default('1.0'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    abstract: z.string().optional(),
    tableOfContents: z.boolean().default(true),
  }),
});

export const collections = { reports };
