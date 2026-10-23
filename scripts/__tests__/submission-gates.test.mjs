// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkHardGates,
  normalizeSubmissionUrl,
  siteKey,
  siteKeyLikePatterns,
} from '../../src/lib/submission-gates-core.mjs';

describe('normalizeSubmissionUrl', () => {
  it('strips utm and click-id params and keeps functional params', () => {
    const { url, removed } = normalizeSubmissionUrl(
      'https://Example.com/tool?utm_source=nologin&utm_medium=directory&lang=en&fbclid=abc#top'
    );
    assert.equal(url, 'https://example.com/tool?lang=en');
    assert.deepEqual(removed.sort(), ['fbclid', 'utm_medium', 'utm_source']);
  });

  it('drops a dangling question mark when all params are tracking params', () => {
    assert.equal(normalizeSubmissionUrl('https://a.com/?utm_source=x&ref=producthunt').url, 'https://a.com/');
  });

  it('leaves clean URLs untouched', () => {
    assert.equal(normalizeSubmissionUrl('https://excalidraw.com/').url, 'https://excalidraw.com/');
  });
});

describe('siteKey', () => {
  it('strips www and lowercases', () => {
    assert.equal(siteKey('https://WWW.Sxuan.com/90523.html'), 'sxuan.com');
  });

  it('keeps subdomains distinct', () => {
    assert.equal(siteKey('https://tools.hatchloop.dev/a'), 'tools.hatchloop.dev');
  });

  it('scopes GitHub Pages by first path segment', () => {
    assert.equal(siteKey('https://alice.github.io/json-viewer/'), 'alice.github.io/json-viewer');
    assert.equal(siteKey('https://alice.github.io/'), 'alice.github.io');
  });

  it('returns null for invalid URLs', () => {
    assert.equal(siteKey('not a url'), null);
  });
});

describe('siteKeyLikePatterns', () => {
  it('covers bare host, www, path, and query variants', () => {
    const patterns = siteKeyLikePatterns('donecut.com');
    assert.ok(patterns.includes('%://donecut.com'));
    assert.ok(patterns.includes('%://donecut.com/%'));
    assert.ok(patterns.includes('%://www.donecut.com/%'));
    assert.ok(patterns.includes('%://donecut.com?%'));
  });

  it('does not produce a prefix pattern that would match other domains', () => {
    for (const p of siteKeyLikePatterns('lane.com')) {
      assert.ok(!p.endsWith('lane.com%'), `pattern ${p} would match lane.com.evil`);
    }
  });
});

describe('checkHardGates', () => {
  /** @param {string} url @param {string} [email] */
  const code = (url, email) => checkHardGates({ url, submitterEmail: email })?.code ?? null;

  it('accepts a normal production tool', () => {
    assert.equal(code('https://excalidraw.com/'), null);
    assert.equal(code('https://alice.github.io/tool/'), null);
    assert.equal(code('https://my-tool.vercel.app/'), null);
  });

  it('rejects ephemeral tunnels and file drops', () => {
    assert.equal(code('https://abc-def.trycloudflare.com/'), 'ephemeral_host');
    assert.equal(code('https://1234.ngrok-free.app/'), 'ephemeral_host');
    assert.equal(code('https://foo.chatgpt.site/'), 'ephemeral_host');
    assert.equal(code('https://drive.google.com/file/d/xyz'), 'ephemeral_host');
  });

  it('rejects local and bare-IP addresses', () => {
    assert.equal(code('http://localhost:3000/'), 'private_host');
    assert.equal(code('http://192.168.1.10/'), 'private_host');
  });

  it('rejects repository URLs', () => {
    assert.equal(code('https://github.com/user/repo'), 'repository_url');
    assert.equal(code('https://gitlab.com/user/repo'), 'repository_url');
  });

  it('rejects store listings', () => {
    assert.equal(code('https://chromewebstore.google.com/detail/abc'), 'store_listing');
    assert.equal(code('https://chrome.google.com/webstore/detail/abc'), 'store_listing');
    assert.equal(code('https://apps.apple.com/app/id123'), 'store_listing');
    assert.equal(code('https://someone.gumroad.com/l/tool'), 'store_listing');
  });

  it('does not treat unrelated google.com paths as store listings', () => {
    assert.equal(code('https://chrome.google.com/'), null);
  });

  it('rejects blocked submitters', () => {
    assert.equal(code('https://ok.com/', 'svay9298@agent.qq.com'), 'blocked_submitter');
    assert.equal(code('https://ok.com/', 'LeesWal123@gmail.com'), 'blocked_submitter');
    assert.equal(code('https://ok.com/', 'person@qq.com'), null);
  });

  it('returns a stored reason and a user-facing message', () => {
    const v = checkHardGates({ url: 'https://github.com/a/b' });
    assert.ok(v?.reason.includes('github.com'));
    assert.ok(v?.userMessage.length);
  });
});
