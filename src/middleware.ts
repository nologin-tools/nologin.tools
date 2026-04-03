import { defineMiddleware } from 'astro:middleware';

const ISR_CACHE_TTL = 21600; // 6 hours in seconds

const NON_DEFAULT_LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];
const ALL_LOCALES = ['en', ...NON_DEFAULT_LOCALES];

// Match /tool/slug, /badge/slug, /zh/tool/slug, /zh/badge/slug, etc.
const LOCALE_PREFIX = `(?:\\/(?:${NON_DEFAULT_LOCALES.join('|')}))?`;
const ISR_REGEX = new RegExp(`^${LOCALE_PREFIX}\\/(?:tool|badge)\\/[^/]+\\/?$`);

// Paths that should never be redirected
const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)\//;
const HAS_EXTENSION_REGEX = /\.\w+$/;

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const { pathname } = url;

  // www → non-www redirect
  if (url.hostname === 'www.nologin.tools') {
    const target = new URL(url);
    target.hostname = 'nologin.tools';
    return new Response(null, {
      status: 301,
      headers: { Location: target.href },
    });
  }

  // Trailing slash redirect (except root /)
  if (request.method === 'GET' && pathname !== '/' && pathname.endsWith('/') && !SKIP_REDIRECT_REGEX.test(pathname)) {
    const cleaned = pathname.replace(/\/+$/, '') || '/';
    return new Response(null, {
      status: 301,
      headers: { Location: cleaned + url.search },
    });
  }

  // Accept-Language redirect for paths without locale prefix
  if (request.method === 'GET' && !SKIP_REDIRECT_REGEX.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname)) {
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
          headers: { Location: redirectUrl.pathname + url.search },
        });
      }
    }
  }

  // Only handle GET requests for ISR paths
  if (request.method !== 'GET' || !isISRPath(pathname)) {
    return next();
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
        return new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: new Headers(cached.headers),
        });
      }
    }
  } catch (err) {
    console.error('[isr-cache] read error:', err);
  }

  // Phase 2: Try static rendering (will 404 if no static file exists)
  const response = await next();

  // Phase 3: If 404, rewrite to SSR fallback route
  if (response.status === 404) {
    const ssrPath = rewriteToSSR(pathname);
    try {
      const ssrResponse = await context.rewrite(ssrPath);

      // Phase 4: Cache successful SSR responses
      if (ssrResponse.status === 200 && cache && cacheKey) {
        try {
          const cloned = ssrResponse.clone();
          const headers = new Headers(cloned.headers);
          headers.set('Cache-Control', `public, max-age=${ISR_CACHE_TTL}`);

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

      return ssrResponse;
    } catch (err) {
      console.error('[isr] rewrite error:', err);
      return response; // Return original 404
    }
  }

  return response;
});

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
