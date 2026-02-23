import { defineMiddleware } from 'astro:middleware';

const CACHED_PATHS = new Set(['/', '/sitemap.xml']);
const CACHE_TTL = 60; // seconds

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;

  // Only cache GET requests for specific paths
  if (request.method !== 'GET' || !CACHED_PATHS.has(url.pathname)) {
    return next();
  }

  // Skip cache for admin requests
  if (url.searchParams.has('secret')) {
    return next();
  }

  // Phase 1: Try to read from Cloudflare Workers Cache API
  let cache: Cache | undefined;
  let cacheKey: Request | undefined;
  try {
    // @ts-ignore — caches.default is Cloudflare-specific
    cache = typeof caches !== 'undefined' ? (caches as any).default : undefined;
    if (cache) {
      cacheKey = new Request(url.toString(), { method: 'GET' });
      const cached = await cache.match(cacheKey);
      if (cached) {
        // Return a new Response with mutable headers — cached responses
        // from the Cache API have immutable headers, and Astro's render
        // pipeline needs to modify them (e.g. Content-Type).
        return new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: new Headers(cached.headers),
        });
      }
    }
  } catch (err) {
    console.error('[cache] read error:', err);
    // Continue to normal rendering
  }

  // Phase 2: Render the page (never inside cache try/catch)
  const response = await next();

  // Phase 3: Try to write successful responses to cache
  if (cache && cacheKey && response.status === 200) {
    try {
      const cloned = response.clone();
      const headers = new Headers(cloned.headers);
      headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);

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
      console.error('[cache] write error:', err);
    }
  }

  return response;
});
