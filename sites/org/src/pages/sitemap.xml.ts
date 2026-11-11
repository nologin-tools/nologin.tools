import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const reports = await getCollection('reports');
  const latestReportLastmod = reports.reduce((latest, report) => {
    const d = (report.data.updatedAt || report.data.publishedAt).toISOString().split('T')[0];
    return d > latest ? d : latest;
  }, '2026-03-15');
  const site = 'https://nologintools.org';

  const staticPages = [
    { url: '/', changefreq: 'monthly', priority: '1.0', lastmod: latestReportLastmod },
    { url: '/about', changefreq: 'monthly', priority: '0.7', lastmod: '2026-03-15' },
    { url: '/standards', changefreq: 'monthly', priority: '0.9', lastmod: '2026-03-20' },
    { url: '/reports', changefreq: 'weekly', priority: '0.9', lastmod: latestReportLastmod },
  ];

  const reportPages = reports.map((report) => ({
    url: `/reports/${report.id}`,
    changefreq: 'monthly' as const,
    priority: '0.8',
    lastmod: (report.data.updatedAt || report.data.publishedAt).toISOString().split('T')[0],
  }));

  const allPages = [...staticPages, ...reportPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${site}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
