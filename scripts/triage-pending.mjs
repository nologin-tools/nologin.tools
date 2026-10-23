#!/usr/bin/env node
// @ts-check
/**
 * Lightweight triage for pending submissions (HTTP + static HTML analysis, no browser).
 *
 * Purpose: shrink the pending backlog to a deep-evaluation queue. Triage NEVER approves.
 *   - Tier C: likely non-compliant → listed with a suggested reason for agent confirmation
 *   - Tier A/B: merged into reports/evaluation-queue.json for tool-evaluation
 *
 * Usage:
 *   node scripts/triage-pending.mjs                       # triage every pending tool not yet triaged
 *   node scripts/triage-pending.mjs --all                 # re-triage everything pending
 *   node scripts/triage-pending.mjs --ids 1801,1802
 *   node scripts/triage-pending.mjs --reject-ids 1801,1802 [--from reports/triage/<file>.json]
 *       Rejects the given Tier C IDs through POST /api/review using the triage reason.
 *       Only pass IDs whose evidence you have personally confirmed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { queryD1 } from './lib/d1.mjs';
import { ROOT_DIR } from './lib/env.mjs';
import { rejectTool } from './lib/admin-api.mjs';
import { checkHardGates } from '../src/lib/submission-gates-core.mjs';
import { triageSubmission } from './lab/triage-core.mjs';
import { loadQueue, mergeTriage, saveQueue } from './lab/evaluation-queue.mjs';

const TRIAGE_DIR = resolve(ROOT_DIR, 'reports/triage');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 NoLoginTools-Triage/1.0';
const MAX_HTML = 600_000;

const args = process.argv.slice(2);
/** @param {string} name */
const opt = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const idList = (/** @type {string | undefined} */ s) => (s ? s.split(',').map((x) => Number(x.trim())).filter(Boolean) : []);

/** @param {string} url */
async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.8' },
      redirect: 'follow',
      signal: controller.signal,
    });
    let html = '';
    const type = res.headers.get('content-type') || '';
    if (/html|xml|text/i.test(type) && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (html.length < MAX_HTML) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    } else {
      await res.body?.cancel().catch(() => {});
    }
    return { status: res.status, finalUrl: res.url || url, error: null, html };
  } catch (err) {
    const e = /** @type {Error} */ (err);
    return { status: null, finalUrl: null, error: e.name === 'AbortError' ? 'timeout' : e.message, html: null };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @template T, R
 * @param {T[]} items @param {number} limit @param {(item: T) => Promise<R>} fn
 */
async function mapPool(items, limit, fn) {
  /** @type {R[]} */
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    })
  );
  return out;
}

function latestTriageFile() {
  if (!existsSync(TRIAGE_DIR)) return null;
  const files = readdirSync(TRIAGE_DIR).filter((f) => /^triage-.*\.json$/.test(f)).sort();
  return files.length ? resolve(TRIAGE_DIR, files[files.length - 1]) : null;
}

function triagedIds() {
  const ids = new Set();
  if (!existsSync(TRIAGE_DIR)) return ids;
  for (const f of readdirSync(TRIAGE_DIR).filter((x) => /^triage-.*\.json$/.test(x))) {
    try {
      for (const r of JSON.parse(readFileSync(resolve(TRIAGE_DIR, f), 'utf-8')).results || []) ids.add(r.id);
    } catch {}
  }
  return ids;
}

async function rejectConfirmed() {
  const ids = idList(opt('--reject-ids'));
  const file = opt('--from') || latestTriageFile();
  if (!file || !existsSync(file)) {
    console.error('No triage file found. Run triage first.');
    process.exit(1);
  }
  const results = JSON.parse(readFileSync(file, 'utf-8')).results || [];
  const pending = new Set((await queryD1("SELECT id FROM tools WHERE status = 'pending'")).map((r) => r.id));
  let ok = 0;
  const failures = [];
  for (const id of ids) {
    const r = results.find((x) => x.id === id);
    if (!r || r.tier !== 'C' || !r.suggestedReason) {
      failures.push({ id, error: 'not a Tier C result with a suggested reason in this triage file' });
      continue;
    }
    if (!pending.has(id)) {
      failures.push({ id, error: 'no longer pending' });
      continue;
    }
    try {
      await rejectTool(id, r.suggestedReason);
      ok++;
      console.log(`  ✓ [${id}] ${r.slug}: ${r.suggestedReason}`);
    } catch (err) {
      failures.push({ id, error: /** @type {Error} */ (err).message });
    }
    await new Promise((res) => setTimeout(res, 150));
  }
  console.log(`\nRejected ${ok}/${ids.length}`);
  for (const f of failures) console.log(`  ✗ [${f.id}] ${f.error}`);
  if (failures.length) process.exit(1);
}

async function main() {
  if (opt('--reject-ids')) return rejectConfirmed();

  const pendingRows = await queryD1(
    "SELECT id, slug, url, submitter_email, datetime(submitted_at, 'unixepoch') AS submitted_at FROM tools WHERE status = 'pending' ORDER BY submitted_at ASC"
  );
  const pendingIds = new Set(pendingRows.map((r) => r.id));
  const explicit = idList(opt('--ids'));
  const already = args.includes('--all') ? new Set() : triagedIds();
  const targets = pendingRows.filter((r) => (explicit.length ? explicit.includes(r.id) : !already.has(r.id)));
  console.log(`[triage] ${pendingRows.length} pending, triaging ${targets.length}`);

  let done = 0;
  const results = await mapPool(targets, Number(opt('--concurrency') || 8), async (t) => {
    const gate = checkHardGates({ url: t.url, submitterEmail: t.submitter_email });
    let out;
    if (gate) {
      out = { tier: 'C', signals: [{ code: gate.code, detail: gate.reason }], suggestedReason: gate.reason, page: null, fetch: null };
    } else {
      const fetched = await fetchPage(t.url);
      const r = triageSubmission(t, fetched);
      out = {
        ...r,
        page: r.page ? { title: r.page.title, metaDescription: r.page.metaDescription, headings: r.page.headings.slice(0, 5), buttons: r.page.buttons.slice(0, 8), wordCount: r.page.wordCount } : null,
        fetch: { status: fetched.status, finalUrl: fetched.finalUrl, error: fetched.error },
      };
    }
    done++;
    if (done % 25 === 0 || done === targets.length) console.log(`[triage] ${done}/${targets.length}`);
    return { id: t.id, slug: t.slug, url: t.url, submittedAt: t.submitted_at, ...out };
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  mkdirSync(TRIAGE_DIR, { recursive: true });
  const jsonPath = resolve(TRIAGE_DIR, `triage-${stamp}.json`);
  writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2) + '\n');

  const queue = mergeTriage(loadQueue(), results, pendingIds);
  saveQueue(queue);

  const byTier = { A: results.filter((r) => r.tier === 'A'), B: results.filter((r) => r.tier === 'B'), C: results.filter((r) => r.tier === 'C') };
  const md = [
    `# Pending triage ${new Date().toISOString().slice(0, 10)}`,
    '',
    `Triaged ${results.length} · A ${byTier.A.length} · B ${byTier.B.length} · C ${byTier.C.length}`,
    `Evaluation queue now holds ${queue.items.length} items.`,
    '',
    '## Tier C — confirm evidence, then reject',
    '',
    '`node scripts/triage-pending.mjs --reject-ids <id,id,...>`',
    '',
    '| ID | Slug | Suggested reason | Title |',
    '|---|---|---|---|',
    ...byTier.C.map((r) => `| ${r.id} | [${r.slug}](${r.url}) | ${String(r.suggestedReason).replace(/\|/g, '/')} | ${(r.page?.title || r.fetch?.error || '').replace(/\|/g, '/').slice(0, 80)} |`),
    '',
    '## Tier A — queued first',
    '',
    ...byTier.A.map((r) => `- ${r.id} [${r.slug}](${r.url}) — ${(r.page?.title || '').slice(0, 80)}`),
    '',
    '## Tier B — queued after A',
    '',
    ...byTier.B.map((r) => `- ${r.id} [${r.slug}](${r.url}) — ${r.signals.map((s) => s.code).join(', ')}`),
    '',
  ].join('\n');
  const mdPath = jsonPath.replace(/\.json$/, '.md');
  writeFileSync(mdPath, md);

  console.log(`\n[triage] A ${byTier.A.length} · B ${byTier.B.length} · C ${byTier.C.length}`);
  console.log(`[triage] Report: ${mdPath}`);
  console.log(`[triage] Queue:  ${queue.items.length} items (reports/evaluation-queue.json)`);
}

main().catch((err) => {
  console.error('[triage] Fatal:', err);
  process.exit(1);
});
