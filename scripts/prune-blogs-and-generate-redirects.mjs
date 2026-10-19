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

export const RENAMED_TOOLS_MAP = {
  'monkeetools-surge-sh': 'monkeetools-pages-dev',
  'convertio-com': 'convertio-co',
  'ps-keepmot-com-zh': 'ps-keepmot-com',
  'preuveenmain-ca-app-index-html': 'preuveenmain-ca-app',
  'www-reficompass-com': 'reficompass-com',
  'archive-today': 'archive-ph',
};

export const DELISTED_TOOLS_CATEGORY_MAP = {
  'hat-sh': 'privacy',
  'svgedit-netlify-app-editor-index-html': 'design',
  'svgedit-netlify-app-editor': 'design',
  'unscreen-com': 'media',
  'phind-com': 'ai',
  'huggingface-co-chat': 'ai',
  'clideo-com': 'media',
  'quickstart-to': 'development',
  'lowrisktradesmart-org': 'finance',
  'm3u8-player-net': 'media',
  'alphagaindaily-com': 'finance',
  'levelwalks-com': 'productivity',
  'freeqr-pro': 'productivity',
  'trust-leak-audit-static-vercel-app': 'privacy',
  'sec-filing-fee-calculator-vercel-app': 'finance',
  'sec-13d-13g-deadline-calculator-vercel-app': 'finance',
  'form-d-deadline-calculator-vercel-app': 'finance',
  'section-16-deadline-calculator-vercel-app': 'finance',
  'www-quackbuilds-com-apps-oee-pulse-html': 'productivity',
};

export const RENAMED_COMPARISONS_MAP = {
  'svgedit-vs-svgomg': 'haikei-vs-fffuel',
};

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
    '# --- Delisted & Renamed Tools 301 Redirects ---',
  ];

  for (const [fromSlug, toSlug] of Object.entries(RENAMED_TOOLS_MAP)) {
    lines.push(`/tool/${fromSlug} /tool/${toSlug} 301`);
    lines.push(`/tool/${fromSlug}/ /tool/${toSlug} 301`);
    lines.push(`/badge/${fromSlug} /badge/${toSlug} 301`);
    lines.push(`/badge/${fromSlug}/ /badge/${toSlug} 301`);
    lines.push(`/zh/tool/${fromSlug} /zh/tool/${toSlug} 301`);
    lines.push(`/zh/tool/${fromSlug}/ /zh/tool/${toSlug} 301`);
    lines.push(`/zh/badge/${fromSlug} /zh/badge/${toSlug} 301`);
    lines.push(`/zh/badge/${fromSlug}/ /zh/badge/${toSlug} 301`);
  }

  for (const [fromSlug, categorySlug] of Object.entries(DELISTED_TOOLS_CATEGORY_MAP)) {
    lines.push(`/tool/${fromSlug} /category/${categorySlug} 301`);
    lines.push(`/tool/${fromSlug}/ /category/${categorySlug} 301`);
    lines.push(`/badge/${fromSlug} /category/${categorySlug} 301`);
    lines.push(`/badge/${fromSlug}/ /category/${categorySlug} 301`);
    lines.push(`/zh/tool/${fromSlug} /zh/category/${categorySlug} 301`);
    lines.push(`/zh/tool/${fromSlug}/ /zh/category/${categorySlug} 301`);
    lines.push(`/zh/badge/${fromSlug} /zh/category/${categorySlug} 301`);
    lines.push(`/zh/badge/${fromSlug}/ /zh/category/${categorySlug} 301`);
  }

  for (const [fromSlug, toSlug] of Object.entries(RENAMED_COMPARISONS_MAP)) {
    lines.push(`/compare/${fromSlug} /compare/${toSlug} 301`);
    lines.push(`/compare/${fromSlug}/ /compare/${toSlug} 301`);
    lines.push(`/zh/compare/${fromSlug} /zh/compare/${toSlug} 301`);
    lines.push(`/zh/compare/${fromSlug}/ /zh/compare/${toSlug} 301`);
  }

  lines.push('');
  lines.push('# --- Blog Pruning & Pillar Article Consolidation (301 Permanent) ---');
  lines.push('');

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
