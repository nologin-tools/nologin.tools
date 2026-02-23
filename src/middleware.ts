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

  // Try Cloudflare Workers Cache API — wrapped in try/catch so cache
  // failures never break the request (graceful degradation).
  try {
    // @ts-ignore — caches.default is Cloudflare-specific
    const cache: Cache | undefined = typeof caches !== 'undefined' ? (caches as any).default : undefined;
    if (!cache) {
      return next();
    }

    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss — generate response
    const response = await next();

    // Only cache successful responses
    if (response.status === 200) {
      const cloned = response.clone();
      const headers = new Headers(cloned.headers);
      headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);

      const cachedResponse = new Response(cloned.body, {
        status: cloned.status,
        statusText: cloned.statusText,
        headers,
      });

      // Write to cache asynchronously via waitUntil
      const ctx = (context.locals as any).runtime?.ctx;
      if (ctx?.waitUntil) {
        ctx.waitUntil(cache.put(cacheKey, cachedResponse));
      }
    }

    return response;
  } catch {
    // Cache API unavailable or errored — fall through to normal rendering
    return next();
  }
});
