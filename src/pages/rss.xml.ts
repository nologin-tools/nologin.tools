import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function toRFC822(date: Date): string {
  return date.toUTCString();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') || 'https://nologin.tools';

  const allPosts = await getCollection('blog');
  const englishPosts = allPosts
    .filter((p) => !p.id.includes('/'))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = englishPosts
    .map((post) => {
      const link = escapeXml(`${siteUrl}/blog/${post.id}`);
      const enclosure = post.data.heroImageQuery
        ? `\n      <enclosure url="${escapeXml(`${siteUrl}/blog/images/${post.id}/hero.jpg`)}" length="0" type="image/jpeg" />`
        : '';
      const categories = (post.data.tags || [])
        .map((tag: string) => `\n      <category>${escapeXml(tag)}</category>`)
        .join('');
      const author = post.data.author ? `\n      <dc:creator>${escapeXml(post.data.author)}</dc:creator>` : `\n      <dc:creator>nologin.tools</dc:creator>`;
      const rawLink = `${siteUrl}/blog/${post.id}`;
      const contentEncoded = `\n      <content:encoded><![CDATA[<p>${post.data.description}</p><p><a href="${rawLink}">Read more on nologin.tools</a></p>]]></content:encoded>`;
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${toRFC822(post.data.publishedAt)}</pubDate>
      <guid>${link}</guid>${enclosure}${author}${categories}${contentEncoded}
    </item>`;
    })
    .join('\n');

  const lastBuildDate = englishPosts.length > 0 ? toRFC822(englishPosts[0].data.publishedAt) : toRFC822(new Date());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>nologin.tools Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Privacy-friendly tools that work without login — reviews, guides, and updates.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
