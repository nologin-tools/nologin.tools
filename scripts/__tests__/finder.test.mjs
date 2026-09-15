// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildFinderItemFromTool,
  filterFinderTools,
  extractHostname,
} from '../../src/lib/finder-core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDataPath = resolve(__dirname, '../../src/data/build-data.json');
/** @type {{ tools: Array<any> }} */
const buildData = JSON.parse(readFileSync(buildDataPath, 'utf-8'));
const approvedTools = buildData.tools.filter((t) => t.status === 'approved');

const finderTools = approvedTools.map((t, idx) =>
  buildFinderItemFromTool(t, t.description || '', 'online', 100 - idx)
);

describe('Finder Data Normalization', () => {
  it('normalizes all approved tools into FinderToolItem format', () => {
    assert.equal(finderTools.length, approvedTools.length);
    assert.ok(finderTools.length >= 180);

    for (const tool of finderTools) {
      assert.ok(tool.slug.length > 0, 'Tool has empty slug');
      assert.ok(tool.name.length > 0, 'Tool has empty name');
      assert.ok(tool.url.startsWith('http'), `Tool ${tool.slug} has invalid URL ${tool.url}`);
      assert.ok(tool.hostname.length > 0, `Tool ${tool.slug} has empty hostname`);
      assert.ok(tool.category.length > 0, `Tool ${tool.slug} has empty category`);
      assert.equal(typeof tool.isClientSideOnly, 'boolean');
      assert.equal(typeof tool.worksOffline, 'boolean');
      assert.equal(typeof tool.isOpenSource, 'boolean');
      assert.equal(typeof tool.isFree, 'boolean');
    }
  });

  it('correctly extracts clean hostnames', () => {
    assert.equal(extractHostname('https://www.excalidraw.com/app'), 'excalidraw.com');
    assert.equal(extractHostname('https://squoosh.app'), 'squoosh.app');
    assert.equal(extractHostname('invalid-url'), '');
  });

  it('accurately parses tags into boolean flags', () => {
    const excalidraw = finderTools.find((t) => t.slug === 'excalidraw-com');
    assert.ok(excalidraw);
    assert.equal(excalidraw.category, 'Design');
    assert.equal(excalidraw.isOpenSource, true);

    const squoosh = finderTools.find((t) => t.slug === 'squoosh-app');
    assert.ok(squoosh);
    assert.equal(squoosh.isClientSideOnly, true);
    assert.equal(squoosh.isOpenSource, true);
  });
});

describe('filterFinderTools Engine', () => {
  it('returns all tools when no filters are applied', () => {
    const results = filterFinderTools(finderTools, {});
    assert.equal(results.length, finderTools.length);
  });

  it('filters by search query across name, hostname, coreTask, and description', () => {
    const excalidrawResults = filterFinderTools(finderTools, { query: 'excalidraw' });
    assert.ok(excalidrawResults.length >= 1);
    assert.ok(excalidrawResults.some((t) => t.slug === 'excalidraw-com'));

    const hostResults = filterFinderTools(finderTools, { query: 'photopea.com' });
    assert.ok(hostResults.length >= 1);
    assert.ok(hostResults.some((t) => t.slug === 'photopea-com'));

    const encryptResults = filterFinderTools(finderTools, { query: 'encrypt' });
    assert.ok(encryptResults.length >= 1);
  });

  it('filters by category', () => {
    const privacyTools = filterFinderTools(finderTools, { category: 'privacy' });
    assert.ok(privacyTools.length >= 5);
    for (const tool of privacyTools) {
      assert.equal(tool.category.toLowerCase(), 'privacy');
    }

    const allCatTools = filterFinderTools(finderTools, { category: 'all' });
    assert.equal(allCatTools.length, finderTools.length);
  });

  it('filters by privacy and execution attributes', () => {
    const clientSideTools = filterFinderTools(finderTools, { clientSideOnly: true });
    assert.ok(clientSideTools.length > 0);
    for (const tool of clientSideTools) {
      assert.equal(tool.isClientSideOnly, true);
    }

    const offlineTools = filterFinderTools(finderTools, { worksOffline: true });
    assert.ok(offlineTools.length > 0);
    for (const tool of offlineTools) {
      assert.equal(tool.worksOffline, true);
    }

    const ossTools = filterFinderTools(finderTools, { openSource: true });
    assert.ok(ossTools.length > 0);
    for (const tool of ossTools) {
      assert.equal(tool.isOpenSource, true);
    }

    const freeTools = filterFinderTools(finderTools, { freeOnly: true });
    assert.ok(freeTools.length > 0);
    for (const tool of freeTools) {
      assert.equal(tool.isFree, true);
    }
  });

  it('filters by intersection of multiple criteria', () => {
    const mediaClientSide = filterFinderTools(finderTools, {
      category: 'media',
      clientSideOnly: true,
    });
    assert.ok(mediaClientSide.length > 0);
    for (const tool of mediaClientSide) {
      assert.equal(tool.category.toLowerCase(), 'media');
      assert.equal(tool.isClientSideOnly, true);
    }
  });

  it('sorts results properly', () => {
    const sortedAsc = filterFinderTools(finderTools, { sortBy: 'name-asc' });
    for (let i = 1; i < sortedAsc.length; i++) {
      assert.ok(
        sortedAsc[i - 1].name.localeCompare(sortedAsc[i].name) <= 0,
        `Expected ${sortedAsc[i - 1].name} <= ${sortedAsc[i].name}`
      );
    }

    const sortedDesc = filterFinderTools(finderTools, { sortBy: 'name-desc' });
    for (let i = 1; i < sortedDesc.length; i++) {
      assert.ok(
        sortedDesc[i - 1].name.localeCompare(sortedDesc[i].name) >= 0,
        `Expected ${sortedDesc[i - 1].name} >= ${sortedDesc[i].name}`
      );
    }

    const sortedScore = filterFinderTools(finderTools, { sortBy: 'score' });
    for (let i = 1; i < sortedScore.length; i++) {
      assert.ok(sortedScore[i - 1].score >= sortedScore[i].score);
    }
  });

  it('returns empty array when no tools match', () => {
    const impossible = filterFinderTools(finderTools, {
      query: 'zzzz_impossible_query_99999_xyz',
    });
    assert.deepEqual(impossible, []);
  });
});
