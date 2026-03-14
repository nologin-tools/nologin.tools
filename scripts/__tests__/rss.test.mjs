import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Reimplement RSS helpers in pure JS for testability

function toRFC822(date) {
  return date.toUTCString();
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRssXml(posts, siteUrl = 'https://nologin.tools') {
  const englishPosts = posts
    .filter((p) => !p.id.includes('/'))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = englishPosts
    .map((post) => {
      const link = escapeXml(`${siteUrl}/blog/${post.id}`);
      const enclosure = post.data.heroImageQuery
        ? `\n      <enclosure url="${escapeXml(`${siteUrl}/blog/images/${post.id}/hero.jpg`)}" length="0" type="image/jpeg" />`
        : '';
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${toRFC822(post.data.publishedAt)}</pubDate>
      <guid>${link}</guid>${enclosure}
    </item>`;
    })
    .join('\n');

  const lastBuildDate = englishPosts.length > 0 ? toRFC822(englishPosts[0].data.publishedAt) : toRFC822(new Date());

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
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
}

// ===================== TESTS =====================

describe('RSS feed generation', () => {
  it('generates valid RSS XML with multiple posts', () => {
    const posts = [
      { id: 'post-a', data: { title: 'Post A', description: 'Desc A', publishedAt: new Date('2026-01-15'), tags: [] } },
      { id: 'post-b', data: { title: 'Post B', description: 'Desc B', publishedAt: new Date('2026-02-01'), tags: [] } },
    ];
    const xml = generateRssXml(posts);
    assert.ok(xml.startsWith('<?xml version="1.0"'));
    assert.ok(xml.includes('<rss version="2.0"'));
    assert.ok(xml.includes('<title>Post A</title>'));
    assert.ok(xml.includes('<title>Post B</title>'));
    assert.ok(xml.includes('</channel>'));
    assert.ok(xml.includes('</rss>'));
  });

  it('sorts posts by date descending', () => {
    const posts = [
      { id: 'older', data: { title: 'Older', description: 'D', publishedAt: new Date('2026-01-01'), tags: [] } },
      { id: 'newer', data: { title: 'Newer', description: 'D', publishedAt: new Date('2026-03-01'), tags: [] } },
    ];
    const xml = generateRssXml(posts);
    const newerIdx = xml.indexOf('<title>Newer</title>');
    const olderIdx = xml.indexOf('<title>Older</title>');
    assert.ok(newerIdx < olderIdx, 'Newer post should appear before older post');
  });

  it('generates RFC 822 date format', () => {
    const date = new Date('2026-03-14T12:00:00Z');
    const rfc822 = toRFC822(date);
    assert.ok(rfc822.includes('2026'), 'Should contain year');
    assert.ok(rfc822.includes('Mar'), 'Should contain month abbreviation');
    assert.ok(rfc822.includes('GMT'), 'Should end with GMT');
  });

  it('only includes English posts, excludes translations', () => {
    const posts = [
      { id: 'welcome', data: { title: 'Welcome', description: 'D', publishedAt: new Date('2026-01-01'), tags: [] } },
      { id: 'zh/welcome', data: { title: 'Welcome ZH', description: 'D', publishedAt: new Date('2026-01-01'), locale: 'zh', tags: [] } },
      { id: 'ja/welcome', data: { title: 'Welcome JA', description: 'D', publishedAt: new Date('2026-01-01'), locale: 'ja', tags: [] } },
    ];
    const xml = generateRssXml(posts);
    assert.ok(xml.includes('<title>Welcome</title>'));
    assert.ok(!xml.includes('<title>Welcome ZH</title>'));
    assert.ok(!xml.includes('<title>Welcome JA</title>'));
  });

  it('generates valid empty feed with no posts', () => {
    const xml = generateRssXml([]);
    assert.ok(xml.includes('<rss version="2.0"'));
    assert.ok(xml.includes('</channel>'));
    assert.ok(xml.includes('</rss>'));
    assert.ok(!xml.includes('<item>'));
  });

  it('includes enclosure for posts with heroImageQuery', () => {
    const posts = [
      { id: 'with-hero', data: { title: 'Hero Post', description: 'D', publishedAt: new Date('2026-01-01'), heroImageQuery: 'privacy tools', tags: [] } },
    ];
    const xml = generateRssXml(posts);
    assert.ok(xml.includes('<enclosure url="https://nologin.tools/blog/images/with-hero/hero.jpg" length="0" type="image/jpeg" />'));
  });

  it('does not include enclosure for posts without heroImageQuery', () => {
    const posts = [
      { id: 'no-hero', data: { title: 'No Hero', description: 'D', publishedAt: new Date('2026-01-01'), tags: [] } },
    ];
    const xml = generateRssXml(posts);
    assert.ok(!xml.includes('<enclosure'));
  });

  it('escapes XML special characters in title and description', () => {
    const posts = [
      { id: 'special', data: { title: 'A & B <test>', description: 'Use "quotes" & \'apostrophes\'', publishedAt: new Date('2026-01-01'), tags: [] } },
    ];
    const xml = generateRssXml(posts);
    assert.ok(xml.includes('A &amp; B &lt;test&gt;'));
    assert.ok(xml.includes('Use &quot;quotes&quot; &amp; &apos;apostrophes&apos;'));
  });

  it('includes atom:link self reference', () => {
    const xml = generateRssXml([]);
    assert.ok(xml.includes('atom:link href="https://nologin.tools/rss.xml" rel="self"'));
  });

  it('includes correct channel link', () => {
    const xml = generateRssXml([]);
    assert.ok(xml.includes('<link>https://nologin.tools/blog</link>'));
  });
});
