#!/usr/bin/env node
// @ts-check
/**
 * Regression ledger: persistent rotation + anomaly state for approved tools.
 *
 * File: src/data/regression-ledger.json (committed)
 *   { "<slug>": { lastScanAt, lastTitle, lastSignals[], openAnomalies[], lastDeepEvalAt, lastResolution } }
 *
 * Why: the rolling scan previously sorted by editorial `testedAt`, which only has month
 * precision ("2026-09") and is never updated by the scan, so the same 20 tools were selected
 * every day. The ledger records every scan so rotation always advances.
 *
 * CLI:
 *   node scripts/lab/regression-ledger.mjs status                 # coverage summary
 *   node scripts/lab/regression-ledger.mjs queue [--limit N]      # open anomalies, most urgent first
 *   node scripts/lab/regression-ledger.mjs resolve <slug> --outcome <cleared|rejected|editorial-updated> --note "<text>"
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const LEDGER_PATH = resolve(__dirname, '../../src/data/regression-ledger.json');

const SEVERITY_RANK = { high: 0, medium: 1 };

/** @returns {Record<string, any>} */
export function loadLedger(path = LEDGER_PATH) {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

/** @param {Record<string, any>} ledger */
export function saveLedger(ledger, path = LEDGER_PATH) {
  const sorted = Object.fromEntries(Object.keys(ledger).sort().map((k) => [k, ledger[k]]));
  writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
}

/**
 * Deterministic but well-mixed tiebreak so never-scanned tools are not always taken
 * in database ID order.
 * @param {string} s
 */
function stableHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Select the next batch: never-scanned first (hash-mixed), then oldest lastScanAt.
 * @template {{ slug: string }} T
 * @param {T[]} tools
 * @param {Record<string, any>} ledger
 * @param {number} limit
 * @returns {T[]}
 */
export function selectRollingTargets(tools, ledger, limit) {
  return tools
    .slice()
    .sort((a, b) => {
      const la = ledger[a.slug]?.lastScanAt || '';
      const lb = ledger[b.slug]?.lastScanAt || '';
      if (!la && lb) return -1;
      if (la && !lb) return 1;
      if (la !== lb) return la.localeCompare(lb);
      return stableHash(a.slug) - stableHash(b.slug);
    })
    .slice(0, limit);
}

/**
 * Record a scan result and merge signals into open anomalies.
 * @param {Record<string, any>} ledger
 * @param {string} slug
 * @param {{ title?: string | null, signals: {code: string, severity: 'high'|'medium', evidence: string}[], evidencePaths?: string[] }} scan
 * @param {string} [nowIso]
 */
export function recordScan(ledger, slug, scan, nowIso = new Date().toISOString()) {
  const entry = ledger[slug] || { openAnomalies: [] };
  entry.lastScanAt = nowIso;
  if (scan.title) entry.lastTitle = scan.title;
  entry.lastSignals = scan.signals.map((s) => s.code);
  entry.openAnomalies = entry.openAnomalies || [];
  for (const s of scan.signals) {
    const existing = entry.openAnomalies.find((/** @type {any} */ a) => a.code === s.code);
    if (existing) {
      existing.lastSeenAt = nowIso;
      existing.evidence = s.evidence;
      existing.seenCount = (existing.seenCount || 1) + 1;
      if (scan.evidencePaths) existing.evidencePaths = scan.evidencePaths;
    } else {
      entry.openAnomalies.push({
        code: s.code,
        severity: s.severity,
        evidence: s.evidence,
        firstSeenAt: nowIso,
        lastSeenAt: nowIso,
        seenCount: 1,
        evidencePaths: scan.evidencePaths || [],
      });
    }
  }
  ledger[slug] = entry;
  return entry;
}

/**
 * Close all open anomalies after a completed deep evaluation or review action.
 * @param {Record<string, any>} ledger
 * @param {string} slug
 * @param {{ outcome: string, note: string }} resolution
 * @param {string} [nowIso]
 */
export function resolveAnomalies(ledger, slug, resolution, nowIso = new Date().toISOString()) {
  const entry = ledger[slug] || {};
  entry.lastDeepEvalAt = nowIso;
  entry.lastResolution = { ...resolution, at: nowIso, closed: (entry.openAnomalies || []).map((/** @type {any} */ a) => a.code) };
  entry.openAnomalies = [];
  ledger[slug] = entry;
  return entry;
}

/**
 * Open anomalies ordered by severity, then oldest first-seen.
 * @param {Record<string, any>} ledger
 */
export function anomalyQueue(ledger) {
  /** @type {{ slug: string, severity: 'high'|'medium', codes: string[], firstSeenAt: string, evidence: string[] }[]} */
  const rows = [];
  for (const [slug, entry] of Object.entries(ledger)) {
    const open = entry.openAnomalies || [];
    if (open.length === 0) continue;
    const severity = open.some((/** @type {any} */ a) => a.severity === 'high') ? 'high' : 'medium';
    rows.push({
      slug,
      severity,
      codes: open.map((/** @type {any} */ a) => a.code),
      firstSeenAt: open.map((/** @type {any} */ a) => a.firstSeenAt).sort()[0],
      evidence: open.map((/** @type {any} */ a) => `${a.code}: ${a.evidence}`),
    });
  }
  return rows.sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.firstSeenAt.localeCompare(b.firstSeenAt)
  );
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, ...rest] = process.argv.slice(2);
  const ledger = loadLedger();
  /** @param {string} name */
  const opt = (name) => {
    const i = rest.indexOf(name);
    return i !== -1 ? rest[i + 1] : undefined;
  };

  if (cmd === 'status') {
    const buildPath = resolve(__dirname, '../../src/data/build-data.json');
    const approved = existsSync(buildPath)
      ? (JSON.parse(readFileSync(buildPath, 'utf-8')).tools || []).filter((/** @type {any} */ t) => t.status === 'approved')
      : [];
    const now = Date.now();
    const age = (/** @type {string} */ iso) => (now - new Date(iso).getTime()) / 86400000;
    const scanned = approved.filter((/** @type {any} */ t) => ledger[t.slug]?.lastScanAt);
    const within = (/** @type {number} */ d) => scanned.filter((/** @type {any} */ t) => age(ledger[t.slug].lastScanAt) <= d).length;
    const queue = anomalyQueue(ledger);
    console.log(
      JSON.stringify(
        {
          approved: approved.length,
          everScanned: scanned.length,
          scannedWithin7d: within(7),
          scannedWithin21d: within(21),
          neverScanned: approved.length - scanned.length,
          openAnomalies: { high: queue.filter((q) => q.severity === 'high').length, medium: queue.filter((q) => q.severity === 'medium').length },
        },
        null,
        2
      )
    );
  } else if (cmd === 'queue') {
    const limit = Number(opt('--limit') || 50);
    console.log(JSON.stringify(anomalyQueue(ledger).slice(0, limit), null, 2));
  } else if (cmd === 'resolve') {
    const slug = rest[0];
    const outcome = opt('--outcome');
    const note = opt('--note');
    if (!slug || !outcome || !note || !['cleared', 'rejected', 'editorial-updated'].includes(outcome)) {
      console.error('Usage: resolve <slug> --outcome <cleared|rejected|editorial-updated> --note "<evidence-backed note>"');
      process.exit(1);
    }
    resolveAnomalies(ledger, slug, { outcome, note });
    saveLedger(ledger);
    console.log(`Resolved ${slug} (${outcome})`);
  } else {
    console.error('Usage: regression-ledger.mjs <status|queue|resolve> ...');
    process.exit(1);
  }
}
