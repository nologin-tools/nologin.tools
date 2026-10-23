// @ts-check
/**
 * Pure health-check semantics shared by the Worker (src/lib/health.ts),
 * the GitHub Actions runner (scripts/run-health-checks.mjs), and tests.
 */

export const HEALTH_TOLERANCE = 5;
export const HEALTH_WINDOW_HOURS = 48;
export const HEALTH_CHECK_USER_AGENT = 'NoLoginTools-HealthChecker/1.0';

/** Status codes that indicate the page is gone (not just blocked). */
const GONE_STATUS_CODES = new Set([404, 410]);

/**
 * Any HTTP response means the server is up, except 404/410 (page gone).
 * @param {number} status
 */
export function isReachable(status) {
  return !GONE_STATUS_CODES.has(status);
}

/**
 * @typedef {'online' | 'unstable' | 'offline'} EffectiveStatus
 * @param {{ isOnline: boolean, checkedAt?: Date | null }[]} checks newest first
 * @param {number} [now]
 * @returns {EffectiveStatus | null}
 */
export function resolveEffectiveStatus(checks, now = Date.now()) {
  if (checks.length === 0) return null;
  if (checks[0]?.checkedAt) {
    const cutoff = now - HEALTH_WINDOW_HOURS * 60 * 60 * 1000;
    if (checks[0].checkedAt.getTime() < cutoff) return null;
  }
  if (checks[0].isOnline) return 'online';
  const onlineCount = checks.filter((c) => c.isOnline).length;
  return onlineCount === 0 ? 'offline' : 'unstable';
}
