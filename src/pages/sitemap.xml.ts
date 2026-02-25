import type { APIRoute } from 'astro';
import { getApprovedTools } from '../data/loader';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') || 'https://nologin.tools';
  const approvedTools = getApprovedTools();

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/badge', priority: '0.6', changefreq: 'monthly' },
    { url: '/submit', priority: '0.7', changefreq: 'monthly' },
  ];

  const toolPages = approvedTools.map((t) => ({
    url: `/tool/${t.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const badgePages = approvedTools.map((t) => ({
    url: `/badge/${t.slug}`,
    priority: '0.6',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...toolPages, ...badgePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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
