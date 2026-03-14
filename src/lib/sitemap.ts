import { LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { getLocalizedPath } from '../i18n/utils';

export interface SitemapPage {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
  /** If true, this is a blog post page (locale availability may be limited) */
  isBlogPost?: boolean;
  /** Optional image URL for image sitemap extension */
  imageUrl?: string;
}

export interface SitemapEntry {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
  /** The English path (used for hreflang generation) */
  englishPath: string;
  /** Available locales for hreflang (undefined = all locales) */
  availableLocales?: Set<Locale>;
  /** Optional image URL for image sitemap extension */
  imageUrl?: string;
}

/**
 * Build a translation map from blog collection entries.
 * Returns: originalSlug → Set<Locale> (always includes 'en' for English posts)
 */
export function buildBlogTranslationMap(
  posts: { id: string; data: { locale?: string; originalSlug?: string } }[]
): Map<string, Set<Locale>> {
  const map = new Map<string, Set<Locale>>();

  for (const post of posts) {
    const isTranslation = post.id.includes('/');

    if (!isTranslation) {
      // English post: id is the slug (e.g. "welcome")
      const slug = post.id;
      if (!map.has(slug)) {
        map.set(slug, new Set());
      }
      map.get(slug)!.add('en' as Locale);
    } else {
      // Translated post: use originalSlug or derive from id
      const slug = post.data.originalSlug || post.id.split('/').pop()!;
      const locale = (post.data.locale || post.id.split('/')[0]) as Locale;
      if (!map.has(slug)) {
        map.set(slug, new Set());
      }
      map.get(slug)!.add(locale);
      // Ensure English is always included
      map.get(slug)!.add('en' as Locale);
    }
  }

  return map;
}

/**
 * Expand English-only pages to all locale variants.
 * - Non-blog pages: expand to all LOCALES
 * - Blog posts: expand only to locales present in blogTranslationMap
 */
export function expandToAllLocales(
  pages: SitemapPage[],
  blogTranslationMap?: Map<string, Set<Locale>>
): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  for (const page of pages) {
    if (page.isBlogPost && blogTranslationMap) {
      // Extract slug from /blog/{slug}
      const slug = page.url.replace(/^\/blog\//, '');
      const availableLocales = blogTranslationMap.get(slug) || new Set(['en' as Locale]);

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
      // Static/tool/badge/blog-list pages: all locales
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

/**
 * Generate xhtml:link hreflang elements for a given English path.
 * If availableLocales is provided, only those locales are included.
 * x-default always points to the English version.
 */
export function generateHreflangLinks(
  path: string,
  siteUrl: string,
  availableLocales?: Set<Locale>
): string {
  const locales = availableLocales
    ? LOCALES.filter((l) => availableLocales.has(l))
    : [...LOCALES];

  const links = locales.map((locale) => {
    const href = `${siteUrl}${getLocalizedPath(path, locale)}`;
    return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href}"/>`;
  });

  // x-default always points to English
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${getLocalizedPath(path, DEFAULT_LOCALE)}"/>`
  );

  return links.join('\n');
}
