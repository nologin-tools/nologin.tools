import { App } from 'astro/app';
import type { SSRManifest } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { resolveCanonicalRedirect, resolveFinalTarget } from './lib/canonical-redirects';

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

    // Dispatch to standard Astro Cloudflare runtime handler
    return await handle(manifest, app, request, env, context);
  };

  return { default: { fetch } };
}
