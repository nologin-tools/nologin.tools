// @ts-check
import { readdirSync, unlinkSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
const REDIRECTS_FILE = resolve(ROOT, 'public/_redirects');

export const REDIRECT_MAP = {
  // PDF
  'edit-pdf-without-adobe-free-no-login': 'edit-pdf-without-installing-anything',
  'convert-pdf-to-word-online-free-no-signup': 'edit-pdf-without-installing-anything',
  'fill-sign-pdf-online-free-no-account': 'edit-pdf-without-installing-anything',
  'free-pdf-editing-online-no-signup': 'edit-pdf-without-installing-anything',

  // Browser leak
  'browser-privacy-audit-free-step-by-step': 'browser-leaking-data-how-to-stop-it',
  'what-your-browser-leaks-free-privacy-tests': 'browser-leaking-data-how-to-stop-it',

  // Open source
  'open-source-browser-tools-no-account': 'open-source-tools-no-login',
  'open-source-digital-rights': 'open-source-tools-no-login',
  'open-source-no-login-tools-you-can-verify': 'open-source-tools-no-login',
  'open-source-tools-cant-track-you': 'open-source-tools-no-login',
  'why-open-source-tools-dont-need-login': 'open-source-tools-no-login',

  // Dark pattern
  'dark-pattern-create-account-to-continue': 'forced-account-creation-dark-pattern',
  'dark-pattern-signup-walls-legal-rights': 'forced-account-creation-dark-pattern',
  'signup-walls-dark-patterns-psychology': 'forced-account-creation-dark-pattern',
  'why-websites-force-account-creation': 'forced-account-creation-dark-pattern',
  'hidden-cost-free-accounts': 'forced-account-creation-dark-pattern',

  // Notion
  'notion-privacy-free-alternatives': 'notion-alternatives-no-login',
  'notion-single-purpose-alternatives': 'notion-alternatives-no-login',

  // Google Docs
  'replace-google-docs-browser-editors-no-account': 'google-docs-alternatives-no-login',

  // Squoosh / image
  'squoosh-free-image-compression-guide': 'squoosh-beats-online-image-compressors',
  'squoosh-vs-tinypng-vs-ezgif-image-tools': 'squoosh-beats-online-image-compressors',
  'compress-convert-resize-images-no-login': 'squoosh-beats-online-image-compressors',
  'png-jpeg-webp-image-optimization-tutorial': 'squoosh-beats-online-image-compressors',

  // WebAssembly
  'webassembly-login-free-tools-better': 'webassembly-no-login-browser-tools',

  // Email privacy
  'browse-web-without-leaving-trace': 'practical-guide-tools-without-email',
  'how-free-online-tools-survive-without-collecting-email': 'practical-guide-tools-without-email',
  'incognito-mode-browser-privacy-what-actually-works': 'practical-guide-tools-without-email',
  'use-tools-without-giving-email': 'practical-guide-tools-without-email',

  // Free vs Paid / SaaS
  'why-saas-tools-dropping-login-walls': 'free-vs-paid-no-login-tools-better',
  'browser-based-tools-privacy-what-they-know': 'free-vs-paid-no-login-tools-better',
  'free-no-login-alternatives-paid-software': 'free-vs-paid-no-login-tools-better',

  // Roundups & Generic 3/5 tools
  'q1-2026-best-no-login-tools-roundup': 'best-browser-only-tools-q1-2026',
  'q1-2026-no-login-tools-that-mattered': 'best-browser-only-tools-q1-2026',
  'q1-2026-zero-registration-tools': 'best-browser-only-tools-q1-2026',
  'free-no-login-developer-tools-q1-2026': 'best-browser-only-tools-q1-2026',
  'april-2026-no-login-tools-roundup': 'best-no-login-tools-april-2026',
  'april-2026-overlooked-free-no-login-tools': 'best-no-login-tools-april-2026',
  '3-free-browser-tools-no-login-hidden-gems': 'new-browser-tools-skip-signup',
  '3-free-online-tools-cant-stop-using-no-signup': 'new-browser-tools-skip-signup',
  '3-free-online-tools-worth-knowing-2026': 'new-browser-tools-skip-signup',
  '3-hidden-gem-websites-no-signup': 'new-browser-tools-skip-signup',
  '3-no-login-browser-tools-worth-bookmarking': 'new-browser-tools-skip-signup',
  '3-underrated-free-online-tools-no-signup': 'new-browser-tools-skip-signup',
  'five-fresh-browser-tools-no-signup-2026': 'new-browser-tools-skip-signup',
  'five-no-login-browser-tools-new-discoveries': 'new-browser-tools-skip-signup',
  'six-free-tools-specific-problems-no-signup': 'new-browser-tools-skip-signup',
  'free-browser-tools-feel-like-pro-software-no-signup': 'new-browser-tools-skip-signup',
  'free-browser-tools-hidden-gems-no-signup': 'new-browser-tools-skip-signup',
  'free-online-tools-you-didnt-know-about-no-signup': 'new-browser-tools-skip-signup',
};

const ALL_LOCALES = ['zh', 'de', 'es', 'fr', 'ja', 'ko', 'pt'];

export function generateRedirectsContent() {
  const lines = [
    '# =========================================================================',
    '# Cloudflare Pages Redirects (_redirects)',
    '# SEO Consolidation & Recovery Configuration for nologin.tools',
    '# =========================================================================',
    '# --- Legal & Privacy Recovery (301 Permanent) ---',
    '/legal /privacy 301',
    '/legal/ /privacy 301',
    '/zh/legal /zh/privacy 301',
    '/zh/legal/ /zh/privacy 301',
    '',
    '# --- Retired Locales Consolidation (ja, ko, es, fr, de, pt) → English (301 Permanent) ---',
    '/ja/* /:splat 301',
    '/ko/* /:splat 301',
    '/es/* /:splat 301',
    '/fr/* /:splat 301',
    '/de/* /:splat 301',
    '/pt/* /:splat 301',
    '/ja / 301',
    '/ko / 301',
    '/es / 301',
    '/fr / 301',
    '/de / 301',
    '/pt / 301',
    '/ja/ / 301',
    '/ko/ / 301',
    '/es/ / 301',
    '/fr/ / 301',
    '/de/ / 301',
    '/pt/ / 301',
    '',
    '# --- Delisted & Renamed Tools 301 Redirects (Top priority for Cloudflare 100-rule limit) ---',
    '/tool/monkeetools-surge-sh /tool/monkeetools-pages-dev 301',
    '/tool/monkeetools-surge-sh/ /tool/monkeetools-pages-dev 301',
    '/badge/monkeetools-surge-sh /badge/monkeetools-pages-dev 301',
    '/badge/monkeetools-surge-sh/ /badge/monkeetools-pages-dev 301',
    '/zh/tool/monkeetools-surge-sh /zh/tool/monkeetools-pages-dev 301',
    '/zh/tool/monkeetools-surge-sh/ /zh/tool/monkeetools-pages-dev 301',
    '/zh/badge/monkeetools-surge-sh /zh/badge/monkeetools-pages-dev 301',
    '/zh/badge/monkeetools-surge-sh/ /zh/badge/monkeetools-pages-dev 301',
    '/tool/hat-sh /category/privacy 301',
    '/tool/hat-sh/ /category/privacy 301',
    '/badge/hat-sh /category/privacy 301',
    '/badge/hat-sh/ /category/privacy 301',
    '/zh/tool/hat-sh /zh/category/privacy 301',
    '/zh/tool/hat-sh/ /zh/category/privacy 301',
    '/zh/badge/hat-sh /zh/category/privacy 301',
    '/zh/badge/hat-sh/ /zh/category/privacy 301',
    '/tool/unscreen-com /category/media 301',
    '/tool/unscreen-com/ /category/media 301',
    '/badge/unscreen-com /category/media 301',
    '/badge/unscreen-com/ /category/media 301',
    '/zh/tool/unscreen-com /zh/category/media 301',
    '/zh/tool/unscreen-com/ /zh/category/media 301',
    '/zh/badge/unscreen-com /zh/category/media 301',
    '/zh/badge/unscreen-com/ /zh/category/media 301',
    '/tool/phind-com /category/ai 301',
    '/tool/phind-com/ /category/ai 301',
    '/badge/phind-com /category/ai 301',
    '/badge/phind-com/ /category/ai 301',
    '/zh/tool/phind-com /zh/category/ai 301',
    '/zh/tool/phind-com/ /zh/category/ai 301',
    '/zh/badge/phind-com /zh/category/ai 301',
    '/zh/badge/phind-com/ /zh/category/ai 301',
    '/tool/huggingface-co-chat /category/ai 301',
    '/tool/huggingface-co-chat/ /category/ai 301',
    '/badge/huggingface-co-chat /category/ai 301',
    '/badge/huggingface-co-chat/ /category/ai 301',
    '/zh/tool/huggingface-co-chat /zh/category/ai 301',
    '/zh/tool/huggingface-co-chat/ /zh/category/ai 301',
    '/zh/badge/huggingface-co-chat /zh/category/ai 301',
    '/zh/badge/huggingface-co-chat/ /zh/category/ai 301',
    '/tool/clideo-com /category/media 301',
    '/tool/clideo-com/ /category/media 301',
    '/badge/clideo-com /category/media 301',
    '/badge/clideo-com/ /category/media 301',
    '/zh/tool/clideo-com /zh/category/media 301',
    '/zh/tool/clideo-com/ /zh/category/media 301',
    '/zh/badge/clideo-com /zh/category/media 301',
    '/zh/badge/clideo-com/ /zh/category/media 301',
    '',
    '# --- Blog Pruning & Pillar Article Consolidation (301 Permanent) ---',
    '',
  ];

  for (const [fromSlug, toSlug] of Object.entries(REDIRECT_MAP)) {
    // English version (pointing directly to canonical non-trailing slash URL)
    lines.push(`/blog/${fromSlug} /blog/${toSlug} 301`);
    lines.push(`/blog/${fromSlug}/ /blog/${toSlug} 301`);

    // Multi-locale versions (zh stays in /zh/blog/..., retired locales go 1-hop to English /blog/...)
    for (const lang of ALL_LOCALES) {
      const targetPrefix = lang === 'zh' ? '/zh' : '';
      lines.push(`/${lang}/blog/${fromSlug} ${targetPrefix}/blog/${toSlug} 301`);
      lines.push(`/${lang}/blog/${fromSlug}/ ${targetPrefix}/blog/${toSlug} 301`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

export function executePruning() {
  let deletedEnglish = 0;
  let deletedTranslations = 0;

  for (const slug of Object.keys(REDIRECT_MAP)) {
    // English file
    const enFile = resolve(BLOG_DIR, `${slug}.md`);
    if (existsSync(enFile)) {
      unlinkSync(enFile);
      deletedEnglish++;
    }

    // Translation files
    for (const lang of ALL_LOCALES) {
      const langFile = resolve(BLOG_DIR, `${lang}/${slug}.md`);
      if (existsSync(langFile)) {
        unlinkSync(langFile);
        deletedTranslations++;
      }
    }
  }

  const content = generateRedirectsContent();
  writeFileSync(REDIRECTS_FILE, content, 'utf-8');

  return { deletedEnglish, deletedTranslations, redirectsCount: Object.keys(REDIRECT_MAP).length };
}

// Run directly if invoked
const isMain = process.argv[1] && process.argv[1].endsWith('prune-blogs-and-generate-redirects.mjs');
if (isMain) {
  const stats = executePruning();
  console.log(`Pruning complete: deleted ${stats.deletedEnglish} English posts, ${stats.deletedTranslations} translated copies.`);
  console.log(`Generated public/_redirects with ${stats.redirectsCount} consolidated clusters.`);
}
