#!/usr/bin/env node
// @ts-check
/**
 * Persistent evaluation queue for pending submissions (survives across agent sessions).
 *
 * File: reports/evaluation-queue.json (local operator state, gitignored)
 *   { updatedAt, items: [{ id, slug, url, tier, signals[], submittedAt, addedAt, attempts, lastOutcome? }] }
 *
 * Order: tier A before B, then oldest submission first.
 *
 * CLI:
 *   node scripts/lab/evaluation-queue.mjs status
 *   node scripts/lab/evaluation-queue.mjs next [--limit 10]
 *   node scripts/lab/evaluation-queue.mjs done <id> --outcome <approved|rejected|deferred> --note "<evidence>"
 *   node scripts/lab/evaluation-queue.mjs verify <slug> --decision <approve|reject|clear>   # depth gate; run BEFORE calling the review API
 *   node scripts/lab/evaluation-queue.mjs report [--date YYYY-MM-DD]   # daily quota evidence (only depth-qualified sessions count)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessDepth, summarizeSteps } from './evaluation-depth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
export const QUEUE_PATH = resolve(ROOT, 'reports/evaluation-queue.json');
export const OUTCOME_LOG_DIR = resolve(ROOT, 'reports/evaluations');
export const DAILY_EVALUATION_QUOTA = 10;
export const DAILY_RETEST_QUOTA = 3;

const TIER_RANK = { A: 0, B: 1 };

export function loadQueue(path = QUEUE_PATH) {
  if (!existsSync(path)) return { updatedAt: null, items: [] };
  try {
    const q = JSON.parse(readFileSync(path, 'utf-8'));
    return { updatedAt: q.updatedAt || null, items: Array.isArray(q.items) ? q.items : [] };
  } catch {
    return { updatedAt: null, items: [] };
  }
}

/** @param {{ items: any[] }} queue */
export function saveQueue(queue, path = QUEUE_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  queue.items.sort(compareItems);
  writeFileSync(path, JSON.stringify({ updatedAt: new Date().toISOString(), items: queue.items }, null, 2) + '\n');
}

/** @param {any} a @param {any} b */
export function compareItems(a, b) {
  const badgeA = a.hasExplicitBadge || a.badgeDisplayType === 'explicit' ? 0 : 1;
  const badgeB = b.hasExplicitBadge || b.badgeDisplayType === 'explicit' ? 0 : 1;
  return (
    badgeA - badgeB ||
    (TIER_RANK[/** @type {'A'|'B'} */ (a.tier)] ?? 9) - (TIER_RANK[/** @type {'A'|'B'} */ (b.tier)] ?? 9) ||
    String(a.submittedAt || '').localeCompare(String(b.submittedAt || '')) ||
    a.id - b.id
  );
}

/**
 * Merge triage results (tier A/B only) and drop items that are no longer pending.
 * @param {{ items: any[] }} queue
 * @param {{ id: number, slug: string, url: string, tier: string, hasExplicitBadge?: boolean, badgeDisplayType?: string | null, signals: any[], submittedAt: string }[]} triaged
 * @param {Set<number>} stillPendingIds
 */
export function mergeTriage(queue, triaged, stillPendingIds) {
  const byId = new Map(queue.items.filter((i) => stillPendingIds.has(i.id)).map((i) => [i.id, i]));
  const now = new Date().toISOString();
  for (const t of triaged) {
    if (t.tier !== 'A' && t.tier !== 'B') {
      byId.delete(t.id);
      continue;
    }
    const prev = byId.get(t.id);
    const hasExplicitBadge = Boolean(
      t.hasExplicitBadge ||
      t.badgeDisplayType === 'explicit' ||
      prev?.hasExplicitBadge ||
      prev?.badgeDisplayType === 'explicit'
    );
    byId.set(t.id, {
      id: t.id,
      slug: t.slug,
      url: t.url,
      tier: t.tier,
      hasExplicitBadge,
      signals: t.signals.map((s) => s.code),
      submittedAt: t.submittedAt,
      addedAt: prev?.addedAt || now,
      attempts: prev?.attempts || 0,
      lastOutcome: prev?.lastOutcome || null,
    });
  }
  queue.items = [...byId.values()].sort(compareItems);
  return queue;
}

/**
 * Latest finished-session log entry for a slug on a given day (null when none).
 * @param {string} slug
 * @param {string} [day]
 */
export function latestSession(slug, day = new Date().toISOString().slice(0, 10)) {
  const file = resolve(OUTCOME_LOG_DIR, `${day}.jsonl`);
  if (!existsSync(file)) return null;
  const rows = readFileSync(file, 'utf-8').split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean).filter((r) => r.slug === slug);
  return rows.length ? rows[rows.length - 1] : null;
}

/**
 * Verify that a finished session is deep enough to back a decision.
 * @param {string} slug
 * @param {'approve' | 'reject' | 'clear'} decision
 * @param {string} [day]
 * @returns {{ ok: boolean, failures: string[], session: any }}
 */
export function verifySession(slug, decision, day) {
  const session = latestSession(slug, day);
  if (!session) {
    return { ok: false, session: null, failures: [`No finished dogfood-session for "${slug}" today. Run start -> act -> (export) -> finish first.`] };
  }
  // Logs written before the depth gate existed carry no metrics: they cannot qualify.
  if (!session.metrics) {
    return { ok: false, session, failures: ['This session log predates the depth gate and has no interaction metrics; re-run the evaluation.'] };
  }
  const result = assessDepth(session.metrics, decision, { depth: typeof session.depthScore === 'number' ? session.depthScore : undefined });
  return { ...result, session };
}

/** Slugs of currently approved tools (from build-data.json); empty when the file is absent. */
function approvedSlugs() {
  const path = resolve(ROOT, 'src/data/build-data.json');
  if (!existsSync(path)) return new Set();
  try {
    return new Set((JSON.parse(readFileSync(path, 'utf-8')).tools || []).filter((/** @type {any} */ t) => t.status === 'approved').map((/** @type {any} */ t) => t.slug));
  } catch {
    return new Set();
  }
}

/**
 * Daily quota evidence. A finished session on an already-approved tool is a re-evaluation
 * (retest); any other finished session is a pending-submission evaluation.
 * @param {string} day YYYY-MM-DD
 * @param {Set<string>} [approved] override for tests
 * @param {{ items: any[] }} [queueOverride] override for tests
 */
export function dailyReport(day, approved = approvedSlugs(), queueOverride) {
  const read = (/** @type {string} */ file) =>
    existsSync(file)
      ? readFileSync(file, 'utf-8').split('\n').filter(Boolean).map((l) => {
          try { return JSON.parse(l); } catch { return null; }
        }).filter(Boolean)
      : [];
  const allSessions = read(resolve(OUTCOME_LOG_DIR, `${day}.jsonl`));
  const outcomes = read(resolve(OUTCOME_LOG_DIR, `${day}.outcomes.jsonl`));
  const queue = queueOverride || loadQueue();
  // A session counts only when it passes the depth gate for at least one decision type.
  const qualified = (/** @type {any} */ s) => Boolean(s.metrics) && (s.depth?.approve?.ok || s.depth?.reject?.ok || s.depth?.clear?.ok);
  const sessions = allSessions.filter(qualified);
  const unqualified = allSessions.filter((s) => !qualified(s));
  const slugs = new Set(sessions.map((s) => s.slug));
  const retestSlugs = [...slugs].filter((s) => approved.has(s));
  // Approving a pending tool during the run makes its slug "approved" afterwards, so also
  // count slugs whose outcome today was approved/rejected via the pending queue as pending.
  const pendingOutcomeSlugs = new Set(outcomes.filter((o) => o.slug).map((o) => o.slug));
  const retestDone = retestSlugs.filter((s) => !pendingOutcomeSlugs.has(s)).length;
  const pendingDone = slugs.size - retestDone;
  const pendingNeeded = Math.min(DAILY_EVALUATION_QUOTA, queue.items.length + pendingDone);
  return {
    date: day,
    quota: { pending: DAILY_EVALUATION_QUOTA, retest: DAILY_RETEST_QUOTA },
    browserSessionsFinished: allSessions.length,
    depthQualifiedSessions: sessions.length,
    unqualifiedSessions: unqualified.map((u) => ({ slug: u.slug, reason: u.metrics ? 'failed depth gate' : 'no depth metrics (pre-gate session)' })),
    distinctToolsEvaluated: slugs.size,
    pendingEvaluated: pendingDone,
    retested: retestDone,
    outcomes: {
      approved: outcomes.filter((o) => o.outcome === 'approved').length,
      rejected: outcomes.filter((o) => o.outcome === 'rejected').length,
      deferred: outcomes.filter((o) => o.outcome === 'deferred').length,
    },
    quotaMet: { pending: pendingDone >= pendingNeeded, retest: retestDone >= DAILY_RETEST_QUOTA },
    queueRemaining: queue.items.length,
    queueByTier: { A: queue.items.filter((i) => i.tier === 'A').length, B: queue.items.filter((i) => i.tier === 'B').length },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, ...rest] = process.argv.slice(2);
  /** @param {string} name */
  const opt = (name) => {
    const i = rest.indexOf(name);
    return i !== -1 ? rest[i + 1] : undefined;
  };
  const queue = loadQueue();

  if (cmd === 'status') {
    console.log(JSON.stringify({
      updatedAt: queue.updatedAt,
      total: queue.items.length,
      A: queue.items.filter((i) => i.tier === 'A').length,
      B: queue.items.filter((i) => i.tier === 'B').length,
      deferred: queue.items.filter((i) => i.lastOutcome === 'deferred').length,
    }, null, 2));
  } else if (cmd === 'next') {
    const limit = Number(opt('--limit') || DAILY_EVALUATION_QUOTA);
    console.log(JSON.stringify(queue.items.slice(0, limit), null, 2));
  } else if (cmd === 'done') {
    const id = Number(rest[0]);
    const outcome = opt('--outcome');
    const note = opt('--note');
    if (!id || !outcome || !note || !['approved', 'rejected', 'deferred'].includes(outcome)) {
      console.error('Usage: done <id> --outcome <approved|rejected|deferred> --note "<evidence>"');
      process.exit(1);
    }
    const item = queue.items.find((i) => i.id === id);
    const day = new Date().toISOString().slice(0, 10);
    if (outcome === 'approved' || outcome === 'rejected') {
      const slug = item?.slug || opt('--slug');
      if (!slug) {
        console.error('Cannot verify depth: item is not in the queue. Pass --slug <slug>.');
        process.exit(1);
      }
      const check = verifySession(slug, outcome === 'approved' ? 'approve' : 'reject');
      if (!check.ok) {
        console.error(`Depth gate: "${slug}" cannot be recorded as ${outcome}.`);
        check.failures.forEach((f) => console.error(`  - ${f}`));
        console.error('Continue testing the tool (a new session if the old one is finished) before deciding.');
        process.exit(1);
      }
    }
    mkdirSync(OUTCOME_LOG_DIR, { recursive: true });
    appendFileSync(
      resolve(OUTCOME_LOG_DIR, `${day}.outcomes.jsonl`),
      JSON.stringify({ id, slug: item?.slug || null, outcome, note, at: new Date().toISOString() }) + '\n'
    );
    if (outcome === 'deferred' && item) {
      item.attempts = (item.attempts || 0) + 1;
      item.lastOutcome = 'deferred';
      // Push deferred items behind the rest of their tier.
      item.submittedAt = `9999-${String(item.attempts).padStart(2, '0')}|${item.submittedAt}`;
    } else {
      queue.items = queue.items.filter((i) => i.id !== id);
    }
    saveQueue(queue);
    console.log(`Recorded ${outcome} for ${id}`);
  } else if (cmd === 'verify') {
    const slug = rest[0];
    const decision = opt('--decision');
    if (!slug || !['approve', 'reject', 'clear'].includes(String(decision))) {
      console.error('Usage: verify <slug> --decision <approve|reject|clear>');
      process.exit(1);
    }
    const check = verifySession(slug, /** @type {'approve'|'reject'|'clear'} */ (decision));
    console.log(JSON.stringify({ slug, decision, ok: check.ok, failures: check.failures, metrics: check.session?.metrics || null }, null, 2));
    process.exit(check.ok ? 0 : 1);
  } else if (cmd === 'report') {
    console.log(JSON.stringify(dailyReport(opt('--date') || new Date().toISOString().slice(0, 10)), null, 2));
  } else {
    console.error('Usage: evaluation-queue.mjs <status|next|done|verify|report> ...');
    process.exit(1);
  }
}
