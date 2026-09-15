// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPARISON_PAIRS,
  getComparisonPairs,
  getComparisonBySlug,
  findComparisonsForTool,
} from '../../src/lib/comparisons-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const editorialPath = resolve(__dirname, '../../src/data/tool-editorial.json');
/** @type {Record<string, Record<string, { alternativeTo?: string[]; bestFor?: string; pros?: string[]; cons?: string[]; privacyVerdict?: string }>>} */
const editorialData = JSON.parse(readFileSync(editorialPath, 'utf-8'));

describe('Comparison Pairs Data Model', () => {
  it('defines 10 high-intent comparison pairs', () => {
    assert.equal(COMPARISON_PAIRS.length, 10);
    const pairs = getComparisonPairs();
    assert.equal(pairs.length, 10);
  });

  it('has valid URL-safe slugs for all pairs', () => {
    const slugRegex = /^[a-z0-9-]+-vs-[a-z0-9-]+$/;
    for (const pair of COMPARISON_PAIRS) {
      assert.ok(slugRegex.test(pair.slug), `Pair slug ${pair.slug} must follow [toolA]-vs-[toolB] format`);
      assert.ok(pair.category.length > 0, `Pair slug ${pair.slug} has empty category`);
      assert.ok(pair.headline.length > 10, `Pair slug ${pair.slug} has short headline`);
    }
  });

  it('ensures all comparison slugs are unique', () => {
    const slugs = COMPARISON_PAIRS.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(uniqueSlugs.size, slugs.length, 'Duplicate comparison slugs found');
  });

  it('ensures all compared tools exist in editorial metadata', () => {
    for (const pair of COMPARISON_PAIRS) {
      assert.ok(
        editorialData[pair.toolASlug],
        `Tool A ${pair.toolASlug} in pair ${pair.slug} must exist in tool-editorial.json`
      );
      assert.ok(
        editorialData[pair.toolBSlug],
        `Tool B ${pair.toolBSlug} in pair ${pair.slug} must exist in tool-editorial.json`
      );
    }
  });

  it('contains comprehensive scenario verdicts for all pairs', () => {
    for (const pair of COMPARISON_PAIRS) {
      assert.ok(pair.verdict, `Pair ${pair.slug} must have a verdict`);
      assert.ok(pair.verdict.summary.length >= 20, `Pair ${pair.slug} summary too short`);
      assert.ok(pair.verdict.chooseAIf.length >= 2, `Pair ${pair.slug} must have >= 2 chooseA points`);
      assert.ok(pair.verdict.chooseBIf.length >= 2, `Pair ${pair.slug} must have >= 2 chooseB points`);
    }
  });
});

describe('getComparisonBySlug', () => {
  it('resolves valid comparison pair by slug', () => {
    const pair = getComparisonBySlug('excalidraw-vs-tldraw');
    assert.ok(pair);
    assert.equal(pair.toolASlug, 'excalidraw-com');
    assert.equal(pair.toolBSlug, 'tldraw-com');
    assert.equal(pair.category, 'Design');

    const squoosh = getComparisonBySlug('squoosh-vs-tinypng');
    assert.ok(squoosh);
    assert.equal(squoosh.toolASlug, 'squoosh-app');
    assert.equal(squoosh.toolBSlug, 'tinypng-com');
  });

  it('returns undefined for non-existent pair slug', () => {
    assert.equal(getComparisonBySlug('non-existent-vs-tool'), undefined);
    assert.equal(getComparisonBySlug(''), undefined);
  });
});

describe('findComparisonsForTool', () => {
  it('finds all comparisons involving a specific tool', () => {
    const excalidrawPairs = findComparisonsForTool('excalidraw-com');
    assert.ok(excalidrawPairs.length >= 2, 'Excalidraw should participate in at least 2 comparisons');
    assert.ok(excalidrawPairs.some((p) => p.slug === 'excalidraw-vs-tldraw'));
    assert.ok(excalidrawPairs.some((p) => p.slug === 'drawio-vs-excalidraw'));

    const photopeaPairs = findComparisonsForTool('photopea-com');
    assert.ok(photopeaPairs.length >= 1);
    assert.ok(photopeaPairs.some((p) => p.slug === 'photopea-vs-ezgif'));
  });

  it('returns empty array for tool without comparisons', () => {
    assert.deepEqual(findComparisonsForTool('unknown-tool-slug-xyz'), []);
  });
});
