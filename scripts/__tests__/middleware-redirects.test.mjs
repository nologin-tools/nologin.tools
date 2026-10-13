import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Middleware SEO Redirects & Crawler Protection', () => {
  const ALLOWED_QUERY_PATHS = /^\/(api|admin|ssr|submit\/success|finder)(\/|$)/;
  const HAS_EXTENSION_REGEX = /\.\w+$/;
  const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)(\/|$)/;
  const BOT_REGEX = /Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Applebot|Sogou|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Bytespider|ClaudeBot|GPTBot|PerplexityBot|NoLoginTools/i;

  it('identifies search engine crawlers and AI bots', () => {
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)'), true);
    assert.equal(BOT_REGEX.test('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'), false);
  });

  it('correctly protects allowed query paths from being stripped', () => {
    assert.equal(ALLOWED_QUERY_PATHS.test('/api/v1/tools'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/api/tools'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/admin'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/finder'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/submit/success'), true);
    assert.equal(ALLOWED_QUERY_PATHS.test('/ssr/tool/abc'), true);

    // Static content pages that should have query params stripped
    assert.equal(ALLOWED_QUERY_PATHS.test('/'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/zh'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/tool/excalidraw-com'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/category/design'), false);
    assert.equal(ALLOWED_QUERY_PATHS.test('/blog/my-post'), false);
  });

  it('determines when search parameters should trigger a 301 canonical redirect', () => {
    function shouldRedirectQueryParam(pathname, search) {
      return Boolean(search) && !ALLOWED_QUERY_PATHS.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname);
    }

    // Historical faceted spider trap combinations
    assert.equal(shouldRedirectQueryParam('/', '?category=Media&sort=newest&offline=Online+Only'), true);
    assert.equal(shouldRedirectQueryParam('/tool/excalidraw-com', '?pricing=free'), true);
    assert.equal(shouldRedirectQueryParam('/category/design', '?sort=popular'), true);
    assert.equal(shouldRedirectQueryParam('/zh/', '?data=Server-Side'), true);

    // Legitimate parameters
    assert.equal(shouldRedirectQueryParam('/finder', '?q=whiteboard'), false);
    assert.equal(shouldRedirectQueryParam('/admin', '?secret=foo'), false);
    assert.equal(shouldRedirectQueryParam('/api/v1/tools', '?category=AI'), false);
    assert.equal(shouldRedirectQueryParam('/submit/success', '?slug=my-tool'), false);

    // Static assets
    assert.equal(shouldRedirectQueryParam('/favicon.svg', '?v=2'), false);
  });
});
