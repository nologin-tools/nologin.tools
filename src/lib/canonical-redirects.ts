import staticRedirectsData from '../data/redirects.json';

const STATIC_REDIRECTS: Record<string, string> = staticRedirectsData as Record<string, string>;

const RETIRED_LOCALES = ['ja', 'ko', 'es', 'fr', 'de', 'pt'];
const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)(\/|$)/;
const HAS_EXTENSION_REGEX = /\.\w+$/;
const ALLOWED_QUERY_PATHS = /^\/(?:api|admin|ssr|(?:zh\/)?(?:submit\/success|finder))(\/|$)/;

/**
 * Resolve target through any redirect chains to ensure clean 1-hop redirects.
 */
export function resolveFinalTarget(initialTarget: string): string {
  let target = initialTarget;
  let hops = 0;
  while (STATIC_REDIRECTS[target] && hops < 5) {
    target = STATIC_REDIRECTS[target];
    hops++;
  }
  return target;
}

/**
 * Compute the final 1-hop canonical redirect target for any incoming URL and HTTP method.
 * Combines www -> non-www, trailing-slash removal, retired locale consolidation,
 * static dictionary redirects, and extraneous query parameter stripping into a single hop.
 */
export function resolveCanonicalRedirect(url: URL, method: string): string | null {
  const { pathname, hostname, search } = url;
  const isSafeMethod = method === 'GET' || method === 'HEAD';
  const isWww = hostname === 'www.nologin.tools' && !pathname.startsWith('/api/');

  if (pathname.startsWith('/api/')) {
    return null;
  }

  if (!isSafeMethod || SKIP_REDIRECT_REGEX.test(pathname) || HAS_EXTENSION_REGEX.test(pathname)) {
    if (isWww) {
      return `https://nologin.tools${pathname}${search}`;
    }
    return null;
  }

  let targetPath = pathname;

  // 1. Strip trailing slashes (except root '/')
  if (targetPath.length > 1 && targetPath.endsWith('/')) {
    targetPath = targetPath.replace(/\/+$/, '') || '/';
  }

  // 2. Consolidate retired locales (ja, ko, es, fr, de, pt) -> English canonical path
  const firstSegment = targetPath.split('/').filter(Boolean)[0];
  if (firstSegment && RETIRED_LOCALES.includes(firstSegment)) {
    const remainder = targetPath.slice(firstSegment.length + 1) || '/';
    targetPath = remainder === '/' ? '/' : remainder.replace(/\/+$/, '');
  }

  // 3. Resolve static 301 redirects (pruned blogs, delisted tools, renamed tools, legal)
  const rawStaticTarget = STATIC_REDIRECTS[targetPath] || STATIC_REDIRECTS[pathname];
  if (rawStaticTarget) {
    targetPath = resolveFinalTarget(rawStaticTarget);
    if (targetPath.length > 1 && targetPath.endsWith('/')) {
      targetPath = targetPath.replace(/\/+$/, '') || '/';
    }
  }

  // 4. Strip extraneous query parameters unless path explicitly allows them
  const targetSearch = ALLOWED_QUERY_PATHS.test(targetPath) ? search : '';

  if (isWww || targetPath !== pathname || targetSearch !== search) {
    return isWww
      ? `https://nologin.tools${targetPath}${targetSearch}`
      : `${targetPath}${targetSearch}`;
  }

  return null;
}
