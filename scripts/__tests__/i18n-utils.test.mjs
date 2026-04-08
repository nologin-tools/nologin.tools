import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Since the i18n utils use TypeScript and Astro imports, we test the logic
// by reimplementing the core functions in pure JS for testability.

const DEFAULT_LOCALE = 'en';
const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

// --- t() ---
function t(locale, key, params, translations) {
  const en = translations.en || {};
  const dict = translations[locale] || {};
  let value = dict[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}

// --- getLocaleFromUrl() ---
function getLocaleFromUrl(urlStr) {
  let pathname;
  try {
    pathname = new URL(urlStr).pathname;
  } catch {
    pathname = urlStr;
  }
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && LOCALES.includes(first) && first !== DEFAULT_LOCALE) {
    return first;
  }
  return DEFAULT_LOCALE;
}

// --- getLocalizedPath() ---
function getLocalizedPath(path, locale) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) {
    return cleanPath;
  }
  // Avoid trailing slash: /zh/ → /zh
  const localized = `/${locale}${cleanPath}`;
  return localized.endsWith('/') && localized.length > 1 ? localized.slice(0, -1) : localized;
}

// --- getPathWithoutLocale() ---
function getPathWithoutLocale(path) {
  const segments = path.split('/').filter(Boolean);
  const first = segments[0];
  if (first && LOCALES.includes(first) && first !== DEFAULT_LOCALE) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return path;
}

// === Tests ===

describe('t() — translation lookup', () => {
  const translations = {
    en: {
      'nav.tools': 'Tools',
      'home.toolsVerified': '{count} Tools Verified',
      'common.home': 'Home',
    },
    zh: {
      'nav.tools': '工具',
      'home.toolsVerified': '{count} 个工具已验证',
    },
  };

  it('returns English translation for locale=en', () => {
    assert.equal(t('en', 'nav.tools', undefined, translations), 'Tools');
  });

  it('returns translated string for non-English locale', () => {
    assert.equal(t('zh', 'nav.tools', undefined, translations), '工具');
  });

  it('falls back to English when key not in target locale', () => {
    assert.equal(t('zh', 'common.home', undefined, translations), 'Home');
  });

  it('returns key itself when not found in any locale', () => {
    assert.equal(t('en', 'nonexistent.key', undefined, translations), 'nonexistent.key');
  });

  it('handles parameter interpolation', () => {
    assert.equal(
      t('en', 'home.toolsVerified', { count: 42 }, translations),
      '42 Tools Verified'
    );
  });

  it('handles parameter interpolation in translated string', () => {
    assert.equal(
      t('zh', 'home.toolsVerified', { count: 42 }, translations),
      '42 个工具已验证'
    );
  });

  it('handles multiple occurrences of same placeholder', () => {
    const trans = {
      en: { 'test': '{n} of {n}' },
    };
    assert.equal(t('en', 'test', { n: 5 }, trans), '5 of 5');
  });

  it('falls back to English for empty locale dict', () => {
    assert.equal(t('ja', 'nav.tools', undefined, translations), 'Tools');
  });
});

describe('getLocaleFromUrl()', () => {
  it('returns en for root path', () => {
    assert.equal(getLocaleFromUrl('/'), 'en');
  });

  it('returns en for English tool path', () => {
    assert.equal(getLocaleFromUrl('/tool/excalidraw-com'), 'en');
  });

  it('extracts zh from /zh/tool/slug', () => {
    assert.equal(getLocaleFromUrl('/zh/tool/excalidraw-com'), 'zh');
  });

  it('extracts ja from /ja/', () => {
    assert.equal(getLocaleFromUrl('/ja/'), 'ja');
  });

  it('extracts ko from /ko/about', () => {
    assert.equal(getLocaleFromUrl('/ko/about'), 'ko');
  });

  it('returns en for invalid locale prefix', () => {
    assert.equal(getLocaleFromUrl('/xx/tool/slug'), 'en');
  });

  it('returns en for paths starting with en (no redirect for default)', () => {
    // "en" is the default locale, should not be treated as a prefix
    assert.equal(getLocaleFromUrl('/en/about'), 'en');
  });

  it('handles full URLs', () => {
    assert.equal(getLocaleFromUrl('https://nologin.tools/zh/badge/test'), 'zh');
  });

  it('returns en for full URL without locale', () => {
    assert.equal(getLocaleFromUrl('https://nologin.tools/tool/test'), 'en');
  });
});

describe('getLocalizedPath()', () => {
  it('returns same path for default locale (en)', () => {
    assert.equal(getLocalizedPath('/tool/slug', 'en'), '/tool/slug');
  });

  it('adds locale prefix for non-default locale', () => {
    assert.equal(getLocalizedPath('/tool/slug', 'zh'), '/zh/tool/slug');
  });

  it('handles root path for non-default locale', () => {
    assert.equal(getLocalizedPath('/', 'ja'), '/ja');
  });

  it('handles root path for default locale', () => {
    assert.equal(getLocalizedPath('/', 'en'), '/');
  });

  it('adds leading slash if missing', () => {
    assert.equal(getLocalizedPath('about', 'ko'), '/ko/about');
  });

  it('adds leading slash for default locale if missing', () => {
    assert.equal(getLocalizedPath('about', 'en'), '/about');
  });
});

describe('getPathWithoutLocale()', () => {
  it('removes locale prefix', () => {
    assert.equal(getPathWithoutLocale('/zh/tool/slug'), '/tool/slug');
  });

  it('returns path unchanged when no locale prefix', () => {
    assert.equal(getPathWithoutLocale('/tool/slug'), '/tool/slug');
  });

  it('handles root locale path', () => {
    assert.equal(getPathWithoutLocale('/zh/'), '/');
  });

  it('returns root path unchanged', () => {
    assert.equal(getPathWithoutLocale('/'), '/');
  });

  it('does not strip invalid locale prefixes', () => {
    assert.equal(getPathWithoutLocale('/xx/about'), '/xx/about');
  });

  it('does not strip default locale prefix', () => {
    // "en" paths should keep as-is since en is never used as prefix
    assert.equal(getPathWithoutLocale('/en/about'), '/en/about');
  });
});
