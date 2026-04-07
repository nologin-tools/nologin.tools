// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Pure JS reimplementation of categoryToSlug / slugToCategory
// Must stay in sync with src/lib/tags.ts
// ---------------------------------------------------------------------------

const TAG_DEFINITIONS_CATEGORIES = [
  'AI', 'Design', 'Writing', 'Development', 'Productivity', 'Media',
  'Privacy', 'Data', 'Communication', 'Education', 'Finance',
];

function categoryToSlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

function slugToCategory(slug) {
  return TAG_DEFINITIONS_CATEGORIES.find((v) => categoryToSlug(v) === slug);
}

// ---------------------------------------------------------------------------
// Tests: categoryToSlug
// ---------------------------------------------------------------------------

describe('categoryToSlug', () => {
  it('converts single-word categories to lowercase', () => {
    assert.equal(categoryToSlug('Design'), 'design');
    assert.equal(categoryToSlug('Media'), 'media');
    assert.equal(categoryToSlug('Finance'), 'finance');
  });

  it('converts short uppercase categories', () => {
    assert.equal(categoryToSlug('AI'), 'ai');
  });

  it('converts multi-word categories with hyphen', () => {
    // Currently no multi-word categories in TAG_DEFINITIONS, but test the logic
    assert.equal(categoryToSlug('Web Dev'), 'web-dev');
    assert.equal(categoryToSlug('Machine Learning'), 'machine-learning');
  });

  it('handles multiple spaces', () => {
    assert.equal(categoryToSlug('Multi  Space'), 'multi--space'.replace(/--/g, '-'));
    // Actually: 'Multi  Space' -> 'multi-space' because \s+ matches multiple spaces
    assert.equal(categoryToSlug('Multi  Space'), 'multi-space');
  });

  it('produces valid URL-safe slugs for all 11 categories', () => {
    const urlSafePattern = /^[a-z0-9-]+$/;
    for (const cat of TAG_DEFINITIONS_CATEGORIES) {
      const slug = categoryToSlug(cat);
      assert.ok(urlSafePattern.test(slug), `${cat} -> ${slug} is not URL-safe`);
      assert.ok(slug.length > 0, `${cat} produced empty slug`);
    }
  });

  it('produces unique slugs for all categories', () => {
    const slugs = TAG_DEFINITIONS_CATEGORIES.map(categoryToSlug);
    const unique = new Set(slugs);
    assert.equal(unique.size, slugs.length, 'Duplicate slugs detected');
  });
});

// ---------------------------------------------------------------------------
// Tests: slugToCategory
// ---------------------------------------------------------------------------

describe('slugToCategory', () => {
  it('returns correct category for valid slugs', () => {
    assert.equal(slugToCategory('ai'), 'AI');
    assert.equal(slugToCategory('design'), 'Design');
    assert.equal(slugToCategory('writing'), 'Writing');
    assert.equal(slugToCategory('development'), 'Development');
    assert.equal(slugToCategory('productivity'), 'Productivity');
    assert.equal(slugToCategory('media'), 'Media');
    assert.equal(slugToCategory('privacy'), 'Privacy');
    assert.equal(slugToCategory('data'), 'Data');
    assert.equal(slugToCategory('communication'), 'Communication');
    assert.equal(slugToCategory('education'), 'Education');
    assert.equal(slugToCategory('finance'), 'Finance');
  });

  it('returns undefined for invalid slugs', () => {
    assert.equal(slugToCategory('nonexistent'), undefined);
    assert.equal(slugToCategory(''), undefined);
    assert.equal(slugToCategory('AI'), undefined); // case-sensitive
    assert.equal(slugToCategory('Design'), undefined);
  });
});

// ---------------------------------------------------------------------------
// Tests: round-trip consistency
// ---------------------------------------------------------------------------

describe('round-trip: categoryToSlug -> slugToCategory', () => {
  it('round-trips all 11 categories', () => {
    for (const cat of TAG_DEFINITIONS_CATEGORIES) {
      const slug = categoryToSlug(cat);
      const result = slugToCategory(slug);
      assert.equal(result, cat, `Round-trip failed for ${cat}: ${slug} -> ${result}`);
    }
  });
});
