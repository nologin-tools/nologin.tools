// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateIssueBody } from '../generate-translate-issue.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal manifest where everything is up to date */
function emptyManifest() {
  return {
    ui: { sourceHash: 'abc123', locales: { zh: { status: 'up_to_date' }, ja: { status: 'up_to_date' } } },
    blog: { posts: {} },
    tools: { items: {} },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateIssueBody()', () => {
  it('always includes translation quality guidelines', () => {
    const body = generateIssueBody(emptyManifest());
    assert.ok(body.includes('Translation Quality Guidelines'));
    assert.ok(body.includes('translation-guidelines.md'));
  });

  it('always includes the Important section', () => {
    const body = generateIssueBody(emptyManifest());
    assert.ok(body.includes('## Important'));
    assert.ok(body.includes('Only modify translation files'));
  });

  it('does not include UI task when all locales are up_to_date', () => {
    const body = generateIssueBody(emptyManifest());
    assert.ok(!body.includes('## Task: UI Strings'));
  });

  it('includes UI task with hash_mismatch locales', () => {
    const manifest = emptyManifest();
    manifest.ui.locales.zh = { status: 'hash_mismatch' };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('## Task: UI Strings'));
    assert.ok(body.includes('Full re-translate'));
    assert.ok(body.includes('`zh`'));
  });

  it('includes UI task with missing locales', () => {
    const manifest = emptyManifest();
    manifest.ui.locales.ja = { status: 'missing' };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('## Task: UI Strings'));
    assert.ok(body.includes('Full re-translate'));
    assert.ok(body.includes('`ja`'));
  });

  it('includes UI task with missing_keys and lists key names', () => {
    const manifest = emptyManifest();
    manifest.ui.locales.zh = { status: 'missing_keys', missingKeys: ['nav.new', 'home.cta'] };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('## Task: UI Strings'));
    assert.ok(body.includes('Add missing keys only'));
    assert.ok(body.includes('`nav.new`'));
    assert.ok(body.includes('`home.cta`'));
    assert.ok(body.includes('`zh`'));
  });

  it('does not include Blog task when posts is empty', () => {
    const body = generateIssueBody(emptyManifest());
    assert.ok(!body.includes('## Task: Blog Posts'));
  });

  it('includes Blog task with missing and hash_mismatch locales', () => {
    const manifest = emptyManifest();
    manifest.blog.posts = {
      'welcome.md': {
        sourceHash: 'def456',
        locales: { zh: 'missing', ja: 'hash_mismatch', ko: 'up_to_date' },
      },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('## Task: Blog Posts'));
    assert.ok(body.includes('`welcome.md`'));
    assert.ok(body.includes('def456'));
    assert.ok(body.includes('Create translation'));
    assert.ok(body.includes('`zh`'));
    assert.ok(body.includes('Re-translate'));
    assert.ok(body.includes('`ja`'));
    // up_to_date locale should not be called out
    assert.ok(!body.includes('`ko`') || body.includes('Target languages'));
  });

  it('does not include Tools task when items is empty', () => {
    const body = generateIssueBody(emptyManifest());
    assert.ok(!body.includes('## Task: Tool Descriptions'));
  });

  it('includes Tools task with missing and hash_mismatch', () => {
    const manifest = emptyManifest();
    manifest.tools.items = {
      'excalidraw-com': {
        sourceHash: 'ghi789',
        locales: { zh: 'missing', ja: 'hash_mismatch', ko: 'up_to_date' },
      },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('## Task: Tool Descriptions'));
    assert.ok(body.includes('`excalidraw-com`'));
    assert.ok(body.includes('ghi789'));
    assert.ok(body.includes('create:'));
    assert.ok(body.includes('update:'));
  });

  it('asks translators to translate SEO fields for tools', () => {
    const manifest = emptyManifest();
    manifest.tools.items = {
      'excalidraw-com': {
        sourceHash: 'ghi789',
        locales: { zh: 'missing' },
      },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('seoTitle'));
    assert.ok(body.includes('seoDescription'));
    assert.ok(body.includes('seoFocusKeyword'));
    assert.ok(body.includes('seoTaskPhrase'));
  });

  it('includes all 3 task sections when all have changes', () => {
    const manifest = {
      ui: {
        sourceHash: 'aaa',
        locales: { zh: { status: 'hash_mismatch' } },
      },
      blog: {
        posts: {
          'post.md': { sourceHash: 'bbb', locales: { zh: 'missing' } },
        },
      },
      tools: {
        items: {
          'tool-a': { sourceHash: 'ccc', locales: { zh: 'missing' } },
        },
      },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('## Task: UI Strings'));
    assert.ok(body.includes('## Task: Blog Posts'));
    assert.ok(body.includes('## Task: Tool Descriptions'));
  });

  it('groups hash_mismatch, missing, and invalid_json under full re-translate', () => {
    const manifest = emptyManifest();
    manifest.ui.locales = {
      zh: { status: 'hash_mismatch' },
      ja: { status: 'missing' },
      ko: { status: 'invalid_json' },
      es: { status: 'up_to_date' },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('Full re-translate'));
    // All three should be in the re-translate list
    assert.ok(body.includes('`zh`'));
    assert.ok(body.includes('`ja`'));
    assert.ok(body.includes('`ko`'));
  });

  it('includes source hashes for Claude to use directly', () => {
    const manifest = {
      ui: { sourceHash: 'hash_ui_123', locales: { zh: { status: 'hash_mismatch' } } },
      blog: { posts: { 'a.md': { sourceHash: 'hash_blog_456', locales: { zh: 'missing' } } } },
      tools: { items: { 'tool': { sourceHash: 'hash_tool_789', locales: { zh: 'missing' } } } },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('hash_ui_123'));
    assert.ok(body.includes('hash_blog_456'));
    assert.ok(body.includes('hash_tool_789'));
  });

  it('handles multiple blog posts correctly', () => {
    const manifest = emptyManifest();
    manifest.blog.posts = {
      'post-a.md': { sourceHash: 'aaa', locales: { zh: 'missing' } },
      'post-b.md': { sourceHash: 'bbb', locales: { ja: 'hash_mismatch' } },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('`post-a.md`'));
    assert.ok(body.includes('`post-b.md`'));
  });

  it('handles multiple tools correctly', () => {
    const manifest = emptyManifest();
    manifest.tools.items = {
      'tool-a': { sourceHash: 'aaa', locales: { zh: 'missing' } },
      'tool-b': { sourceHash: 'bbb', locales: { ja: 'hash_mismatch' } },
    };

    const body = generateIssueBody(manifest);
    assert.ok(body.includes('`tool-a`'));
    assert.ok(body.includes('`tool-b`'));
  });
});
