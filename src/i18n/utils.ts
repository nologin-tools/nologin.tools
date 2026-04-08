import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';
import en from './en.json';

type TranslationDict = Record<string, string>;

const translations: Record<Locale, TranslationDict> = {
  en,
} as Record<Locale, TranslationDict>;

// Lazy-load non-English translations
const loaders: Partial<Record<Locale, () => Promise<{ default: TranslationDict }>>> = {
  zh: () => import('./zh.json'),
  ja: () => import('./ja.json'),
  ko: () => import('./ko.json'),
  es: () => import('./es.json'),
  fr: () => import('./fr.json'),
  de: () => import('./de.json'),
  pt: () => import('./pt.json'),
};

const loadPromises = new Map<Locale, Promise<void>>();

async function ensureLoaded(locale: Locale): Promise<void> {
  if (translations[locale]) return;
  if (!loadPromises.has(locale)) {
    const loader = loaders[locale];
    if (!loader) return;
    loadPromises.set(
      locale,
      loader().then((mod) => {
        translations[locale] = mod.default;
      }).catch(() => {
        // Fallback: use empty dict, will fall through to English
        translations[locale] = {};
      })
    );
  }
  await loadPromises.get(locale);
}

/**
 * Synchronous translation lookup.
 * For non-English locales, call `await loadTranslations(locale)` first.
 * Falls back to English if key not found in target locale.
 * Supports {placeholder} interpolation.
 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const dict = translations[locale];
  let value = dict?.[key] ?? en[key as keyof typeof en] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}

/**
 * Pre-load translations for a locale. Call in page frontmatter.
 */
export async function loadTranslations(locale: Locale): Promise<void> {
  if (locale === DEFAULT_LOCALE) return;
  await ensureLoaded(locale);
}

/**
 * Extract locale from URL pathname.
 * `/zh/tool/slug` → 'zh', `/tool/slug` → 'en'
 */
export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && (LOCALES as readonly string[]).includes(first) && first !== DEFAULT_LOCALE) {
    return first as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Generate a localized path.
 * Default locale (en) gets no prefix: `/tool/slug`
 * Other locales get prefix: `/zh/tool/slug`
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) {
    return cleanPath;
  }
  // Avoid trailing slash: /zh/ → /zh
  const localized = `/${locale}${cleanPath}`;
  return localized.endsWith('/') && localized.length > 1 ? localized.slice(0, -1) : localized;
}

/**
 * Remove locale prefix from path.
 * `/zh/tool/slug` → `/tool/slug`
 * `/tool/slug` → `/tool/slug`
 */
export function getPathWithoutLocale(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const first = segments[0];
  if (first && (LOCALES as readonly string[]).includes(first) && first !== DEFAULT_LOCALE) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return path;
}
