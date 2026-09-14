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
    '',
    '# --- 1. Trailing Slash Normalization (Avoid Split Rankings in GSC) ---',
    '/about/ /about 301',
    '/submit/ /submit 301',
    '/badge/ /badge 301',
    '/blog/ /blog 301',
    '',
  ];

  for (const lang of ALL_LOCALES) {
    lines.push(
      `/${lang}/about/ /${lang}/about 301`,
      `/${lang}/submit/ /${lang}/submit 301`,
      `/${lang}/badge/ /${lang}/badge 301`,
      `/${lang}/blog/ /${lang}/blog 301`
    );
  }

  lines.push(
    '',
    '# --- 2. Blog Pruning & Pillar Article Consolidation (301 Permanent) ---'
  );

  for (const [fromSlug, toSlug] of Object.entries(REDIRECT_MAP)) {
    // English version
    lines.push(`/blog/${fromSlug} /blog/${toSlug} 301`);
    lines.push(`/blog/${fromSlug}/ /blog/${toSlug} 301`);

    // Multi-locale versions
    for (const lang of ALL_LOCALES) {
      lines.push(`/${lang}/blog/${fromSlug} /${lang}/blog/${toSlug} 301`);
      lines.push(`/${lang}/blog/${fromSlug}/ /${lang}/blog/${toSlug} 301`);
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
