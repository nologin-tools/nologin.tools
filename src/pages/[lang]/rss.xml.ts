import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { LOCALES, DEFAULT_LOCALE, LOCALE_LABELS, type Locale } from '../../i18n/config';
import { t, loadTranslations } from '../../i18n/utils';

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

export function getStaticPaths() {
  return LOCALES
    .filter(l => l !== DEFAULT_LOCALE)
    .map(lang => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Locale;
  await loadTranslations(lang);
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') || 'https://nologin.tools';

  const allPosts = await getCollection('blog');
  const localePosts = allPosts
    .filter((p) => p.id.startsWith(`${lang}/`))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  function getPostSlug(postId: string): string {
    return postId.includes('/') ? postId.split('/').slice(1).join('/') : postId;
  }

  const items = localePosts
    .map((post) => {
      const slug = getPostSlug(post.id);
      const link = escapeXml(`${siteUrl}/${lang}/blog/${slug}`);
      const originalSlug = post.data.originalSlug || slug;
      const enclosure = post.data.heroImageQuery
        ? `\n      <enclosure url="${escapeXml(`${siteUrl}/blog/images/${originalSlug}/hero.jpg`)}" length="0" type="image/jpeg" />`
        : '';
      const categories = (post.data.tags || [])
        .map((tag: string) => `\n      <category>${escapeXml(tag)}</category>`)
        .join('');
      const author = post.data.author
        ? `\n      <dc:creator>${escapeXml(post.data.author)}</dc:creator>`
        : `\n      <dc:creator>nologin.tools</dc:creator>`;
      const rawLink = `${siteUrl}/${lang}/blog/${slug}`;
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

  const lastBuildDate = localePosts.length > 0
    ? toRFC822(localePosts[0].data.publishedAt)
    : toRFC822(new Date());

  const localeName = LOCALE_LABELS[lang] || lang;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>nologin.tools Blog (${localeName})</title>
    <link>${siteUrl}/${lang}/blog</link>
    <description>${escapeXml(t(lang, 'blog.description'))}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/${lang}/rss.xml" rel="self" type="application/rss+xml" />
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
