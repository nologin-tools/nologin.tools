// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeHtml, triageSubmission } from '../lab/triage-core.mjs';
import { mergeTriage, compareItems } from '../lab/evaluation-queue.mjs';

const ok = (/** @type {string} */ html, finalUrl = 'https://tool.example/') => ({ status: 200, finalUrl, error: null, html });
const tool = { url: 'https://tool.example/' };

describe('analyzeHtml', () => {
  it('extracts title, controls, and ignores hidden/search inputs', () => {
    const p = analyzeHtml(`<title> JSON Formatter </title><h1>Format JSON</h1>
      <input type="hidden"><input type="search"><textarea></textarea><button>Format</button>`);
    assert.equal(p.title, 'JSON Formatter');
    assert.equal(p.textareaCount, 1);
    assert.equal(p.meaningfulInputCount, 0);
    assert.deepEqual(p.buttons, ['Format']);
  });
});

describe('triageSubmission', () => {
  it('Tier A for an interactive tool page', () => {
    const r = triageSubmission(tool, ok('<title>Image Compressor</title><input type="file"><canvas></canvas><button>Compress</button>'));
    assert.equal(r.tier, 'A');
  });

  it('Tier C for unreachable and 404', () => {
    assert.equal(triageSubmission(tool, { status: null, finalUrl: null, error: 'timeout', html: null }).tier, 'C');
    assert.equal(triageSubmission(tool, { status: 404, finalUrl: tool.url, error: null, html: '' }).tier, 'C');
  });

  it('Tier C for a login wall', () => {
    const r = triageSubmission(tool, ok('<title>Sign in</title><input type="email"><input type="password"><button>Log in</button>'));
    assert.equal(r.tier, 'C');
    assert.equal(r.signals[0].code, 'login_wall');
    assert.match(String(r.suggestedReason), /登录/);
  });

  it('does not treat an interactive tool with a header login link as a wall', () => {
    const r = triageSubmission(tool, ok('<title>Diagram editor</title><a href="/login">Log in</a><canvas></canvas><textarea></textarea>'));
    assert.equal(r.tier, 'A');
  });

  it('Tier C for entertainment / divination', () => {
    assert.equal(triageSubmission(tool, ok('<title>Free Tarot Reading Online</title><button>Draw</button>')).signals[0].code, 'entertainment');
  });

  it('Tier C for parked domains and cross-host redirects', () => {
    assert.equal(triageSubmission(tool, ok('<title>tool.example</title><p>This domain is for sale</p>')).tier, 'C');
    assert.equal(triageSubmission(tool, ok('<title>x</title><textarea></textarea>', 'https://other.example/')).signals[0].code, 'cross_host_redirect');
  });

  it('Tier C for static articles without tool inputs', () => {
    const words = Array.from({ length: 800 }, () => 'word').join(' ');
    const r = triageSubmission(tool, ok(`<title>How to compress PDFs</title><article><p>8 min read</p><p>${words}</p></article>`));
    assert.equal(r.signals[0].code, 'static_article');
  });

  it('Tier B for JS-rendered shells (cannot judge statically)', () => {
    const r = triageSubmission(tool, ok('<title>App</title><div id="root"></div><script src="/a.js"></script>'));
    assert.equal(r.tier, 'B');
    assert.ok(r.signals.some((s) => s.code === 'js_rendered_shell'));
  });

  it('Tier B (not A) when interactive but showing trial/paywall copy', () => {
    const r = triageSubmission(tool, ok('<title>PDF tools</title><input type="file"><button>Start 7-Day Free Trial</button>'));
    assert.equal(r.tier, 'B');
  });
});

describe('evaluation queue', () => {
  it('orders A before B, then oldest submission', () => {
    const items = [
      { id: 3, tier: 'B', submittedAt: '2026-10-01' },
      { id: 2, tier: 'A', submittedAt: '2026-10-10' },
      { id: 1, tier: 'A', submittedAt: '2026-10-05' },
    ].sort(compareItems);
    assert.deepEqual(items.map((i) => i.id), [1, 2, 3]);
  });

  it('merges A/B, drops C, and removes items that are no longer pending', () => {
    const q = { items: [{ id: 9, tier: 'A', submittedAt: '2026-10-01', addedAt: 'x' }] };
    mergeTriage(
      q,
      [
        { id: 1, slug: 'a', url: 'u', tier: 'A', signals: [], submittedAt: '2026-10-02' },
        { id: 2, slug: 'b', url: 'u', tier: 'C', signals: [], submittedAt: '2026-10-02' },
      ],
      new Set([1, 2])
    );
    assert.deepEqual(q.items.map((i) => i.id), [1]);
  });
});
