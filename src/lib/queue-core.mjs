// @ts-check
import { checkHardGates } from './submission-gates-core.mjs';

export const DAILY_TOTAL_CAPACITY = 10;
export const DAILY_PRIORITY_CAPACITY = 7;
export const DAILY_STANDARD_MIN_CAPACITY = 3;

/**
 * Safely extract clean hostname without www.
 * @param {string | null | undefined} urlStr
 * @returns {string}
 */
export function extractHostname(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return '';
  try {
    return new URL(urlStr).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Normalize a timestamp (Date, unix seconds, unix ms, or ISO string) into ISO 8601 string.
 * @param {Date | number | string | null | undefined} val
 * @returns {string}
 */
export function toIsoString(val) {
  if (!val) return new Date(0).toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'number') {
    const ms = val < 1e12 ? val * 1000 : val;
    return new Date(ms).toISOString();
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? String(val) : d.toISOString();
}

/**
 * Estimate wait days for a 1-based position in either priority or standard lane.
 * @param {'priority' | 'standard'} lane
 * @param {number} position 1-based position in that lane
 * @param {number} priorityQueueCount total items in priority queue
 * @returns {number}
 */
export function estimateWaitDays(lane, position, priorityQueueCount = 0) {
  const pos = Math.max(1, Number(position) || 1);
  if (lane === 'priority') {
    return Math.max(1, Math.ceil(pos / DAILY_PRIORITY_CAPACITY));
  }
  // Standard queue items sit behind priority queue items and share the 10/day evaluation quota
  // (with at least 3 standard items/day guaranteed even during priority surges).
  const totalAhead = Math.max(0, Number(priorityQueueCount) || 0) + pos;
  return Math.max(3, Math.ceil(totalAhead / DAILY_TOTAL_CAPACITY));
}

/**
 * Format localized human-readable ETA labels.
 * @param {number} days
 * @param {'priority' | 'standard'} lane
 * @returns {{ en: string, zh: string }}
 */
export function formatEtaLabel(days, lane) {
  const d = Math.max(1, Number(days) || 1);
  if (lane === 'priority') {
    if (d <= 1) {
      return { en: '~24–48 hours', zh: '预计 24–48 小时内' };
    }
    return {
      en: `~${d}–${d + 1} days`,
      zh: `预计 ${d}–${d + 1} 天`,
    };
  }
  if (d <= 6) {
    return {
      en: `~${d}–${d + 2} days`,
      zh: `预计 ${d}–${d + 2} 天`,
    };
  }
  if (d <= 14) {
    return {
      en: `~1–2 weeks (~${d}d)`,
      zh: `预计 1–2 周（约 ${d} 天）`,
    };
  }
  const weeks = Math.max(2, Math.round(d / 7));
  return {
    en: `~${weeks}–${weeks + 1} weeks (~${d}d)`,
    zh: `预计 ${weeks}–${weeks + 1} 周（约 ${d} 天）`,
  };
}

/**
 * Build the two-lane review queue (Priority Badge Fast-Track vs Standard FIFO)
 * from raw pending tool records.
 *
 * Security & SEO invariant:
 * - Hard-gate violating spam submissions are excluded from public queue display.
 * - Items expose only clean hostname and internal slug, never raw external URLs.
 *
 * @param {Array<{
 *   id: number,
 *   slug: string,
 *   name: string,
 *   url: string,
 *   submittedAt: Date | number | string,
 *   submitterEmail?: string | null,
 *   badgeDisplayType?: string | null,
 *   repoUrl?: string | null,
 * }>} pendingTools
 * @param {{
 *   limit?: number,
 *   lookupQuery?: string | null,
 * }} [options]
 */
export function buildReviewQueue(pendingTools, options = {}) {
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const rawQuery = (options.lookupQuery || '').trim().toLowerCase();

  // Filter out hard-gate violations so spam never pollutes the public board
  const validPending = (pendingTools || []).filter((t) => {
    if (!t || !t.slug || !t.url) return false;
    const violation = checkHardGates({ url: t.url, submitterEmail: t.submitterEmail || null });
    return !violation;
  });

  const normalized = validPending.map((t) => ({
    id: Number(t.id),
    slug: String(t.slug),
    name: String(t.name || t.slug),
    hostname: extractHostname(t.url),
    submittedAt: toIsoString(t.submittedAt),
    hasExplicitBadge: t.badgeDisplayType === 'explicit',
    badgeDisplayType: t.badgeDisplayType || 'none',
    hasRepo: Boolean(t.repoUrl),
  }));

  const sortFifo = (/** @type {any} */ a, /** @type {any} */ b) =>
    String(a.submittedAt).localeCompare(String(b.submittedAt)) || a.id - b.id;

  const rawPriority = normalized.filter((t) => t.hasExplicitBadge).sort(sortFifo);
  const rawStandard = normalized.filter((t) => !t.hasExplicitBadge).sort(sortFifo);

  const priorityCount = rawPriority.length;
  const standardCount = rawStandard.length;

  const nextPriorityPosition = priorityCount + 1;
  const nextPriorityEtaDays = estimateWaitDays('priority', nextPriorityPosition, priorityCount);
  const nextPriorityEtaLabel = formatEtaLabel(nextPriorityEtaDays, 'priority');

  const priorityAll = rawPriority.map((item, idx) => {
    const position = idx + 1;
    const estimatedDays = estimateWaitDays('priority', position, priorityCount);
    return {
      ...item,
      lane: /** @type {'priority'} */ ('priority'),
      position,
      estimatedDays,
      etaLabel: formatEtaLabel(estimatedDays, 'priority'),
      fastTrackJump: null,
    };
  });

  const standardAll = rawStandard.map((item, idx) => {
    const position = idx + 1;
    const estimatedDays = estimateWaitDays('standard', position, priorityCount);
    return {
      ...item,
      lane: /** @type {'standard'} */ ('standard'),
      position,
      estimatedDays,
      etaLabel: formatEtaLabel(estimatedDays, 'standard'),
      fastTrackJump: {
        targetPosition: nextPriorityPosition,
        targetEstimatedDays: nextPriorityEtaDays,
        targetEtaLabel: nextPriorityEtaLabel,
        daysSaved: Math.max(1, estimatedDays - nextPriorityEtaDays),
      },
    };
  });

  // Lookup matching tool by slug, hostname, or name if requested
  let lookup = null;
  if (rawQuery) {
    let cleanQ = rawQuery;
    try {
      if (rawQuery.startsWith('http://') || rawQuery.startsWith('https://')) {
        cleanQ = extractHostname(rawQuery);
      }
    } catch {}
    cleanQ = cleanQ.replace(/^www\./, '');

    const allItems = [...priorityAll, ...standardAll];
    lookup =
      allItems.find((i) => i.slug.toLowerCase() === cleanQ) ||
      allItems.find((i) => i.hostname === cleanQ) ||
      allItems.find(
        (i) =>
          i.slug.toLowerCase().includes(cleanQ) ||
          i.hostname.includes(cleanQ) ||
          i.name.toLowerCase().includes(cleanQ)
      ) ||
      null;
  }

  const standardTailDays = standardCount > 0
    ? estimateWaitDays('standard', standardCount, priorityCount)
    : estimateWaitDays('standard', 1, priorityCount);

  return {
    updatedAt: new Date().toISOString(),
    quota: {
      dailyTotal: DAILY_TOTAL_CAPACITY,
      dailyPriority: DAILY_PRIORITY_CAPACITY,
      dailyStandardMin: DAILY_STANDARD_MIN_CAPACITY,
    },
    summary: {
      priorityCount,
      standardCount,
      totalPending: priorityCount + standardCount,
      nextPriorityPosition,
      nextPriorityEtaDays,
      nextPriorityEtaLabel,
      standardTailEtaDays: standardTailDays,
      standardTailEtaLabel: formatEtaLabel(standardTailDays, 'standard'),
    },
    priorityQueue: priorityAll.slice(0, limit),
    standardQueue: standardAll.slice(0, limit),
    lookup,
  };
}

/**
 * Extract candidate GitHub repository URL (`https://github.com/owner/repo`) from HTML if present.
 * Ignores site-wide/organization links like nologin-tools or generic github routes.
 * @param {string | null | undefined} html
 * @returns {string | null}
 */
export function extractCandidateGitHubRepo(html) {
  if (!html || typeof html !== 'string') return null;
  const re = /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/gi;
  const blockedOwners = new Set([
    'nologin-tools',
    'features',
    'orgs',
    'topics',
    'collections',
    'sponsors',
    'marketplace',
    'apps',
    'login',
    'signup',
    'about',
    'pricing',
    'security',
    'site',
    'settings',
  ]);
  let match;
  while ((match = re.exec(html)) !== null) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/i, '');
    if (!owner || !repo) continue;
    if (blockedOwners.has(owner.toLowerCase())) continue;
    if (['issues', 'pulls', 'discussions', 'releases', 'actions', 'wiki', 'blob', 'tree'].includes(repo.toLowerCase())) {
      continue;
    }
    return `https://github.com/${owner}/${repo}`;
  }
  return null;
}

/**
 * Extract up to `maxScripts` same-origin JS bundle URLs from an SPA shell HTML page.
 * @param {string | null | undefined} html
 * @param {string} baseUrl
 * @param {number} [maxScripts]
 * @returns {string[]}
 */
export function extractSameOriginScriptUrls(html, baseUrl, maxScripts = 2) {
  if (!html || typeof html !== 'string' || !baseUrl) return [];
  let origin = '';
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }
  const re = /<script\b[^>]*\bsrc=["']([^"']+\.m?js(?:\?[^"']*)?)["'][^>]*>/gi;
  /** @type {string[]} */
  const urls = [];
  let m;
  while ((m = re.exec(html)) !== null && urls.length < maxScripts) {
    try {
      const resolved = new URL(m[1], baseUrl);
      if (resolved.origin === origin && !urls.includes(resolved.href)) {
        urls.push(resolved.href);
      }
    } catch {}
  }
  return urls;
}
