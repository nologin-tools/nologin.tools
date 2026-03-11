import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getApprovedTools } from '../data/loader';
import { LOCALES, DEFAULT_LOCALE } from '../i18n/config';
import { getLocalizedPath } from '../i18n/utils';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') || 'https://nologin.tools';
  const approvedTools = getApprovedTools();

  const staticLastmod = new Date().toISOString().split('T')[0];

  const homepageLastmod = approvedTools.reduce((latest, t) => {
    if (!t.approvedAt) return latest;
    const d = new Date(t.approvedAt).toISOString().split('T')[0];
    return d > latest ? d : latest;
  }, staticLastmod);

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: homepageLastmod },
    { url: '/about', priority: '0.5', changefreq: 'monthly', lastmod: staticLastmod },
    { url: '/badge', priority: '0.6', changefreq: 'monthly', lastmod: staticLastmod },
    { url: '/submit', priority: '0.7', changefreq: 'monthly', lastmod: staticLastmod },
  ];

  const toolPages = approvedTools.map((t) => ({
    url: `/tool/${t.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: t.approvedAt ? new Date(t.approvedAt).toISOString().split('T')[0] : undefined,
  }));

  const badgePages = approvedTools.map((t) => ({
    url: `/badge/${t.slug}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: t.approvedAt ? new Date(t.approvedAt).toISOString().split('T')[0] : undefined,
  }));

  // Blog pages (only English root-level posts)
  const blogPosts = await getCollection('blog');
  const englishPosts = blogPosts.filter((p) => !p.id.includes('/'));
  const blogListPage = [
    { url: '/blog', priority: '0.8', changefreq: 'daily', lastmod: staticLastmod },
  ];
  const blogPostPages = englishPosts.map((post) => ({
    url: `/blog/${post.id}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: (post.data.updatedAt || post.data.publishedAt).toISOString().split('T')[0],
  }));

  const allPages = [...staticPages, ...toolPages, ...badgePages, ...blogListPage, ...blogPostPages];

  function generateHreflangLinks(path: string): string {
    return LOCALES.map((locale) => {
      const href = `${siteUrl}${getLocalizedPath(path, locale)}`;
      return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href}"/>`;
    }).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${getLocalizedPath(path, DEFAULT_LOCALE)}"/>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${generateHreflangLinks(page.url)}
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
