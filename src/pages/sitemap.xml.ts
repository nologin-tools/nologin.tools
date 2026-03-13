import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getApprovedTools } from '../data/loader';
import {
  buildBlogTranslationMap,
  expandToAllLocales,
  generateHreflangLinks,
  type SitemapPage,
} from '../lib/sitemap';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') || 'https://nologin.tools';
  const approvedTools = getApprovedTools();

  const staticLastmod = new Date().toISOString().split('T')[0];

  const homepageLastmod = approvedTools.reduce((latest, t) => {
    if (!t.approvedAt) return latest;
    const d = new Date(t.approvedAt).toISOString().split('T')[0];
    return d > latest ? d : latest;
  }, staticLastmod);

  const staticPages: SitemapPage[] = [
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: homepageLastmod },
    { url: '/about', priority: '0.5', changefreq: 'monthly', lastmod: staticLastmod },
    { url: '/badge', priority: '0.6', changefreq: 'monthly', lastmod: staticLastmod },
    { url: '/submit', priority: '0.7', changefreq: 'monthly', lastmod: staticLastmod },
  ];

  const toolPages: SitemapPage[] = approvedTools.map((t) => ({
    url: `/tool/${t.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: t.approvedAt ? new Date(t.approvedAt).toISOString().split('T')[0] : undefined,
  }));

  const badgePages: SitemapPage[] = approvedTools.map((t) => ({
    url: `/badge/${t.slug}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: t.approvedAt ? new Date(t.approvedAt).toISOString().split('T')[0] : undefined,
  }));

  // Blog pages
  const blogPosts = await getCollection('blog');
  const englishPosts = blogPosts.filter((p) => !p.id.includes('/'));
  const blogTranslationMap = buildBlogTranslationMap(blogPosts);

  const blogListPage: SitemapPage[] = [
    { url: '/blog', priority: '0.8', changefreq: 'daily', lastmod: staticLastmod },
  ];

  const blogPostPages: SitemapPage[] = englishPosts.map((post) => ({
    url: `/blog/${post.id}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: (post.data.updatedAt || post.data.publishedAt).toISOString().split('T')[0],
    isBlogPost: true,
  }));

  // Expand all pages to multi-locale entries
  const allPages = [
    ...staticPages,
    ...toolPages,
    ...badgePages,
    ...blogListPage,
  ];
  const allEntries = [
    ...expandToAllLocales(allPages),
    ...expandToAllLocales(blogPostPages, blogTranslationMap),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.url}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${generateHreflangLinks(entry.englishPath, siteUrl, entry.availableLocales)}
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
