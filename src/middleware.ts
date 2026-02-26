import { defineMiddleware } from 'astro:middleware';

const ISR_CACHE_TTL = 21600; // 6 hours in seconds

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const { pathname } = url;

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
    const ssrPath = pathname.replace(/^\/(tool|badge)\//, '/ssr/$1/');
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
  return /^\/(tool|badge)\/[^/]+\/?$/.test(pathname);
}
