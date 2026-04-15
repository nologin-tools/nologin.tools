// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDayOfYear,
  selectCategory,
  getSearchConfig,
  readExistingTools,
  buildIssueBody,
} from '../prepare-tool-discovery.mjs';

// ---------------------------------------------------------------------------
// getDayOfYear
// ---------------------------------------------------------------------------

describe('getDayOfYear', () => {
  it('should return 1 for January 1st', () => {
    assert.equal(getDayOfYear(new Date('2026-01-01T00:00:00Z')), 1);
  });

  it('should return 365 for December 31st (non-leap year)', () => {
    assert.equal(getDayOfYear(new Date('2026-12-31T00:00:00Z')), 365);
  });

  it('should return 366 for December 31st (leap year)', () => {
    assert.equal(getDayOfYear(new Date('2024-12-31T00:00:00Z')), 366);
  });

  it('should return 60 for March 1st (non-leap year)', () => {
    assert.equal(getDayOfYear(new Date('2026-03-01T00:00:00Z')), 60);
  });
});

// ---------------------------------------------------------------------------
// selectCategory
// ---------------------------------------------------------------------------

describe('selectCategory', () => {
  const categories = [
    'AI', 'Design', 'Writing', 'Development', 'Productivity', 'Media',
    'Privacy', 'Data', 'Communication', 'Education', 'Finance',
  ];

  it('should rotate through categories based on day of year', () => {
    const date = new Date('2026-01-01T00:00:00Z'); // dayOfYear=1, 1%11=1 => Design
    const result = selectCategory(date);
    assert.equal(result, categories[1]); // Design
  });

  it('should wrap around at category count', () => {
    // dayOfYear=11 => 11%11=0 => AI
    const date = new Date('2026-01-11T00:00:00Z');
    const result = selectCategory(date);
    assert.equal(result, categories[0]); // AI
  });

  it('should respect CATEGORY_HINT when valid', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const result = selectCategory(date, 'Privacy');
    assert.equal(result, 'Privacy');
  });

  it('should ignore CATEGORY_HINT when invalid', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const result = selectCategory(date, 'InvalidCategory');
    assert.notEqual(result, 'InvalidCategory');
    assert.ok(categories.includes(result));
  });

  it('should return a valid category for day 365', () => {
    const date = new Date('2026-12-31T00:00:00Z');
    const result = selectCategory(date);
    assert.ok(categories.includes(result));
  });

  it('should return a valid category for day 366 (leap year)', () => {
    const date = new Date('2024-12-31T00:00:00Z');
    const result = selectCategory(date);
    assert.ok(categories.includes(result));
  });
});

// ---------------------------------------------------------------------------
// getSearchConfig
// ---------------------------------------------------------------------------

describe('getSearchConfig', () => {
  it('should return search queries for a known category', () => {
    const config = getSearchConfig('AI');
    assert.ok(Array.isArray(config.searchQueries));
    assert.ok(config.searchQueries.length > 0);
    assert.ok(config.searchQueries.some((q) => q.toLowerCase().includes('ai')));
  });

  it('should return sources for a known category', () => {
    const config = getSearchConfig('Design');
    assert.ok(Array.isArray(config.sources));
    assert.ok(config.sources.length > 0);
  });

  it('should return fallback queries for unknown category', () => {
    const config = getSearchConfig('NonExistentCategory');
    assert.ok(Array.isArray(config.searchQueries));
    assert.ok(config.searchQueries.length > 0);
    assert.ok(config.searchQueries[0].includes('nonexistentcategory'));
  });
});

// ---------------------------------------------------------------------------
// readExistingTools
// ---------------------------------------------------------------------------

describe('readExistingTools', () => {
  it('should return an array (may be empty if no build-data.json)', () => {
    const tools = readExistingTools();
    assert.ok(Array.isArray(tools));
  });
});

// ---------------------------------------------------------------------------
// buildIssueBody
// ---------------------------------------------------------------------------

describe('buildIssueBody', () => {
  it('should include the category name', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test query'], sources: ['Test Source'] },
      existingTools: [],
    });
    assert.ok(body.includes('**AI**'));
  });

  it('should include search queries', () => {
    const body = buildIssueBody({
      category: 'Design',
      searchConfig: { searchQueries: ['free design tools no login'], sources: [] },
      existingTools: [],
    });
    assert.ok(body.includes('free design tools no login'));
  });

  it('should include existing tools for dedup', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [{ name: 'Excalidraw', url: 'https://excalidraw.com', slug: 'excalidraw-com' }],
    });
    assert.ok(body.includes('Excalidraw'));
    assert.ok(body.includes('excalidraw.com'));
  });

  it('should show (none yet) when no existing tools', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [],
    });
    assert.ok(body.includes('(none yet)'));
  });

  it('should include valid tag values reference', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [],
    });
    assert.ok(body.includes('category'));
    assert.ok(body.includes('pricing'));
    assert.ok(body.includes('Free'));
  });

  it('should not include SEO fields in the generated tool JSON (handled by seo-fill workflow)', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [],
    });
    assert.ok(!body.includes('"seoTitle"'));
    assert.ok(!body.includes('"seoDescription"'));
    assert.ok(!body.includes('"seoTaskPhrase"'));
    assert.ok(!body.includes('"seoFocusKeyword"'));
  });

  it('should include Playwright MCP instructions', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [],
    });
    assert.ok(body.includes('browser_navigate'));
    assert.ok(body.includes('browser_screenshot'));
    assert.ok(body.includes('Playwright'));
  });

  it('should include skip instructions', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [],
    });
    assert.ok(body.includes('_skip-'));
  });

  it('should include banned AI phrases list', () => {
    const body = buildIssueBody({
      category: 'AI',
      searchConfig: { searchQueries: ['test'], sources: [] },
      existingTools: [],
    });
    assert.ok(body.includes('delve'));
    assert.ok(body.includes('seamless'));
  });
});
