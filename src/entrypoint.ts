import { App } from 'astro/app';
import type { SSRManifest } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { resolveCanonicalRedirect, resolveFinalTarget } from './lib/canonical-redirects';
import { getToolBySlug } from './data/loader';

export { resolveCanonicalRedirect, resolveFinalTarget };

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);

  const fetch = async (request: Request, env: any, context: any) => {
    const url = new URL(request.url);
    const redirectLocation = resolveCanonicalRedirect(url, request.method);

    if (redirectLocation) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: redirectLocation,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // For ISR paths (/tool/slug, /badge/slug, /zh/tool/slug, /zh/badge/slug) where the tool is not
    // pre-rendered as an approved static page, dispatch directly to the SSR fallback route so
    // @astrojs/cloudflare matches the SSR route in manifest instead of returning static 404.html.
    if (request.method === 'GET' || request.method === 'HEAD') {
      const isrMatch = url.pathname.match(/^(?:\/(zh))?\/(tool|badge)\/([^/]+)$/);
      if (isrMatch) {
        const [, localePrefix, routeType, slug] = isrMatch;
        const existingTool = getToolBySlug(slug);
        const isApprovedStatic = existingTool && existingTool.status === 'approved';
        if (!isApprovedStatic) {
          const ssrUrl = new URL(request.url);
          ssrUrl.pathname = localePrefix
            ? `/ssr/${localePrefix}/${routeType}/${slug}`
            : `/ssr/${routeType}/${slug}`;
          const ssrRequest = new Request(ssrUrl.toString(), request);
          return await handle(manifest, app, ssrRequest, env, context);
        }
      }
    }

    // Dispatch to standard Astro Cloudflare runtime handler
    return await handle(manifest, app, request, env, context);
  };

  return { default: { fetch } };
}
