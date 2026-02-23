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

  // Try to serve from Cloudflare Workers Cache API
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

  // Only cache successful HTML/XML responses
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
    } else {
      // Fallback: fire and forget (dev environment)
      cache.put(cacheKey, cachedResponse).catch(() => {});
    }
  }

  return response;
});
