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
 *   node scripts/lab/evaluation-queue.mjs report [--date YYYY-MM-DD]   # daily quota evidence
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
export const QUEUE_PATH = resolve(ROOT, 'reports/evaluation-queue.json');
export const OUTCOME_LOG_DIR = resolve(ROOT, 'reports/evaluations');
export const DAILY_EVALUATION_QUOTA = 10;

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
  return (
    (TIER_RANK[/** @type {'A'|'B'} */ (a.tier)] ?? 9) - (TIER_RANK[/** @type {'A'|'B'} */ (b.tier)] ?? 9) ||
    String(a.submittedAt || '').localeCompare(String(b.submittedAt || '')) ||
    a.id - b.id
  );
}

/**
 * Merge triage results (tier A/B only) and drop items that are no longer pending.
 * @param {{ items: any[] }} queue
 * @param {{ id: number, slug: string, url: string, tier: string, signals: any[], submittedAt: string }[]} triaged
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
    byId.set(t.id, {
      id: t.id,
      slug: t.slug,
      url: t.url,
      tier: t.tier,
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
 * @param {string} day YYYY-MM-DD
 */
export function dailyReport(day) {
  const read = (/** @type {string} */ file) =>
    existsSync(file)
      ? readFileSync(file, 'utf-8').split('\n').filter(Boolean).map((l) => {
          try { return JSON.parse(l); } catch { return null; }
        }).filter(Boolean)
      : [];
  const sessions = read(resolve(OUTCOME_LOG_DIR, `${day}.jsonl`));
  const outcomes = read(resolve(OUTCOME_LOG_DIR, `${day}.outcomes.jsonl`));
  const queue = loadQueue();
  return {
    date: day,
    quota: DAILY_EVALUATION_QUOTA,
    browserSessionsFinished: sessions.length,
    distinctToolsEvaluated: new Set(sessions.map((s) => s.slug)).size,
    outcomes: {
      approved: outcomes.filter((o) => o.outcome === 'approved').length,
      rejected: outcomes.filter((o) => o.outcome === 'rejected').length,
      deferred: outcomes.filter((o) => o.outcome === 'deferred').length,
    },
    quotaMet: new Set(sessions.map((s) => s.slug)).size >= Math.min(DAILY_EVALUATION_QUOTA, queue.items.length + sessions.length),
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
  } else if (cmd === 'report') {
    console.log(JSON.stringify(dailyReport(opt('--date') || new Date().toISOString().slice(0, 10)), null, 2));
  } else {
    console.error('Usage: evaluation-queue.mjs <status|next|done|report> ...');
    process.exit(1);
  }
}
