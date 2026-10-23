#!/usr/bin/env node
// @ts-check
/**
 * Full-catalog liveness checks (replaces the deleted Cloudflare cron worker and the
 * 30-tools-per-day agent patrol, which could not keep 313 tools inside the 48h window).
 *
 * Runs in GitHub Actions twice daily (.github/workflows/health-check.yml) and locally.
 * Writes are append-only observations into `health_checks`; `tools.status` is never touched.
 *
 * Usage:
 *   node scripts/run-health-checks.mjs                     # all approved tools
 *   node scripts/run-health-checks.mjs --status pending    # pending queue (triage support)
 *   node scripts/run-health-checks.mjs --limit 20 --dry-run
 *   node scripts/run-health-checks.mjs --concurrency 8 --report reports/tmp/health.json
 */
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { queryD1 } from './lib/d1.mjs';
import { ROOT_DIR } from './lib/env.mjs';
import {
  HEALTH_CHECK_USER_AGENT,
  HEALTH_TOLERANCE,
  isReachable,
  resolveEffectiveStatus,
} from '../src/lib/health-core.mjs';

const args = process.argv.slice(2);
/** @param {string} name @param {string} [fallback] */
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const STATUS = opt('--status', 'approved');
const LIMIT = Number(opt('--limit', '0')) || 0;
const CONCURRENCY = Number(opt('--concurrency', '8')) || 8;
const TIMEOUT_MS = Number(opt('--timeout', '10000')) || 10000;
const DRY_RUN = args.includes('--dry-run');
const REPORT = opt('--report', resolve(ROOT_DIR, 'reports/tmp/health-latest.json'));
const SITE_HOST = 'nologin.tools';

if (!['approved', 'pending'].includes(String(STATUS))) {
  console.error('--status must be approved or pending');
  process.exit(1);
}

/**
 * @param {string} url
 * @param {'HEAD' | 'GET'} method
 */
async function timedFetch(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers: { 'User-Agent': HEALTH_CHECK_USER_AGENT },
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HEAD first, GET fallback on error or non-ok (mirrors src/lib/health.ts checkHealth).
 * @param {string} url
 * @returns {Promise<{ isOnline: boolean, httpStatus: number | null, responseTimeMs: number | null, finalUrl: string | null, error: string | null }>}
 */
async function checkOne(url) {
  try {
    if (new URL(url).hostname.replace(/^www\./, '') === SITE_HOST) {
      return { isOnline: true, httpStatus: 200, responseTimeMs: 0, finalUrl: url, error: null };
    }
  } catch {
    return { isOnline: false, httpStatus: null, responseTimeMs: null, finalUrl: null, error: 'invalid_url' };
  }
  const start = Date.now();
  let response;
  try {
    response = await timedFetch(url, 'HEAD');
  } catch {
    response = undefined;
  }
  try {
    if (!response || !response.ok) response = await timedFetch(url, 'GET');
    // Drain body to release the socket.
    await response.body?.cancel().catch(() => {});
    return {
      isOnline: isReachable(response.status),
      httpStatus: response.status,
      responseTimeMs: Date.now() - start,
      finalUrl: response.url || url,
      error: null,
    };
  } catch (err) {
    return {
      isOnline: false,
      httpStatus: null,
      responseTimeMs: null,
      finalUrl: null,
      error: err instanceof Error ? (err.name === 'AbortError' ? 'timeout' : err.message) : String(err),
    };
  }
}

/**
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 */
async function mapPool(items, limit, fn) {
  /** @type {R[]} */
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

/** @param {string} a @param {string | null} b */
function hostChanged(a, b) {
  if (!b) return false;
  try {
    const ha = new URL(a).hostname.replace(/^www\./, '');
    const hb = new URL(b).hostname.replace(/^www\./, '');
    return ha !== hb;
  } catch {
    return false;
  }
}

async function main() {
  const startedAt = new Date();
  const tools = await queryD1(
    `SELECT id, slug, url FROM tools WHERE status = ? ORDER BY id ASC${LIMIT ? ` LIMIT ${LIMIT}` : ''}`,
    [STATUS]
  );
  console.log(`[health] Checking ${tools.length} ${STATUS} tools (concurrency ${CONCURRENCY}, timeout ${TIMEOUT_MS}ms)`);

  let done = 0;
  const results = await mapPool(tools, CONCURRENCY, async (t) => {
    const r = await checkOne(t.url);
    done++;
    if (done % 25 === 0 || done === tools.length) console.log(`[health] ${done}/${tools.length}`);
    return { ...t, ...r, checkedAt: Math.floor(Date.now() / 1000) };
  });

  if (!DRY_RUN && results.length > 0) {
    const CHUNK = 50;
    for (let i = 0; i < results.length; i += CHUNK) {
      const rows = results.slice(i, i + CHUNK).map(
        (r) =>
          `(${Number(r.id)}, ${r.isOnline ? 1 : 0}, ${r.httpStatus ?? 'NULL'}, ${r.responseTimeMs ?? 'NULL'}, ${r.checkedAt})`
      );
      await queryD1(
        `INSERT INTO health_checks (tool_id, is_online, http_status, response_time_ms, checked_at) VALUES ${rows.join(', ')}`
      );
    }
    console.log(`[health] Recorded ${results.length} observations in health_checks`);
  } else {
    console.log('[health] Dry run: nothing written');
  }

  // Derive effective status from the latest HEALTH_TOLERANCE checks for every tool checked.
  const history = DRY_RUN
    ? []
    : await queryD1(
        `SELECT tool_id, is_online, checked_at FROM (
           SELECT h.tool_id, h.is_online, h.checked_at,
                  ROW_NUMBER() OVER (PARTITION BY h.tool_id ORDER BY h.checked_at DESC) AS rn
           FROM health_checks h JOIN tools t ON t.id = h.tool_id
           WHERE t.status = ?
         ) WHERE rn <= ${HEALTH_TOLERANCE}`,
        [STATUS]
      );
  /** @type {Map<number, {isOnline: boolean, checkedAt: Date}[]>} */
  const byTool = new Map();
  for (const h of history) {
    if (!byTool.has(h.tool_id)) byTool.set(h.tool_id, []);
    byTool.get(h.tool_id)?.push({ isOnline: !!h.is_online, checkedAt: new Date(h.checked_at * 1000) });
  }

  const enriched = results.map((r) => {
    const checks = (byTool.get(r.id) || []).sort((a, b) => b.checkedAt.getTime() - a.checkedAt.getTime());
    const effective = DRY_RUN ? (r.isOnline ? 'online' : 'offline') : resolveEffectiveStatus(checks);
    return { ...r, effectiveStatus: effective, crossHostRedirect: hostChanged(r.url, r.finalUrl) };
  });

  const counts = { online: 0, unstable: 0, offline: 0, none: 0 };
  for (const r of enriched) counts[/** @type {'online'|'unstable'|'offline'} */ (r.effectiveStatus) || 'none']++;
  const offline = enriched.filter((r) => !r.isOnline);
  const redirects = enriched.filter((r) => r.crossHostRedirect);

  const report = {
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    status: STATUS,
    checked: results.length,
    written: DRY_RUN ? 0 : results.length,
    rawOnline: results.filter((r) => r.isOnline).length,
    rawOffline: offline.length,
    effective: counts,
    offline: offline.map(({ id, slug, url, httpStatus, error, effectiveStatus }) => ({ id, slug, url, httpStatus, error, effectiveStatus })),
    crossHostRedirects: redirects.map(({ id, slug, url, finalUrl }) => ({ id, slug, url, finalUrl })),
  };

  const reportPath = String(REPORT);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

  const summary = [
    `## Health check (${STATUS})`,
    '',
    `- Checked: **${report.checked}** (written: ${report.written})`,
    `- Raw: ${report.rawOnline} online / ${report.rawOffline} offline`,
    `- Effective: ${counts.online} online · ${counts.unstable} unstable · ${counts.offline} offline · ${counts.none} no status`,
    `- Cross-host redirects: ${redirects.length}`,
    '',
    ...(offline.length
      ? ['| Tool | HTTP | Error | Effective |', '|---|---|---|---|', ...offline.map((o) => `| ${o.slug} | ${o.httpStatus ?? '-'} | ${o.error ?? '-'} | ${report.offline.find((x) => x.id === o.id)?.effectiveStatus ?? '-'} |`)]
      : ['No offline observations.']),
  ].join('\n');
  console.log('\n' + summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  console.log(`\n[health] Report: ${reportPath}`);
}

main().catch((err) => {
  console.error('[health] Fatal:', err);
  process.exit(1);
});
