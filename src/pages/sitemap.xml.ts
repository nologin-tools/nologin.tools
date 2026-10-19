import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getApprovedTools, getAvailableToolLocales } from '../data/loader';
import { TAG_DEFINITIONS, categoryToSlug, TAG_PAGES_ALLOWLIST, tagValueToSlug } from '../lib/tags';
import {
  buildBlogTranslationMap,
  expandToAllLocales,
  generateHreflangLinks,
  type SitemapPage,
} from '../lib/sitemap';
import { getAlternativeTargets } from '../lib/alternatives';
import { getComparisonPairs } from '../lib/comparisons';
import { getWorkflowRecipes } from '../lib/workflows';
import { CURATED_COLLECTIONS } from '../lib/collections';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') || 'https://nologin.tools';
  const approvedTools = getApprovedTools();

  const homepageLastmod = approvedTools.reduce((latest, t) => {
    if (!t.approvedAt) return latest;
    const d = new Date(t.approvedAt).toISOString().split('T')[0];
    return d > latest ? d : latest;
  }, '2026-01-01');

  function getLatestToolDate(predicate: (t: (typeof approvedTools)[number]) => boolean): string {
    let latest = '';
    for (const t of approvedTools) {
      if (!t.approvedAt || !predicate(t)) continue;
      const d = new Date(t.approvedAt).toISOString().split('T')[0];
      if (d > latest) latest = d;
    }
    return latest || homepageLastmod;
  }

  const staticPages: SitemapPage[] = [
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: homepageLastmod },
    { url: '/finder', priority: '0.8', changefreq: 'daily', lastmod: homepageLastmod },
    { url: '/lab', priority: '0.8', changefreq: 'daily', lastmod: homepageLastmod },
    { url: '/extension', priority: '0.8', changefreq: 'weekly', lastmod: homepageLastmod },
    { url: '/developers', priority: '0.7', changefreq: 'weekly', lastmod: homepageLastmod },
    { url: '/about', priority: '0.5', changefreq: 'monthly', lastmod: homepageLastmod },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly', lastmod: homepageLastmod },
    { url: '/badge', priority: '0.6', changefreq: 'monthly', lastmod: homepageLastmod },
    { url: '/submit', priority: '0.7', changefreq: 'monthly', lastmod: homepageLastmod },
  ];

  const categoryDef = TAG_DEFINITIONS.find((d) => d.key === 'category');
  const categoryPages: SitemapPage[] = (categoryDef?.values ?? []).map((cat) => ({
    url: `/category/${categoryToSlug(cat)}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: getLatestToolDate((t) => t.tags.some((tag) => tag.tagKey === 'category' && tag.tagValue === cat)),
  }));

  const tagPages: SitemapPage[] = TAG_PAGES_ALLOWLIST.map((item) => ({
    url: `/tag/${tagValueToSlug(item.value)}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: getLatestToolDate((t) => t.tags.some((tag) => tag.tagKey === item.key && tag.tagValue === item.value)),
  }));

  const alternativePages: SitemapPage[] = getAlternativeTargets().map((alt) => ({
    url: `/alternative/${alt.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: homepageLastmod,
  }));

  const comparisonPages: SitemapPage[] = getComparisonPairs().map((pair) => ({
    url: `/compare/${pair.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: homepageLastmod,
  }));

  const workflowPages: SitemapPage[] = getWorkflowRecipes().map((workflow) => ({
    url: `/workflow/${workflow.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: homepageLastmod,
  }));

  const collectionPages: SitemapPage[] = CURATED_COLLECTIONS.map((col) => ({
    url: `/collection/${col.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: homepageLastmod,
  }));

  const toolPages: SitemapPage[] = approvedTools.map((t) => ({
    url: `/tool/${t.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: t.approvedAt ? new Date(t.approvedAt).toISOString().split('T')[0] : undefined,
    availableLocales: getAvailableToolLocales(t),
    imageUrl: `/api/og/${t.slug}`,
  }));

  // Blog pages
  const blogPosts = await getCollection('blog');
  const englishPosts = blogPosts.filter((p) => !p.id.includes('/'));
  const blogTranslationMap = buildBlogTranslationMap(blogPosts);

  const latestBlogLastmod = englishPosts.reduce((latest, p) => {
    const d = (p.data.updatedAt || p.data.publishedAt).toISOString().split('T')[0];
    return d > latest ? d : latest;
  }, '2026-01-01');

  const blogListPage: SitemapPage[] = [
    { url: '/blog', priority: '0.8', changefreq: 'daily', lastmod: latestBlogLastmod },
  ];

  const blogPostPages: SitemapPage[] = englishPosts.map((post) => ({
    url: `/blog/${post.id}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: (post.data.updatedAt || post.data.publishedAt).toISOString().split('T')[0],
    isBlogPost: true,
    imageUrl: post.data.heroImageQuery ? `/blog/images/${post.id}/hero.jpg` : undefined,
  }));

  // Blog tag pages
  const blogTagLastmodMap = new Map<string, string>();
  for (const post of englishPosts) {
    const postDate = (post.data.updatedAt || post.data.publishedAt).toISOString().split('T')[0];
    for (const rawTag of post.data.tags) {
      const tag = rawTag.toLowerCase();
      const prev = blogTagLastmodMap.get(tag) || '';
      if (postDate > prev) blogTagLastmodMap.set(tag, postDate);
    }
  }
  const blogTagPages: SitemapPage[] = [...blogTagLastmodMap.entries()].map(([tag, lastmod]) => ({
    url: `/blog/tag/${tag}`,
    priority: '0.5',
    changefreq: 'weekly',
    lastmod,
  }));

  // Expand all pages to multi-locale entries
  const allPages = [
    ...staticPages,
    ...categoryPages,
    ...tagPages,
    ...alternativePages,
    ...comparisonPages,
    ...workflowPages,
    ...collectionPages,
    ...toolPages,
    ...blogListPage,
    ...blogTagPages,
  ];
  const allEntries = [
    ...expandToAllLocales(allPages),
    ...expandToAllLocales(blogPostPages, blogTranslationMap),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.url}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${generateHreflangLinks(entry.englishPath, siteUrl, entry.availableLocales)}${entry.imageUrl ? `\n    <image:image>\n      <image:loc>${siteUrl}${entry.imageUrl}</image:loc>\n    </image:image>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
