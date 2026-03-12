// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseArgs,
  extractFrontmatterFields,
  buildSearchQuery,
  insertHeroImage,
} from '../add-blog-hero-image.mjs';

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('should parse --slug argument', () => {
    const result = parseArgs(['node', 'script.mjs', '--slug', 'my-post']);
    assert.equal(result.slug, 'my-post');
    assert.equal(result.apiKey, '');
  });

  it('should parse --slug and --api-key arguments', () => {
    const result = parseArgs(['node', 'script.mjs', '--slug', 'test', '--api-key', 'abc123']);
    assert.equal(result.slug, 'test');
    assert.equal(result.apiKey, 'abc123');
  });

  it('should return empty strings when no arguments provided', () => {
    const result = parseArgs(['node', 'script.mjs']);
    assert.equal(result.slug, '');
    assert.equal(result.apiKey, '');
  });

  it('should handle arguments in any order', () => {
    const result = parseArgs(['node', 'script.mjs', '--api-key', 'key1', '--slug', 'post1']);
    assert.equal(result.slug, 'post1');
    assert.equal(result.apiKey, 'key1');
  });
});

// ---------------------------------------------------------------------------
// extractFrontmatterFields
// ---------------------------------------------------------------------------

describe('extractFrontmatterFields', () => {
  it('should extract heroImageQuery from frontmatter', () => {
    const content = [
      '---',
      'title: "My Post Title"',
      'heroImageQuery: "privacy tools technology"',
      '---',
      '',
      'Body content here.',
    ].join('\n');
    const fields = extractFrontmatterFields(content);
    assert.equal(fields.heroImageQuery, 'privacy tools technology');
    assert.equal(fields.title, 'My Post Title');
  });

  it('should extract title when heroImageQuery is missing', () => {
    const content = [
      '---',
      'title: "Browser Tools Without Signup"',
      'description: "A guide"',
      '---',
      '',
      'Body here.',
    ].join('\n');
    const fields = extractFrontmatterFields(content);
    assert.equal(fields.heroImageQuery, null);
    assert.equal(fields.title, 'Browser Tools Without Signup');
  });

  it('should return nulls for content without frontmatter', () => {
    const content = 'Just plain text, no frontmatter.';
    const fields = extractFrontmatterFields(content);
    assert.equal(fields.heroImageQuery, null);
    assert.equal(fields.title, null);
  });

  it('should handle single-quoted values', () => {
    const content = [
      '---',
      "title: 'Single Quoted Title'",
      "heroImageQuery: 'search term'",
      '---',
      '',
      'Body.',
    ].join('\n');
    const fields = extractFrontmatterFields(content);
    assert.equal(fields.heroImageQuery, 'search term');
    assert.equal(fields.title, 'Single Quoted Title');
  });
});

// ---------------------------------------------------------------------------
// buildSearchQuery
// ---------------------------------------------------------------------------

describe('buildSearchQuery', () => {
  it('should use heroImageQuery when available', () => {
    const query = buildSearchQuery({ heroImageQuery: 'privacy tools', title: 'Some Title' });
    assert.equal(query, 'privacy tools');
  });

  it('should extract keywords from title when heroImageQuery is null', () => {
    const query = buildSearchQuery({
      heroImageQuery: null,
      title: 'The Best Privacy Tools for Browser Users',
    });
    // Should filter out stop words (the, for) and return meaningful keywords
    assert.ok(!query.includes('the'));
    assert.ok(!query.includes('for'));
    assert.ok(query.includes('privacy'));
    assert.ok(query.includes('tools') || query.includes('browser'));
  });

  it('should return "technology" when both fields are null', () => {
    const query = buildSearchQuery({ heroImageQuery: null, title: null });
    assert.equal(query, 'technology');
  });

  it('should return "technology" when title has only stop words', () => {
    const query = buildSearchQuery({ heroImageQuery: null, title: 'The And Or But' });
    assert.equal(query, 'technology');
  });

  it('should limit to 3 keywords', () => {
    const query = buildSearchQuery({
      heroImageQuery: null,
      title: 'Privacy Security Encryption Authentication Verification',
    });
    const words = query.split(' ');
    assert.ok(words.length <= 3, `Expected at most 3 words, got ${words.length}`);
  });
});

// ---------------------------------------------------------------------------
// insertHeroImage
// ---------------------------------------------------------------------------

describe('insertHeroImage', () => {
  it('should insert image after frontmatter', () => {
    const content = [
      '---',
      'title: "Test Post"',
      'description: "A test"',
      '---',
      '',
      '## First Heading',
      '',
      'Content here.',
    ].join('\n');

    const result = insertHeroImage(content, 'test-post', 'Photo by John on Unsplash');

    assert.ok(result.includes('![Photo by John on Unsplash](/blog/images/test-post/hero.jpg)'));
    // Image should appear after frontmatter but before body
    const imagePos = result.indexOf('![Photo by John on Unsplash]');
    const headingPos = result.indexOf('## First Heading');
    assert.ok(imagePos < headingPos, 'Image should appear before the first heading');
  });

  it('should use "Hero image" as alt when no attribution', () => {
    const content = '---\ntitle: "Test"\n---\n\nBody.';
    const result = insertHeroImage(content, 'my-slug', null);
    assert.ok(result.includes('![Hero image](/blog/images/my-slug/hero.jpg)'));
  });

  it('should return content unchanged if no frontmatter delimiters', () => {
    const content = 'Just plain text, no frontmatter.';
    const result = insertHeroImage(content, 'test', null);
    assert.equal(result, content);
  });

  it('should return content unchanged if only one delimiter', () => {
    const content = '---\ntitle: "Test"\nNo closing delimiter';
    const result = insertHeroImage(content, 'test', null);
    assert.equal(result, content);
  });

  it('should preserve all original content', () => {
    const content = '---\ntitle: "Test"\n---\n\n## Heading\n\nParagraph 1.\n\nParagraph 2.';
    const result = insertHeroImage(content, 'slug', null);
    assert.ok(result.includes('## Heading'));
    assert.ok(result.includes('Paragraph 1.'));
    assert.ok(result.includes('Paragraph 2.'));
    assert.ok(result.includes('title: "Test"'));
  });
});
