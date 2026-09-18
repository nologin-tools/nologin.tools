import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mergeObservedPayloads, summarizeObservedEgress } from '../lab/dogfood-session.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SESSION_SCRIPT = resolve(ROOT, 'scripts/lab/dogfood-session.mjs');

describe('CADES 2.0 Route A: Humanoid Dogfooding Session CLI', () => {
  it('prints comprehensive help message with all subcommands', () => {
    const res = spawnSync(process.execPath, [SESSION_SCRIPT, '--help'], { encoding: 'utf-8' });
    assert.equal(res.status, 0);
    assert.ok(res.stdout.includes('start <URL>'));
    assert.ok(res.stdout.includes('act <slug>'));
    assert.ok(res.stdout.includes('export <slug>'));
    assert.ok(res.stdout.includes('finish <slug>'));
    assert.ok(res.stdout.includes('status <slug>'));
    assert.ok(res.stdout.includes('abort <slug>'));
  });

  it('rejects start command without URL', () => {
    const res = spawnSync(process.execPath, [SESSION_SCRIPT, 'start'], { encoding: 'utf-8' });
    assert.notEqual(res.status, 0);
    assert.ok(res.stderr.includes('requires a target URL'));
  });

  it('reports no active session when querying unknown slug', () => {
    const res = spawnSync(process.execPath, [SESSION_SCRIPT, 'status', 'unknown-probe-slug-1234'], { encoding: 'utf-8' });
    assert.equal(res.status, 0);
    assert.ok(res.stdout.includes('No active session found'));
  });

  it('rejects act and export commands when no session exists', () => {
    const actRes = spawnSync(process.execPath, [SESSION_SCRIPT, 'act', 'nonexistent-tool', '--click', 'Go'], { encoding: 'utf-8' });
    assert.ok(actRes.stderr.includes('No active session found'));

    const exportRes = spawnSync(process.execPath, [SESSION_SCRIPT, 'export', 'nonexistent-tool'], { encoding: 'utf-8' });
    assert.ok(exportRes.stderr.includes('No active session found'));
  });

  it('documents stress fixtures and allow-shallow flag in help output', () => {
    const res = spawnSync(process.execPath, [SESSION_SCRIPT, '--help'], { encoding: 'utf-8' });
    assert.ok(res.stdout.includes('malformed-json'));
    assert.ok(res.stdout.includes('corrupted-png'));
    assert.ok(res.stdout.includes('heavy-svg'));
    assert.ok(res.stdout.includes('--allow-shallow'));
  });

  it('triggers anti-slacking guardrail when finishing session with 0 interactions', () => {
    const testSlug = 'anti-slack-probe-' + Date.now();
    const sessionFile = join(tmpdir(), `cades-session-${testSlug}.json`);
    const mockSession = {
      slug: testSlug,
      targetUrl: 'https://example.com',
      spaceId: 'mock-space-id',
      startedAt: Date.now(),
      steps: [
        { step: 1, type: 'start', screenshot: '/tmp/test.png', url: 'https://example.com' }
      ],
      uxTelemetry: { longTasksCount: 0, maxLongTaskDuration: 0, clsScore: 0 }
    };

    writeFileSync(sessionFile, JSON.stringify(mockSession), 'utf-8');

    try {
      // Running finish without --allow-shallow should trigger anti-slacking guardrail
      const finishRes = spawnSync(process.execPath, [SESSION_SCRIPT, 'finish', testSlug], { encoding: 'utf-8' });
      assert.ok(finishRes.stderr.includes('Anti-Slacking Guardrail') || finishRes.stdout.includes('Anti-Slacking Guardrail'));
      assert.ok(finishRes.stderr.includes('0 interactive user steps') || finishRes.stdout.includes('0 interactive user steps'));
    } finally {
      try { unlinkSync(sessionFile); } catch {}
    }
  });

  it('does not treat a failed interaction record as satisfying the guardrail', () => {
    const testSlug = 'failed-action-probe-' + Date.now();
    const sessionFile = join(tmpdir(), `cades-session-${testSlug}.json`);
    writeFileSync(sessionFile, JSON.stringify({
      slug: testSlug,
      targetUrl: 'https://example.com',
      spaceId: 'mock-space-id',
      startedAt: Date.now(),
      steps: [
        { step: 1, type: 'start', screenshot: '/tmp/test.png', url: 'https://example.com' },
        { step: 2, type: 'act', performed: false, summary: 'Element not found' }
      ]
    }), 'utf-8');

    try {
      const res = spawnSync(process.execPath, [SESSION_SCRIPT, 'finish', testSlug], { encoding: 'utf-8' });
      assert.notEqual(res.status, 0);
      assert.match(res.stdout + res.stderr, /0 interactive user steps/);
    } finally {
      try { unlinkSync(sessionFile); } catch {}
    }
  });

  it('rejects an invalid eval before closing or synchronizing the session', () => {
    const testSlug = 'invalid-eval-probe-' + Date.now();
    const sessionFile = join(tmpdir(), `cades-session-${testSlug}.json`);
    const evalFile = join(tmpdir(), `invalid-eval-${testSlug}.json`);
    writeFileSync(sessionFile, JSON.stringify({
      slug: testSlug,
      targetUrl: 'https://example.com',
      spaceId: 'mock-space-id',
      startedAt: Date.now(),
      steps: [
        { step: 1, type: 'start', screenshot: '/tmp/test.png', url: 'https://example.com' },
        { step: 2, type: 'act', performed: true, summary: 'Filled textarea' }
      ]
    }), 'utf-8');
    writeFileSync(evalFile, JSON.stringify({ productScore: { overall: 99 } }), 'utf-8');

    try {
      const res = spawnSync(process.execPath, [SESSION_SCRIPT, 'finish', testSlug, '--eval', evalFile, '--sync'], { encoding: 'utf-8' });
      assert.notEqual(res.status, 0);
      assert.match(res.stdout + res.stderr, /validation failed/);
      assert.equal(existsSync(sessionFile), true, 'invalid eval must leave the browser session available for correction');
    } finally {
      try { unlinkSync(sessionFile); } catch {}
      try { unlinkSync(evalFile); } catch {}
    }
  });

  it('reports observed egress conservatively', () => {
    assert.deepEqual(summarizeObservedEgress([]), {
      outgoingPayloadCount: 0,
      observed: false,
      classification: 'No Payload Egress Observed (not proof of local-only processing)'
    });
    assert.equal(summarizeObservedEgress([{ type: 'fetch' }]).observed, true);
  });

  it('preserves payload observations across actions without duplicating persisted events', () => {
    const first = { type: 'fetch', method: 'POST', url: '/process', timestamp: 1 };
    const second = { type: 'beacon', method: 'POST', url: '/metrics', timestamp: 2 };
    assert.deepEqual(mergeObservedPayloads([first], [first, second]), [first, second]);
  });
});
