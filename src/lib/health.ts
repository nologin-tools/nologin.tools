export type EffectiveStatus = 'online' | 'unstable' | 'offline';

export interface HealthCheckResult {
  isOnline: boolean;
  httpStatus: number | null;
  responseTimeMs: number | null;
}

const HEALTH_CHECK_HEADERS = {
  'User-Agent': 'NoLoginTools-HealthChecker/1.0',
};

export const HEALTH_TOLERANCE = 5;
export const HEALTH_WINDOW_HOURS = 48;

/** Status codes that indicate the page is gone (not just blocked). */
const GONE_STATUS_CODES = new Set([404, 410]);

/** Returns true if the HTTP status indicates the server is reachable. */
export function isReachable(status: number): boolean {
  return !GONE_STATUS_CODES.has(status);
}

export function resolveEffectiveStatus(
  checks: { isOnline: boolean; checkedAt?: Date | null }[]
): EffectiveStatus | null {
  if (checks.length === 0) return null;

  // If timestamps available, check if most recent is within 48h window
  if (checks[0]?.checkedAt) {
    const windowMs = HEALTH_WINDOW_HOURS * 60 * 60 * 1000;
    const cutoff = Date.now() - windowMs;
    if (checks[0].checkedAt.getTime() < cutoff) return null;
  }

  // Fast recovery: latest check online → immediately online
  if (checks[0].isOnline) return 'online';

  // Latest check is offline — use all records to distinguish unstable vs offline
  const onlineCount = checks.filter((c) => c.isOnline).length;
  if (onlineCount === 0) return 'offline';
  return 'unstable';
}

function isSelfReference(url: string, siteUrl: string): boolean {
  try {
    return new URL(url).hostname === new URL(siteUrl).hostname;
  } catch {
    return false;
  }
}

export async function checkHealth(url: string, siteUrl?: string): Promise<HealthCheckResult> {
  // Self-referencing requests on Cloudflare Workers cause 522 errors.
  // If the target hostname matches SITE_URL, short-circuit: the Worker being
  // able to execute this code already proves the site is online.
  if (siteUrl && isSelfReference(url, siteUrl)) {
    return { isOnline: true, httpStatus: 200, responseTimeMs: 0 };
  }

  const start = Date.now();
  try {
    // HEAD and GET each get their own AbortController to prevent the
    // shared-timeout bug: if HEAD consumes most of the 10s budget, GET
    // would be aborted almost immediately with a shared controller.
    let response: Response | undefined;
    try {
      const headController = new AbortController();
      const headTimeout = setTimeout(() => headController.abort(), 10000);
      response = await fetch(url, {
        method: 'HEAD',
        headers: HEALTH_CHECK_HEADERS,
        signal: headController.signal,
        redirect: 'follow',
      });
      clearTimeout(headTimeout);
    } catch {
      // HEAD threw a network error — fall through to GET
    }

    // Retry with GET if HEAD failed (network error) or returned non-ok
    // (some sites like WolframAlpha return 404 for HEAD but 200 for GET)
    if (!response || !response.ok) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 10000);
      response = await fetch(url, {
        method: 'GET',
        headers: HEALTH_CHECK_HEADERS,
        signal: getController.signal,
        redirect: 'follow',
      });
      clearTimeout(getTimeout);
    }

    const responseTimeMs = Date.now() - start;

    return {
      isOnline: isReachable(response.status),
      httpStatus: response.status,
      responseTimeMs,
    };
  } catch {
    return {
      isOnline: false,
      httpStatus: null,
      responseTimeMs: null,
    };
  }
}
