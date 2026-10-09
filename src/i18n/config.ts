export const DEFAULT_LOCALE = 'en' as const;

export const LOCALES = ['en', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];

/** Locales that are fully indexable in search engines */
export const INDEXABLE_LOCALES = ['en', 'zh'] as const;
export type IndexableLocale = (typeof INDEXABLE_LOCALES)[number];

export function isIndexableLocale(locale: string): boolean {
  return (INDEXABLE_LOCALES as readonly string[]).includes(locale);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export const LOCALE_OG_MAP: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
};
