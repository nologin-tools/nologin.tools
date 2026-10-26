// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyRegressionSignals, titleIdentityChanged } from '../lab/regression-signals.mjs';
import { selectRollingTargets, recordScan, resolveAnomalies, anomalyQueue, selectRetestTargets } from '../lab/regression-ledger.mjs';
import { dailyReport } from '../lab/evaluation-queue.mjs';
import { isReachable, resolveEffectiveStatus } from '../../src/lib/health-core.mjs';

/** @param {any} overrides */
function inspection(overrides = {}) {
  return {
    inspection: {
      title: 'Squoosh',
      finalUrl: 'https://squoosh.app/',
      error: null,
      initialAuthGate: { blocked: false, reason: null },
      exportGate: { interceptedByAuth: false, hasWatermark: false },
      surface: { hasTextInputs: false, hasFileInputs: true, hasCanvas: false, buttonLabels: ['Paste'], headings: [] },
      ...overrides,
    },
  };
}

describe('classifyRegressionSignals', () => {
  const tool = { url: 'https://squoosh.app/' };

  it('returns no signals for a healthy tool', () => {
    assert.deepEqual(classifyRegressionSignals(inspection(), tool, undefined), []);
  });

  it('flags auth walls and export bait as high severity', () => {
    const r = inspection({
      initialAuthGate: { blocked: true, reason: 'redirect to accounts.google.com' },
      exportGate: { interceptedByAuth: true, authPromptDetails: 'login modal on download' },
    });
    const codes = classifyRegressionSignals(r, tool, undefined).map((s) => `${s.severity}:${s.code}`);
    assert.ok(codes.includes('high:auth_wall'));
    assert.ok(codes.includes('high:export_auth_bait'));
  });

  it('detects trial/paywall copy like the tinywow case', () => {
    const r = inspection({ surface: { hasFileInputs: true, buttonLabels: ['Start 7-Day Free Trial', 'Upload'], headings: [] } });
    const s = classifyRegressionSignals(r, tool, undefined);
    assert.equal(s[0].code, 'paywall_copy');
    assert.equal(s[0].severity, 'medium');
  });

  it('detects "sign in to continue" copy as high severity', () => {
    const r = inspection({ surface: { hasTextInputs: true, buttonLabels: ['Sign in to download'], headings: [] } });
    assert.equal(classifyRegressionSignals(r, tool, undefined)[0].code, 'login_to_continue_copy');
  });

  it('does not flag a plain "Sign in" nav button', () => {
    const r = inspection({ surface: { hasTextInputs: true, buttonLabels: ['Sign in', 'Convert'], headings: [] } });
    assert.deepEqual(classifyRegressionSignals(r, tool, undefined), []);
  });

  it('flags cross-host redirects but ignores www changes', () => {
    assert.equal(
      classifyRegressionSignals(inspection({ finalUrl: 'https://parked-domain.example/' }), tool, undefined)[0].code,
      'cross_host_redirect'
    );
    assert.deepEqual(classifyRegressionSignals(inspection({ finalUrl: 'https://www.squoosh.app/' }), tool, undefined), []);
  });

  it('flags unreachable and missing reports', () => {
    assert.equal(classifyRegressionSignals(inspection({ error: 'net::ERR_NAME_NOT_RESOLVED' }), tool, undefined)[0].code, 'unreachable');
    assert.equal(classifyRegressionSignals(null, tool, undefined)[0].code, 'probe_failed');
  });

  it('flags complete title identity changes against the ledger', () => {
    const s = classifyRegressionSignals(inspection({ title: 'Casino Bonus Offers' }), tool, { lastTitle: 'Squoosh Image Compressor' });
    assert.equal(s[0].code, 'title_changed');
  });

  it('never emits core-task drift suggestions', () => {
    const s = classifyRegressionSignals(inspection(), tool, undefined);
    assert.ok(!s.some((x) => /drift/.test(x.code)));
  });
});

describe('titleIdentityChanged', () => {
  it('keeps related titles', () => {
    assert.equal(titleIdentityChanged('Squoosh', 'Squoosh – image compressor'), false);
  });
  it('detects unrelated titles', () => {
    assert.equal(titleIdentityChanged('JSON Formatter', 'Domain for sale'), true);
  });
});

describe('regression ledger rotation', () => {
  const tools = Array.from({ length: 60 }, (_, i) => ({ slug: `tool-${i}` }));

  it('advances: consecutive runs select disjoint batches', () => {
    /** @type {Record<string, any>} */
    const ledger = {};
    const first = selectRollingTargets(tools, ledger, 20);
    first.forEach((t, i) => recordScan(ledger, t.slug, { signals: [] }, `2026-10-23T00:00:${String(i).padStart(2, '0')}.000Z`));
    const second = selectRollingTargets(tools, ledger, 20);
    const overlap = second.filter((t) => first.some((f) => f.slug === t.slug));
    assert.equal(overlap.length, 0);
  });

  it('covers the full catalog in ceil(n / batch) runs', () => {
    /** @type {Record<string, any>} */
    const ledger = {};
    const seen = new Set();
    for (let day = 0; day < 3; day++) {
      for (const t of selectRollingTargets(tools, ledger, 20)) {
        seen.add(t.slug);
        recordScan(ledger, t.slug, { signals: [] }, `2026-10-${String(23 + day).padStart(2, '0')}T00:00:00.000Z`);
      }
    }
    assert.equal(seen.size, 60);
  });

  it('does not pick never-scanned tools in plain ID order', () => {
    const picked = selectRollingTargets(tools, {}, 5).map((t) => t.slug);
    assert.notDeepEqual(picked, ['tool-0', 'tool-1', 'tool-2', 'tool-3', 'tool-4']);
  });

  it('merges repeated signals and resolves them', () => {
    /** @type {Record<string, any>} */
    const ledger = {};
    const sig = { code: 'paywall_copy', severity: /** @type {'medium'} */ ('medium'), evidence: 'trial' };
    recordScan(ledger, 'a', { signals: [sig] }, '2026-10-22T00:00:00.000Z');
    recordScan(ledger, 'a', { signals: [sig] }, '2026-10-23T00:00:00.000Z');
    recordScan(ledger, 'b', { signals: [{ code: 'auth_wall', severity: 'high', evidence: 'x' }] }, '2026-10-23T00:00:00.000Z');
    assert.equal(ledger.a.openAnomalies[0].seenCount, 2);
    const queue = anomalyQueue(ledger);
    assert.equal(queue[0].slug, 'b', 'high severity first');
    resolveAnomalies(ledger, 'a', { outcome: 'cleared', note: 'trial banner is optional upsell' });
    assert.equal(anomalyQueue(ledger).length, 1);
    assert.equal(ledger.a.lastResolution.outcome, 'cleared');
  });
});

describe('health-core', () => {
  it('treats 403/429/5xx as reachable and 404/410 as gone', () => {
    assert.equal(isReachable(403), true);
    assert.equal(isReachable(503), true);
    assert.equal(isReachable(404), false);
    assert.equal(isReachable(410), false);
  });

  it('resolves effective status with 48h freshness and fast recovery', () => {
    const now = Date.parse('2026-10-23T12:00:00Z');
    const fresh = new Date(now - 3600_000);
    const stale = new Date(now - 49 * 3600_000);
    assert.equal(resolveEffectiveStatus([], now), null);
    assert.equal(resolveEffectiveStatus([{ isOnline: true, checkedAt: stale }], now), null);
    assert.equal(resolveEffectiveStatus([{ isOnline: true, checkedAt: fresh }, { isOnline: false }], now), 'online');
    assert.equal(resolveEffectiveStatus([{ isOnline: false, checkedAt: fresh }, { isOnline: true }], now), 'unstable');
    assert.equal(resolveEffectiveStatus([{ isOnline: false, checkedAt: fresh }, { isOnline: false }], now), 'offline');
  });
});

describe('selectRetestTargets', () => {
  const approved = Array.from({ length: 30 }, (_, i) => ({ slug: `t${i}` }));
  const editorial = Object.fromEntries(approved.map((t, i) => [t.slug, { en: { testedAt: i < 10 ? '2026-09' : '2026-10' } }]));

  it('puts high anomalies first, then medium, then stalest evaluations', () => {
    /** @type {Record<string, any>} */
    const ledger = {};
    recordScan(ledger, 't20', { signals: [{ code: 'paywall_copy', severity: 'medium', evidence: 'trial' }] }, '2026-10-22T00:00:00.000Z');
    recordScan(ledger, 't25', { signals: [{ code: 'auth_wall', severity: 'high', evidence: 'login' }] }, '2026-10-24T00:00:00.000Z');
    const picks = selectRetestTargets(approved, ledger, editorial, 4);
    assert.deepEqual(picks.slice(0, 2).map((p) => `${p.tool.slug}:${p.reason}`), ['t25:high_anomaly', 't20:medium_anomaly']);
    assert.ok(picks.slice(2).every((p) => p.reason === 'stale_evaluation'));
    assert.ok(picks.slice(2).every((p) => Number(p.tool.slug.slice(1)) < 10), 'stalest (2026-09) tools are chosen before 2026-10 ones');
  });

  it('skips anomalies of tools that are no longer approved', () => {
    /** @type {Record<string, any>} */
    const ledger = {};
    recordScan(ledger, 'gone', { signals: [{ code: 'auth_wall', severity: 'high', evidence: 'x' }] });
    const picks = selectRetestTargets(approved, ledger, editorial, 2);
    assert.ok(!picks.some((p) => p.tool.slug === 'gone'));
    assert.equal(picks.length, 2);
  });

  it('rotates: a recent lastDeepEvalAt moves a tool to the back', () => {
    /** @type {Record<string, any>} */
    const ledger = {};
    const first = selectRetestTargets(approved, ledger, editorial, 3);
    for (const f of first) resolveAnomalies(ledger, f.tool.slug, { outcome: 'cleared', note: 'ok' }, '2026-10-26T00:00:00.000Z');
    const second = selectRetestTargets(approved, ledger, editorial, 3);
    assert.equal(second.filter((p) => first.some((f) => f.tool.slug === p.tool.slug)).length, 0);
  });
});

describe('dailyReport quota split', () => {
  it('reports pending and retest quotas independently', () => {
    const report = dailyReport('1999-01-01', new Set(['a']), { items: [{ tier: 'A' }] });
    assert.equal(report.quota.pending, 10);
    assert.equal(report.quota.retest, 3);
    assert.equal(report.quotaMet.retest, false);
    assert.equal(report.pendingEvaluated, 0);
  });
});
