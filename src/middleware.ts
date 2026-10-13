import { defineMiddleware } from 'astro:middleware';
import { getToolBySlug } from './data/loader';
import staticRedirectsData from './data/redirects.json';

const STATIC_REDIRECTS: Record<string, string> = staticRedirectsData;

const ISR_CACHE_TTL = 21600; // 6 hours in seconds

const NON_DEFAULT_LOCALES = ['zh'];
const RETIRED_LOCALES = ['ja', 'ko', 'es', 'fr', 'de', 'pt'];
// Match /tool/slug, /badge/slug, /zh/tool/slug, /zh/badge/slug
const LOCALE_PREFIX = '(?:\\/zh)?';
const ISR_REGEX = new RegExp(`^${LOCALE_PREFIX}\\/(?:tool|badge)\\/[^/]+\\/?$`);

// Paths that should never be redirected
const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)(\/|$)/;
const HAS_EXTENSION_REGEX = /\.\w+$/;

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const { pathname } = url;

  // www → non-www redirect (exclude /api/ to prevent breaking POST forms / cross-origin preflight errors)
  if (url.hostname === 'www.nologin.tools' && !pathname.startsWith('/api/')) {
    const target = new URL(url);
    target.hostname = 'nologin.tools';
    return new Response(null, {
      status: 301,
      headers: { Location: target.href },
    });
  }

  // Handle CORS preflight for all /api/ endpoints
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Trailing slash normalization: /path/ → /path (301, GET only to avoid breaking POST forms)
  const ALLOWED_QUERY_PATHS = /^\/(api|admin|ssr|submit\/success|finder)(\/|$)/;

  const isSafeMethod = request.method === 'GET' || request.method === 'HEAD';

  // 301 Permanent Redirect to strip extraneous search parameters from canonical content pages
  // (Consolidates GSC indexing to canonical URLs, prevents spider traps and soft 404s)
  if (
    isSafeMethod &&
    url.search &&
    !ALLOWED_QUERY_PATHS.test(pathname) &&
    !HAS_EXTENSION_REGEX.test(pathname)
  ) {
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    return new Response(null, {
      status: 301,
      headers: {
        Location: cleanPath,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  if (isSafeMethod && pathname !== '/' && pathname.endsWith('/') && !SKIP_REDIRECT_REGEX.test(pathname)) {
    const cleanPath = pathname.replace(/\/+$/, '');
    const cleanSearch = ALLOWED_QUERY_PATHS.test(cleanPath) ? url.search : '';
    return new Response(null, {
      status: 301,
      headers: { Location: cleanPath + cleanSearch },
    });
  }

  // 301 Permanent Redirect for retired locales (ja, ko, es, fr, de, pt) → canonical English route
  if (isSafeMethod && !SKIP_REDIRECT_REGEX.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname)) {
    const firstSegment = pathname.split('/').filter(Boolean)[0];
    if (firstSegment && RETIRED_LOCALES.includes(firstSegment)) {
      const remainder = pathname.slice(firstSegment.length + 1) || '/';
      const cleanSearch = ALLOWED_QUERY_PATHS.test(remainder) ? url.search : '';
      return new Response(null, {
        status: 301,
        headers: {
          Location: remainder + cleanSearch,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  }

  // 301 Permanent Redirect for known pruned blogs & delisted tools (bypassing Cloudflare Pages 100-rule limit)
  if (isSafeMethod && !SKIP_REDIRECT_REGEX.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname)) {
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const target = STATIC_REDIRECTS[cleanPath] || STATIC_REDIRECTS[pathname];
    if (target) {
      const cleanSearch = ALLOWED_QUERY_PATHS.test(target) ? url.search : '';
      return new Response(null, {
        status: 301,
        headers: {
          Location: target + cleanSearch,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  }

  // Accept-Language redirect for paths without locale prefix (Exempt all search engine crawlers & bots)
  const BOT_REGEX = /Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Applebot|Sogou|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Bytespider|ClaudeBot|GPTBot|PerplexityBot|NoLoginTools/i;
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_REGEX.test(userAgent);

  if (request.method === 'GET' && !isBot && !SKIP_REDIRECT_REGEX.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname)) {
    const firstSegment = pathname.split('/').filter(Boolean)[0];
    const hasLocalePrefix = firstSegment && NON_DEFAULT_LOCALES.includes(firstSegment);

    if (!hasLocalePrefix) {
      // Check lang cookie first
      const cookieHeader = request.headers.get('cookie') || '';
      const langCookie = cookieHeader.match(/(?:^|;\s*)lang=(\w+)/)?.[1];

      let targetLocale: string | null = null;

      if (langCookie && NON_DEFAULT_LOCALES.includes(langCookie)) {
        targetLocale = langCookie;
      } else if (!langCookie) {
        // Parse Accept-Language header
        const acceptLang = request.headers.get('accept-language') || '';
        const preferred = parseAcceptLanguage(acceptLang);
        for (const lang of preferred) {
          const shortLang = lang.split('-')[0].toLowerCase();
          if (NON_DEFAULT_LOCALES.includes(shortLang)) {
            targetLocale = shortLang;
            break;
          }
          if (shortLang === 'en') break; // English is default, no redirect
        }
      }

      if (targetLocale) {
        const redirectUrl = new URL(`/${targetLocale}${pathname === '/' ? '' : pathname}`, url);
        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectUrl.pathname + url.search,
            Vary: 'Accept-Language',
          },
        });
      }
    }
  }

  // Only handle GET requests for ISR paths
  if (request.method !== 'GET' || !isISRPath(pathname)) {
    const response = await next();
    if (pathname.startsWith('/api/')) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
    return withContentLanguage(response, pathname);
  }

  // For ISR paths, determine if a pre-rendered static asset exists
  const isrInfo = extractSlugFromISRPath(pathname);
  const existingTool = isrInfo ? getToolBySlug(isrInfo.slug) : undefined;
  const isApprovedStatic = existingTool && existingTool.status === 'approved';

  // If tool is NOT approved or not in build data (e.g. pending, rejected, newly submitted, or unknown),
  // rewrite directly to the SSR route before calling next() so Cloudflare Pages / Astro
  // serves the dynamic state instead of a static 404!
  if (!isApprovedStatic) {
    const ssrPath = rewriteToSSR(pathname);
    try {
      const ssrResponse = await context.rewrite(ssrPath);
      return withContentLanguage(ssrResponse, pathname);
    } catch (err) {
      console.error('[isr] direct rewrite error:', err);
    }
  }

  // Phase 1: Check Cache API for previously cached SSR responses
  let cache: Cache | undefined;
  let cacheKey: Request | undefined;
  try {
    // @ts-ignore — caches.default is Cloudflare-specific
    cache = typeof caches !== 'undefined' ? (caches as any).default : undefined;
    if (cache) {
      cacheKey = new Request(url.toString(), { method: 'GET' });
      const cached = await cache.match(cacheKey);
      if (cached) {
        const cachedResp = new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: new Headers(cached.headers),
        });
        return withContentLanguage(cachedResp, pathname);
      }
    }
  } catch (err) {
    console.error('[isr-cache] read error:', err);
  }

  // Phase 2: Try static rendering (will 404 if no static file exists)
  const response = await next();

  // Phase 3: If 404, check env.ASSETS for pre-rendered static HTML or rewrite to SSR fallback route
  if (response.status === 404) {
    const env = (context.locals as any).runtime?.env;
    if (env?.ASSETS) {
      try {
        const cleanUrl = url.toString().replace(/\/+$/, '');
        const asset = await env.ASSETS.fetch(cleanUrl);
        if (asset.status !== 404) {
          return withContentLanguage(asset, pathname);
        }
        const assetIndex = await env.ASSETS.fetch(`${cleanUrl}/index.html`);
        if (assetIndex.status !== 404) {
          return withContentLanguage(assetIndex, pathname);
        }
      } catch (err) {
        console.error('[asset-fetch] error:', err);
      }
    }

    const ssrPath = rewriteToSSR(pathname);
    try {
      let ssrResponse: Response | null = null;
      try {
        ssrResponse = await context.rewrite(ssrPath);
      } catch {
        ssrResponse = null;
      }

      if (ssrResponse && ssrResponse.status === 200) {
        // Phase 4: Cache successful SSR responses
        if (cache && cacheKey) {
          try {
            const cloned = ssrResponse.clone();
            const headers = new Headers(cloned.headers);
            headers.set('Cache-Control', `public, max-age=${ISR_CACHE_TTL}`);
            headers.set('Content-Language', getLocaleFromPath(pathname));

            const cachedResponse = new Response(cloned.body, {
              status: cloned.status,
              statusText: cloned.statusText,
              headers,
            });

            const ctx = (context.locals as any).runtime?.ctx;
            if (ctx?.waitUntil) {
              ctx.waitUntil(cache.put(cacheKey, cachedResponse));
            }
          } catch (err) {
            console.error('[isr-cache] write error:', err);
          }
        }
        return withContentLanguage(ssrResponse, pathname);
      }
    } catch (err) {
      console.error('[isr] rewrite error:', err);
    }
    return withContentLanguage(response, pathname); // Return original 404
  }

  return withContentLanguage(response, pathname);
});

function extractSlugFromISRPath(pathname: string): { type: 'tool' | 'badge'; slug: string } | null {
  const match = pathname.match(/^(?:\/zh)?\/(tool|badge)\/([^/]+)\/?$/);
  if (!match) return null;
  return { type: match[1] as 'tool' | 'badge', slug: match[2] };
}

function getLocaleFromPath(pathname: string): string {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && NON_DEFAULT_LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  return 'en';
}

function withContentLanguage(response: Response, pathname: string): Response {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
  const locale = getLocaleFromPath(pathname);
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });
  newResponse.headers.set('Content-Language', locale);
  return newResponse;
}

function isISRPath(pathname: string): boolean {
  return ISR_REGEX.test(pathname);
}

/**
 * Rewrite ISR paths to SSR fallback routes.
 * /tool/slug → /ssr/tool/slug
 * /zh/tool/slug → /ssr/zh/tool/slug
 */
function rewriteToSSR(pathname: string): string {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && NON_DEFAULT_LOCALES.includes(firstSegment)) {
    // /zh/tool/slug → /ssr/zh/tool/slug
    return `/ssr${pathname}`;
  }
  // /tool/slug → /ssr/tool/slug
  return pathname.replace(/^\/(tool|badge)\//, '/ssr/$1/');
}

/**
 * Parse Accept-Language header into ordered list of language codes.
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: lang.trim(), q: q ? parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q)
    .map((item) => item.lang);
}
