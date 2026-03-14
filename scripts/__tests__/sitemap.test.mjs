import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Since src/lib/sitemap.ts uses TypeScript and Astro-style imports,
// we reimplement the core functions in pure JS for testability.

const DEFAULT_LOCALE = 'en';
const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

function getLocalizedPath(path, locale) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return cleanPath;
  return `/${locale}${cleanPath}`;
}

// --- buildBlogTranslationMap ---
function buildBlogTranslationMap(posts) {
  const map = new Map();
  for (const post of posts) {
    const isTranslation = post.id.includes('/');
    if (!isTranslation) {
      const slug = post.id;
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug).add('en');
    } else {
      const slug = post.data.originalSlug || post.id.split('/').pop();
      const locale = post.data.locale || post.id.split('/')[0];
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug).add(locale);
      map.get(slug).add('en');
    }
  }
  return map;
}

// --- expandToAllLocales ---
function expandToAllLocales(pages, blogTranslationMap) {
  const entries = [];
  for (const page of pages) {
    if (page.isBlogPost && blogTranslationMap) {
      const slug = page.url.replace(/^\/blog\//, '');
      const availableLocales = blogTranslationMap.get(slug) || new Set(['en']);
      for (const locale of LOCALES) {
        if (!availableLocales.has(locale)) continue;
        entries.push({
          url: getLocalizedPath(page.url, locale),
          priority: page.priority,
          changefreq: page.changefreq,
          lastmod: page.lastmod,
          englishPath: page.url,
          availableLocales,
          imageUrl: page.imageUrl,
        });
      }
    } else {
      for (const locale of LOCALES) {
        entries.push({
          url: getLocalizedPath(page.url, locale),
          priority: page.priority,
          changefreq: page.changefreq,
          lastmod: page.lastmod,
          englishPath: page.url,
          imageUrl: page.imageUrl,
        });
      }
    }
  }
  return entries;
}

// --- generateHreflangLinks ---
function generateHreflangLinks(path, siteUrl, availableLocales) {
  const locales = availableLocales
    ? LOCALES.filter((l) => availableLocales.has(l))
    : [...LOCALES];

  const links = locales.map((locale) => {
    const href = `${siteUrl}${getLocalizedPath(path, locale)}`;
    return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href}"/>`;
  });

  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${getLocalizedPath(path, DEFAULT_LOCALE)}"/>`
  );

  return links.join('\n');
}

// ===================== TESTS =====================

describe('buildBlogTranslationMap', () => {
  it('returns empty map for empty input', () => {
    const result = buildBlogTranslationMap([]);
    assert.equal(result.size, 0);
  });

  it('maps English post to Set containing en', () => {
    const posts = [{ id: 'welcome', data: {} }];
    const result = buildBlogTranslationMap(posts);
    assert.equal(result.size, 1);
    assert.deepEqual(result.get('welcome'), new Set(['en']));
  });

  it('maps translated post with originalSlug', () => {
    const posts = [
      { id: 'welcome', data: {} },
      { id: 'zh/welcome', data: { locale: 'zh', originalSlug: 'welcome' } },
    ];
    const result = buildBlogTranslationMap(posts);
    assert.equal(result.size, 1);
    assert.deepEqual(result.get('welcome'), new Set(['en', 'zh']));
  });

  it('maps translated post without originalSlug (derives from id)', () => {
    const posts = [
      { id: 'hello-world', data: {} },
      { id: 'ja/hello-world', data: { locale: 'ja' } },
    ];
    const result = buildBlogTranslationMap(posts);
    assert.deepEqual(result.get('hello-world'), new Set(['en', 'ja']));
  });

  it('merges multiple locale translations for same slug', () => {
    const posts = [
      { id: 'welcome', data: {} },
      { id: 'zh/welcome', data: { locale: 'zh', originalSlug: 'welcome' } },
      { id: 'ja/welcome', data: { locale: 'ja', originalSlug: 'welcome' } },
      { id: 'ko/welcome', data: { locale: 'ko', originalSlug: 'welcome' } },
    ];
    const result = buildBlogTranslationMap(posts);
    assert.equal(result.size, 1);
    assert.deepEqual(result.get('welcome'), new Set(['en', 'zh', 'ja', 'ko']));
  });

  it('handles translated post even if English post is missing', () => {
    const posts = [
      { id: 'zh/orphan-post', data: { locale: 'zh', originalSlug: 'orphan-post' } },
    ];
    const result = buildBlogTranslationMap(posts);
    assert.deepEqual(result.get('orphan-post'), new Set(['en', 'zh']));
  });

  it('handles multiple distinct blog posts', () => {
    const posts = [
      { id: 'post-a', data: {} },
      { id: 'post-b', data: {} },
      { id: 'zh/post-a', data: { locale: 'zh', originalSlug: 'post-a' } },
    ];
    const result = buildBlogTranslationMap(posts);
    assert.equal(result.size, 2);
    assert.deepEqual(result.get('post-a'), new Set(['en', 'zh']));
    assert.deepEqual(result.get('post-b'), new Set(['en']));
  });
});

describe('expandToAllLocales', () => {
  it('expands a single non-blog page to 8 locale entries', () => {
    const pages = [{ url: '/about', priority: '0.5', changefreq: 'monthly' }];
    const entries = expandToAllLocales(pages);
    assert.equal(entries.length, 8);
  });

  it('English locale entry has no prefix', () => {
    const pages = [{ url: '/tool/excalidraw-com', priority: '0.8', changefreq: 'weekly' }];
    const entries = expandToAllLocales(pages);
    const en = entries.find((e) => e.url === '/tool/excalidraw-com');
    assert.ok(en);
    assert.equal(en.englishPath, '/tool/excalidraw-com');
  });

  it('non-English locale entry has locale prefix', () => {
    const pages = [{ url: '/tool/excalidraw-com', priority: '0.8', changefreq: 'weekly' }];
    const entries = expandToAllLocales(pages);
    const zh = entries.find((e) => e.url === '/zh/tool/excalidraw-com');
    assert.ok(zh);
    assert.equal(zh.englishPath, '/tool/excalidraw-com');
  });

  it('preserves lastmod in expanded entries', () => {
    const pages = [{ url: '/', priority: '1.0', changefreq: 'daily', lastmod: '2026-01-01' }];
    const entries = expandToAllLocales(pages);
    assert.ok(entries.every((e) => e.lastmod === '2026-01-01'));
  });

  it('blog post with availableLocales expands only to available locales', () => {
    const pages = [
      { url: '/blog/welcome', priority: '0.7', changefreq: 'weekly', isBlogPost: true },
    ];
    const blogMap = new Map([['welcome', new Set(['en', 'zh'])]]);
    const entries = expandToAllLocales(pages, blogMap);
    assert.equal(entries.length, 2);
    const urls = entries.map((e) => e.url);
    assert.ok(urls.includes('/blog/welcome'));
    assert.ok(urls.includes('/zh/blog/welcome'));
  });

  it('blog post not in translation map defaults to en only', () => {
    const pages = [
      { url: '/blog/unknown', priority: '0.7', changefreq: 'weekly', isBlogPost: true },
    ];
    const blogMap = new Map();
    const entries = expandToAllLocales(pages, blogMap);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].url, '/blog/unknown');
  });

  it('blog post entries carry availableLocales for hreflang', () => {
    const pages = [
      { url: '/blog/welcome', priority: '0.7', changefreq: 'weekly', isBlogPost: true },
    ];
    const blogMap = new Map([['welcome', new Set(['en', 'ja'])]]);
    const entries = expandToAllLocales(pages, blogMap);
    assert.equal(entries.length, 2);
    assert.ok(entries[0].availableLocales);
    assert.deepEqual(entries[0].availableLocales, new Set(['en', 'ja']));
  });
});

describe('generateHreflangLinks', () => {
  const siteUrl = 'https://nologin.tools';

  it('generates 8 locale + x-default links by default', () => {
    const result = generateHreflangLinks('/about', siteUrl);
    const lines = result.split('\n');
    assert.equal(lines.length, 9); // 8 locales + x-default
  });

  it('x-default always points to English version', () => {
    const result = generateHreflangLinks('/tool/test', siteUrl);
    assert.ok(result.includes('hreflang="x-default" href="https://nologin.tools/tool/test"'));
  });

  it('English hreflang has no locale prefix', () => {
    const result = generateHreflangLinks('/about', siteUrl);
    assert.ok(result.includes('hreflang="en" href="https://nologin.tools/about"'));
  });

  it('non-English hreflang has locale prefix', () => {
    const result = generateHreflangLinks('/about', siteUrl);
    assert.ok(result.includes('hreflang="zh" href="https://nologin.tools/zh/about"'));
    assert.ok(result.includes('hreflang="ja" href="https://nologin.tools/ja/about"'));
  });

  it('limited availableLocales generates only those + x-default', () => {
    const available = new Set(['en', 'zh']);
    const result = generateHreflangLinks('/blog/welcome', siteUrl, available);
    const lines = result.split('\n');
    assert.equal(lines.length, 3); // en + zh + x-default
    assert.ok(result.includes('hreflang="en"'));
    assert.ok(result.includes('hreflang="zh"'));
    assert.ok(result.includes('hreflang="x-default"'));
    assert.ok(!result.includes('hreflang="ja"'));
  });

  it('root path generates correct hreflang URLs', () => {
    const result = generateHreflangLinks('/', siteUrl);
    assert.ok(result.includes('hreflang="en" href="https://nologin.tools/"'));
    assert.ok(result.includes('hreflang="zh" href="https://nologin.tools/zh/"'));
  });
});

describe('sitemap image extension', () => {
  it('expandToAllLocales passes through imageUrl for non-blog pages', () => {
    const pages = [{ url: '/tool/test', priority: '0.8', changefreq: 'weekly', imageUrl: '/api/og/test' }];
    const entries = expandToAllLocales(pages);
    assert.equal(entries.length, 8);
    assert.ok(entries.every((e) => e.imageUrl === '/api/og/test'));
  });

  it('expandToAllLocales passes through imageUrl for blog posts', () => {
    const pages = [
      { url: '/blog/welcome', priority: '0.7', changefreq: 'weekly', isBlogPost: true, imageUrl: '/blog/images/welcome/hero.jpg' },
    ];
    const blogMap = new Map([['welcome', new Set(['en', 'zh'])]]);
    const entries = expandToAllLocales(pages, blogMap);
    assert.equal(entries.length, 2);
    assert.ok(entries.every((e) => e.imageUrl === '/blog/images/welcome/hero.jpg'));
  });

  it('entries without imageUrl have undefined imageUrl', () => {
    const pages = [{ url: '/about', priority: '0.5', changefreq: 'monthly' }];
    const entries = expandToAllLocales(pages);
    assert.ok(entries.every((e) => e.imageUrl === undefined));
  });
});
