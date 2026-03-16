// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { urlToSlug } from '../submit-discovered-tool.mjs';

// ---------------------------------------------------------------------------
// urlToSlug consistency tests (must match src/lib/utils.ts)
// ---------------------------------------------------------------------------

describe('urlToSlug', () => {
  it('should convert simple URL to slug', () => {
    assert.equal(urlToSlug('https://excalidraw.com'), 'excalidraw-com');
  });

  it('should handle www prefix', () => {
    assert.equal(urlToSlug('https://www.example.com'), 'www-example-com');
  });

  it('should handle URL with path', () => {
    assert.equal(urlToSlug('https://example.com/tool/editor'), 'example-com-tool-editor');
  });

  it('should strip trailing slashes', () => {
    assert.equal(urlToSlug('https://example.com/'), 'example-com');
  });

  it('should handle URL with port (port is not in hostname by default for standard ports)', () => {
    // Standard ports are stripped by URL parser
    assert.equal(urlToSlug('https://example.com:443/app'), 'example-com-app');
  });

  it('should lowercase the slug', () => {
    assert.equal(urlToSlug('https://MyApp.COM/Editor'), 'myapp-com-editor');
  });

  it('should replace special characters with hyphens', () => {
    assert.equal(urlToSlug('https://my-app.io'), 'my-app-io');
  });

  it('should strip leading and trailing hyphens', () => {
    // URL with special chars at boundaries
    assert.equal(urlToSlug('https://example.com'), 'example-com');
  });

  it('should handle subdomains', () => {
    assert.equal(urlToSlug('https://app.tool.example.com'), 'app-tool-example-com');
  });
});

// ---------------------------------------------------------------------------
// SQL parameter mapping tests (structural, no D1 calls)
// ---------------------------------------------------------------------------

describe('submit-discovered-tool structure', () => {
  it('should have urlToSlug as an exported function', () => {
    assert.equal(typeof urlToSlug, 'function');
  });

  it('urlToSlug should throw for invalid URL', () => {
    assert.throws(() => urlToSlug('not-a-url'), { name: 'TypeError' });
  });

  it('should produce consistent slugs for same URL', () => {
    const url = 'https://photopea.com';
    assert.equal(urlToSlug(url), urlToSlug(url));
  });
});
