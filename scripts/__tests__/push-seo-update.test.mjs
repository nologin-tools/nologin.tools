// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSeoData } from '../push-seo-update.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSeoData(overrides = {}) {
  return {
    seoTitle: 'Excalidraw — Free Online Whiteboard',
    seoDescription: 'Draw hand-sketched diagrams and wireframes right in your browser. Real-time collaboration, PNG/SVG export — no signup needed.',
    seoFocusKeyword: 'excalidraw online whiteboard free',
    seoIntent: 'task',
    seoTaskPhrase: 'draw diagrams collaboratively without signup',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateSeoData', () => {
  it('should pass for valid data', () => {
    const result = validateSeoData(buildSeoData());
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  // --- Missing fields ---

  it('should error when seoTitle is missing', () => {
    const result = validateSeoData(buildSeoData({ seoTitle: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoTitle')));
  });

  it('should error when seoDescription is missing', () => {
    const result = validateSeoData(buildSeoData({ seoDescription: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoDescription')));
  });

  it('should error when seoFocusKeyword is missing', () => {
    const result = validateSeoData(buildSeoData({ seoFocusKeyword: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoFocusKeyword')));
  });

  it('should error when seoIntent is missing', () => {
    const result = validateSeoData(buildSeoData({ seoIntent: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoIntent')));
  });

  it('should error when seoTaskPhrase is missing', () => {
    const result = validateSeoData(buildSeoData({ seoTaskPhrase: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoTaskPhrase')));
  });

  // --- Length limits ---

  it('should error when seoTitle exceeds 80 chars', () => {
    const result = validateSeoData(buildSeoData({ seoTitle: 'T'.repeat(81) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoTitle too long')));
  });

  it('should pass with seoTitle at exactly 80 chars', () => {
    const result = validateSeoData(buildSeoData({ seoTitle: 'T'.repeat(80) }));
    assert.equal(result.valid, true);
  });

  it('should error when seoDescription exceeds 180 chars', () => {
    const result = validateSeoData(buildSeoData({ seoDescription: 'D'.repeat(181) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoDescription too long')));
  });

  it('should pass with seoDescription at exactly 180 chars', () => {
    const result = validateSeoData(buildSeoData({ seoDescription: 'D'.repeat(180) }));
    assert.equal(result.valid, true);
  });

  it('should error when seoFocusKeyword exceeds 120 chars', () => {
    const result = validateSeoData(buildSeoData({ seoFocusKeyword: 'K'.repeat(121) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoFocusKeyword too long')));
  });

  it('should error when seoTaskPhrase exceeds 120 chars', () => {
    const result = validateSeoData(buildSeoData({ seoTaskPhrase: 'P'.repeat(121) }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoTaskPhrase too long')));
  });

  // --- Intent validation ---

  it('should accept task intent', () => {
    const result = validateSeoData(buildSeoData({ seoIntent: 'task' }));
    assert.equal(result.valid, true);
  });

  it('should accept alternative intent', () => {
    const result = validateSeoData(buildSeoData({ seoIntent: 'alternative' }));
    assert.equal(result.valid, true);
  });

  it('should accept review intent', () => {
    const result = validateSeoData(buildSeoData({ seoIntent: 'review' }));
    assert.equal(result.valid, true);
  });

  it('should error for invalid intent', () => {
    const result = validateSeoData(buildSeoData({ seoIntent: 'homepage' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('seoIntent')));
  });

  // --- No-login intent ---

  it('should error when seoTaskPhrase lacks no-login intent', () => {
    const result = validateSeoData(buildSeoData({
      seoTaskPhrase: 'draw diagrams collaboratively online',
    }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('no-login intent')));
  });

  it('should accept "without login" in seoTaskPhrase', () => {
    const result = validateSeoData(buildSeoData({
      seoTaskPhrase: 'draw diagrams without login',
    }));
    assert.equal(result.valid, true);
  });

  it('should accept "no account" in seoTaskPhrase', () => {
    const result = validateSeoData(buildSeoData({
      seoTaskPhrase: 'compress images with no account required',
    }));
    assert.equal(result.valid, true);
  });

  it('should accept "no signup" in seoTaskPhrase', () => {
    const result = validateSeoData(buildSeoData({
      seoTaskPhrase: 'edit photos online no signup',
    }));
    assert.equal(result.valid, true);
  });

  // --- Multiple errors ---

  it('should report multiple errors at once', () => {
    const result = validateSeoData({});
    assert.equal(result.valid, false);
    assert.ok(result.errors.length >= 5);
  });
});
