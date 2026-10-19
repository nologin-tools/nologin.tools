import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const STATIC_REDIRECTS = JSON.parse(readFileSync(resolve(ROOT, 'src/data/redirects.json'), 'utf-8'));

function resolveFinalTarget(initialTarget) {
  let target = initialTarget;
  let hops = 0;
  while (STATIC_REDIRECTS[target] && hops < 5) {
    target = STATIC_REDIRECTS[target];
    hops++;
  }
  return target;
}

describe('Middleware SEO Redirects & Crawler Protection', () => {
  const RETIRED_LOCALES = ['ja', 'ko', 'es', 'fr', 'de', 'pt'];
  const ALLOWED_QUERY_PATHS = /^\/(?:api|admin|ssr|(?:zh\/)?(?:submit\/success|finder))(\/|$)/;
  const HAS_EXTENSION_REGEX = /\.\w+$/;
  const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)(\/|$)/;
  const BOT_REGEX = /Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Applebot|Sogou|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Bytespider|ClaudeBot|GPTBot|PerplexityBot|NoLoginTools/i;

  function resolveCanonicalRedirect(urlStr, method = 'GET') {
    const url = new URL(urlStr);
    const { pathname, hostname, search } = url;
    const isSafeMethod = method === 'GET' || method === 'HEAD';
    const isWww = hostname === 'www.nologin.tools' && !pathname.startsWith('/api/');

    if (pathname.startsWith('/api/')) return null;

    if (!isSafeMethod || SKIP_REDIRECT_REGEX.test(pathname) || HAS_EXTENSION_REGEX.test(pathname)) {
      if (isWww) return `https://nologin.tools${pathname}${search}`;
      return null;
    }

    let targetPath = pathname;
    if (targetPath.length > 1 && targetPath.endsWith('/')) {
      targetPath = targetPath.replace(/\/+$/, '') || '/';
    }

    const firstSegment = targetPath.split('/').filter(Boolean)[0];
    if (firstSegment && RETIRED_LOCALES.includes(firstSegment)) {
      const remainder = targetPath.slice(firstSegment.length + 1) || '/';
      targetPath = remainder === '/' ? '/' : remainder.replace(/\/+$/, '');
    }

    const rawStaticTarget = STATIC_REDIRECTS[targetPath] || STATIC_REDIRECTS[pathname];
    if (rawStaticTarget) {
      targetPath = resolveFinalTarget(rawStaticTarget);
      if (targetPath.length > 1 && targetPath.endsWith('/')) {
        targetPath = targetPath.replace(/\/+$/, '') || '/';
      }
    }

    const targetSearch = ALLOWED_QUERY_PATHS.test(targetPath) ? search : '';

    if (isWww || targetPath !== pathname || targetSearch !== search) {
      return isWww
        ? `https://nologin.tools${targetPath}${targetSearch}`
        : `${targetPath}${targetSearch}`;
    }

    return null;
  }

  it('identifies search engine crawlers and AI bots', () => {
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'), false);
  });

  it('correctly protects allowed query paths (including /zh/finder and /zh/submit/success) from being stripped', () => {
    assert.equal(ALLOWED_QUERY_PATHS.test('/api/v1/tools'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/api/tools'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/admin'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/finder'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/zh/finder'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/submit/success'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/zh/submit/success'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/ssr/tool/abc'), true);

    // Static content pages that should have query params stripped
    assert.equal(ALLOWED_QUERY_PATHS.test('/'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/zh'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/tool/excalidraw-com'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/category/design'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/blog/my-post'), false);
  });

  it('resolves multi-condition redirects (www, trailing slash, retired locales, static rules, query params) in a single 1-hop redirect', () => {
    // GSC legacy indexed URLs with trailing slashes and retired locales
    assert.equal(resolveCanonicalRedirect('https://nologin.tools/pt/'), '/');
    assert.equal(resolveCanonicalRedirect('https://nologin.tools/es/badge/fffuel-co/'), '/badge/fffuel-co');
    assert.equal(resolveCanonicalRedirect('https://nologin.tools/ko/tool/transform-tools/'), '/tool/transform-tools');

    // Combined www + retired locale + pruned blog + trailing slash + query param -> 1-hop
    assert.equal(
      resolveCanonicalRedirect('https://www.nologin.tools/de/blog/edit-pdf-without-adobe-free-no-login/?utm_source=x'),
      'https://nologin.tools/blog/edit-pdf-without-installing-anything'
    );

    // Chinese pruned blog with trailing slash -> 1-hop to Chinese pillar post
    assert.equal(
      resolveCanonicalRedirect('https://nologin.tools/zh/blog/edit-pdf-without-adobe-free-no-login/'),
      '/zh/blog/edit-pdf-without-installing-anything'
    );

    // Query param spider trap on homepage
    assert.equal(
      resolveCanonicalRedirect('https://nologin.tools/?category=Media&sort=newest&offline=Online+Only'),
      '/'
    );

    // Allowed query params on /finder and /zh/finder are preserved
    assert.equal(resolveCanonicalRedirect('https://nologin.tools/finder?q=whiteboard'), null);
    assert.equal(resolveCanonicalRedirect('https://nologin.tools/zh/finder?q=whiteboard'), null);
    assert.equal(resolveCanonicalRedirect('https://nologin.tools/zh/finder/?q=whiteboard'), '/zh/finder?q=whiteboard');
  });

  it('HomePage links to programmatic SEO hubs and prevents duplicate/outbound PageRank dilution', () => {
    const homeContent = readFileSync(resolve(ROOT, 'src/components/HomePage.astro'), 'utf-8');
    assert.ok(homeContent.includes('rel="noopener noreferrer nofollow"'), 'Outbound tool hostname links on HomePage should include nofollow');
    assert.ok(homeContent.includes('/alternative/${alt.slug}'), 'HomePage must link to /alternative/[slug] pages');
    assert.ok(homeContent.includes('/compare/${pair.slug}'), 'HomePage must link to /compare/[slug] pages');
    assert.ok(homeContent.includes('/workflow/${wf.slug}'), 'HomePage must link to /workflow/[slug] pages');
    assert.ok(homeContent.includes('/collection/${col.slug}'), 'HomePage must link to /collection/[slug] pages');
  });

  it('sitemap.xml.ts initializes homepageLastmod accumulator to 2026-01-01 instead of build date', () => {
    const sitemapContent = readFileSync(resolve(ROOT, 'src/pages/sitemap.xml.ts'), 'utf-8');
    assert.ok(!sitemapContent.includes('const staticLastmod = new Date()'), 'Must not stamp staticLastmod with current build time');
    assert.ok(sitemapContent.includes("}, '2026-01-01');"), 'Must initialize reduce accumulator to baseline date');
  });
});
