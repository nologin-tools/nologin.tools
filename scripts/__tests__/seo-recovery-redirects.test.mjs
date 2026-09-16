import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIndexableLocale, INDEXABLE_LOCALES } from '../../src/i18n/config.ts';
import { REDIRECT_MAP } from '../prune-blogs-and-generate-redirects.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

describe('SEO Recovery - Redirects & Content Pruning', () => {
  it('public/_redirects exists and has non-zero size', () => {
    const redirectsPath = resolve(ROOT, 'public/_redirects');
    assert.ok(existsSync(redirectsPath), '_redirects file must exist');
    const content = readFileSync(redirectsPath, 'utf-8');
    assert.ok(content.length > 500, '_redirects must contain rules');
  });

  it('all redirect targets point to existing pillar blog posts', () => {
    for (const [sourceSlug, targetSlug] of Object.entries(REDIRECT_MAP)) {
      const targetFile = resolve(ROOT, `src/content/blog/${targetSlug}.md`);
      assert.ok(existsSync(targetFile), `Target pillar post ${targetSlug}.md must exist for source ${sourceSlug}`);
      assert.notEqual(sourceSlug, targetSlug, 'Source and target must not be identical');
    }
  });

  it('no redirect target is also a source in REDIRECT_MAP (no chains or loops)', () => {
    const sources = new Set(Object.keys(REDIRECT_MAP));
    for (const targetSlug of Object.values(REDIRECT_MAP)) {
      assert.ok(!sources.has(targetSlug), `Target ${targetSlug} should not also be in source redirect list`);
    }
  });

  it('isIndexableLocale allows only en and zh', () => {
    assert.deepEqual([...INDEXABLE_LOCALES], ['en', 'zh']);
    assert.equal(isIndexableLocale('en'), true);
    assert.equal(isIndexableLocale('zh'), true);
    assert.equal(isIndexableLocale('de'), false);
    assert.equal(isIndexableLocale('ja'), false);
    assert.equal(isIndexableLocale('fr'), false);
    assert.equal(isIndexableLocale('es'), false);
    assert.equal(isIndexableLocale('ko'), false);
    assert.equal(isIndexableLocale('pt'), false);
  });

  it('pruned blog collection leaves only high-quality pillar posts', () => {
    const files = readdirSync(resolve(ROOT, 'src/content/blog')).filter(f => f.endsWith('.md'));
    assert.equal(files.length, 35, 'Should leave exactly 35 curated pillar posts and tool reviews');
  });

  it('public/_redirects redirects to canonical directory URLs with trailing slash', () => {
    const content = readFileSync(resolve(ROOT, 'public/_redirects'), 'utf-8');
    assert.ok(content.includes('/blog/edit-pdf-without-adobe-free-no-login /blog/edit-pdf-without-installing-anything/ 301'));
    assert.ok(!content.includes('/about/ /about 301'), 'Must not create redirect loop on /about/');
    assert.ok(!content.includes('/blog/ /blog 301'), 'Must not create redirect loop on /blog/');
  });
});
