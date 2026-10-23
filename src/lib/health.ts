import {
  HEALTH_CHECK_USER_AGENT,
  HEALTH_TOLERANCE as CORE_HEALTH_TOLERANCE,
  HEALTH_WINDOW_HOURS as CORE_HEALTH_WINDOW_HOURS,
  isReachable as coreIsReachable,
  resolveEffectiveStatus as coreResolveEffectiveStatus,
} from './health-core.mjs';

export type EffectiveStatus = 'online' | 'unstable' | 'offline';

export interface HealthCheckResult {
  isOnline: boolean;
  httpStatus: number | null;
  responseTimeMs: number | null;
}

const HEALTH_CHECK_HEADERS = {
  'User-Agent': HEALTH_CHECK_USER_AGENT,
};

export const HEALTH_TOLERANCE: number = CORE_HEALTH_TOLERANCE;
export const HEALTH_WINDOW_HOURS: number = CORE_HEALTH_WINDOW_HOURS;

/** Returns true if the HTTP status indicates the server is reachable (anything but 404/410). */
export function isReachable(status: number): boolean {
  return coreIsReachable(status);
}

/**
 * Three-level effective status from the latest checks (newest first).
 * Semantics live in health-core.mjs so the GitHub Actions runner and tests share them.
 */
export function resolveEffectiveStatus(
  checks: { isOnline: boolean; checkedAt?: Date | null }[]
): EffectiveStatus | null {
  return coreResolveEffectiveStatus(checks);
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
