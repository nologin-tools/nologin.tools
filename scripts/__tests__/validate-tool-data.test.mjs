// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateToolData } from '../validate-tool-data.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a valid tool data object with overridable fields.
 * @param {Record<string, any>} [overrides]
 * @returns {Record<string, any>}
 */
function buildToolData(overrides = {}) {
  return {
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    description: 'A virtual whiteboard for sketching hand-drawn like diagrams.',
    coreTask: 'Create hand-drawn style diagrams in the browser',
    tags: [
      { key: 'category', value: 'Design' },
      { key: 'pricing', value: 'Free' },
      { key: 'type', value: 'Web App' },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateToolData', () => {
  it('should pass for fully valid data', () => {
    const result = validateToolData(buildToolData());
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  // --- Required fields missing ---

  it('should error when name is missing', () => {
    const result = validateToolData(buildToolData({ name: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('name')));
  });

  it('should error when url is missing', () => {
    const result = validateToolData(buildToolData({ url: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('url')));
  });

  it('should error when description is missing', () => {
    const result = validateToolData(buildToolData({ description: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('description')));
  });

  it('should error when coreTask is missing', () => {
    const result = validateToolData(buildToolData({ coreTask: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('coreTask')));
  });

  // --- Field length limits ---

  it('should error when name is too short', () => {
    const result = validateToolData(buildToolData({ name: 'X' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('name too short')));
  });

  it('should error when name exceeds 100 characters', () => {
    const result = validateToolData(buildToolData({ name: 'A'.repeat(101) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('name too long')));
  });

  it('should error when description exceeds 500 characters', () => {
    const result = validateToolData(buildToolData({ description: 'D'.repeat(501) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('description too long')));
  });

  it('should error when coreTask exceeds 200 characters', () => {
    const result = validateToolData(buildToolData({ coreTask: 'C'.repeat(201) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('coreTask too long')));
  });

  // --- URL validation ---

  it('should error for invalid URL format', () => {
    const result = validateToolData(buildToolData({ url: 'not-a-url' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('not a valid URL')));
  });

  it('should error for non-http URL protocol', () => {
    const result = validateToolData(buildToolData({ url: 'ftp://example.com' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('http or https')));
  });

  it('should error when URL hostname is in exclude list', () => {
    const result = validateToolData(buildToolData({ url: 'https://google.com/tool' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('exclude list')));
  });

  it('should error when URL hostname is a subdomain of excluded domain', () => {
    const result = validateToolData(buildToolData({ url: 'https://docs.google.com/spreadsheets' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('exclude list')));
  });

  // --- Tags validation ---

  it('should error when tags is not an array', () => {
    const result = validateToolData(buildToolData({ tags: 'not-array' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('must be an array')));
  });

  it('should error when tag key is invalid', () => {
    const result = validateToolData(buildToolData({
      tags: [
        { key: 'category', value: 'AI' },
        { key: 'invalid_key', value: 'something' },
      ],
    }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('Invalid tag key')));
  });

  it('should error when tag value is invalid for its key', () => {
    const result = validateToolData(buildToolData({
      tags: [
        { key: 'category', value: 'AI' },
        { key: 'pricing', value: 'InvalidValue' },
      ],
    }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('Invalid tag value')));
  });

  it('should error when category tag is missing', () => {
    const result = validateToolData(buildToolData({
      tags: [
        { key: 'pricing', value: 'Free' },
        { key: 'type', value: 'Web App' },
      ],
    }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('exactly one category')));
  });

  it('should error when multiple category tags are present', () => {
    const result = validateToolData(buildToolData({
      tags: [
        { key: 'category', value: 'AI' },
        { key: 'category', value: 'Design' },
      ],
    }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('exactly one category')));
  });

  // --- Optional field validation ---

  it('should error when repoUrl is not a GitHub URL', () => {
    const result = validateToolData(buildToolData({ repoUrl: 'https://gitlab.com/owner/repo' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('GitHub URL')));
  });

  it('should pass when repoUrl is a valid GitHub URL', () => {
    const result = validateToolData(buildToolData({ repoUrl: 'https://github.com/excalidraw/excalidraw' }));
    assert.equal(result.valid, true);
  });

  it('should error when twitterUrl is not twitter.com or x.com', () => {
    const result = validateToolData(buildToolData({ twitterUrl: 'https://example.com/@tool' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('twitter.com or x.com')));
  });

  it('should pass when twitterUrl is x.com', () => {
    const result = validateToolData(buildToolData({ twitterUrl: 'https://x.com/excalidraw' }));
    assert.equal(result.valid, true);
  });

  it('should error when discordUrl is not a discord URL', () => {
    const result = validateToolData(buildToolData({ discordUrl: 'https://slack.com/invite' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('discord')));
  });

  it('should pass with no optional fields', () => {
    const data = buildToolData();
    delete data.repoUrl;
    delete data.twitterUrl;
    delete data.githubUrl;
    delete data.discordUrl;
    const result = validateToolData(data);
    assert.equal(result.valid, true);
  });

  // --- Boundary cases ---

  it('should pass with name exactly 2 chars', () => {
    const result = validateToolData(buildToolData({ name: 'AB' }));
    assert.equal(result.valid, true);
  });

  it('should pass with name exactly 100 chars', () => {
    const result = validateToolData(buildToolData({ name: 'A'.repeat(100) }));
    assert.equal(result.valid, true);
  });

  it('should pass with description exactly 500 chars', () => {
    const result = validateToolData(buildToolData({ description: 'D'.repeat(500) }));
    assert.equal(result.valid, true);
  });

  it('should pass with coreTask exactly 200 chars', () => {
    const result = validateToolData(buildToolData({ coreTask: 'C'.repeat(200) }));
    assert.equal(result.valid, true);
  });
});
