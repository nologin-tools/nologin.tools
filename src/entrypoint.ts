import { App } from 'astro/app';
import type { SSRManifest } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import staticRedirectsData from './data/redirects.json';

const STATIC_REDIRECTS: Record<string, string> = staticRedirectsData as Record<string, string>;

const RETIRED_LOCALES = ['ja', 'ko', 'es', 'fr', 'de', 'pt'];
const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)(\/|$)/;
const HAS_EXTENSION_REGEX = /\.\w+$/;
const ALLOWED_QUERY_PATHS = /^\/(api|admin|ssr|submit\/success|finder)(\/|$)/;

/**
 * Resolve target through any redirect chains to ensure clean 1-hop redirects.
 */
function resolveFinalTarget(initialTarget: string): string {
  let target = initialTarget;
  let hops = 0;
  while (STATIC_REDIRECTS[target] && hops < 5) {
    target = STATIC_REDIRECTS[target];
    hops++;
  }
  return target;
}

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);

  const fetch = async (request: Request, env: any, context: any) => {
    const url = new URL(request.url);
    const { pathname, hostname } = url;
    const isSafeMethod = request.method === 'GET' || request.method === 'HEAD';

    // 1. Canonical host: www → non-www (301, exclude /api/)
    if (hostname === 'www.nologin.tools' && !pathname.startsWith('/api/')) {
      const target = new URL(url);
      target.hostname = 'nologin.tools';
      return new Response(null, {
        status: 301,
        headers: { Location: target.href },
      });
    }

    // 2. Trailing slash normalization: /path/ → /path (301, GET/HEAD only)
    if (isSafeMethod && pathname.length > 1 && pathname.endsWith('/') && !pathname.startsWith('/api/')) {
      const cleanPath = pathname.replace(/\/+$/, '') || '/';
      const cleanSearch = ALLOWED_QUERY_PATHS.test(cleanPath) ? url.search : '';
      return new Response(null, {
        status: 301,
        headers: { Location: cleanPath + cleanSearch },
      });
    }

    // 3. Retired locales consolidation (ja, ko, es, fr, de, pt) → canonical English route (301)
    if (isSafeMethod && !SKIP_REDIRECT_REGEX.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname)) {
      const firstSegment = pathname.split('/').filter(Boolean)[0];
      if (firstSegment && RETIRED_LOCALES.includes(firstSegment)) {
        const remainder = pathname.slice(firstSegment.length + 1) || '/';
        const cleanRemainder = remainder === '/' ? '/' : remainder.replace(/\/+$/, '');
        const target = resolveFinalTarget(STATIC_REDIRECTS[cleanRemainder] || remainder);
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

    // 4. Static 301 Redirects (pruned blogs, delisted tools, renamed tools, legal, etc.)
    if (isSafeMethod && !SKIP_REDIRECT_REGEX.test(pathname) && !HAS_EXTENSION_REGEX.test(pathname)) {
      const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
      const rawTarget = STATIC_REDIRECTS[cleanPath] || STATIC_REDIRECTS[pathname];
      if (rawTarget) {
        const target = resolveFinalTarget(rawTarget);
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

    // 5. Query param cleanup: strip extraneous parameters from canonical pages
    if (
      isSafeMethod &&
      url.search &&
      !ALLOWED_QUERY_PATHS.test(pathname) &&
      !SKIP_REDIRECT_REGEX.test(pathname) &&
      !HAS_EXTENSION_REGEX.test(pathname)
    ) {
      return new Response(null, {
        status: 301,
        headers: { Location: pathname },
      });
    }

    // 6. Otherwise dispatch to standard Astro Cloudflare runtime handler
    return await handle(manifest, app, request, env, context);
  };

  return { default: { fetch } };
}
