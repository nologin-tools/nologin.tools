import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const headersPath = resolve(__dirname, '../../public/_headers');

function parseHeaders(content) {
  const blocks = [];
  let current = null;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      // Path line
      current = { path: trimmed, headers: [] };
      blocks.push(current);
    } else if (current) {
      current.headers.push(trimmed);
    }
  }
  return blocks;
}

// ===================== TESTS =====================

describe('_headers file', () => {
  let content;
  let blocks;

  it('can be read and parsed', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    assert.ok(blocks.length > 0, 'Should have at least one path block');
  });

  it('has valid path block format (path followed by indented headers)', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    for (const block of blocks) {
      assert.ok(block.path, 'Block should have a path');
      assert.ok(block.headers.length > 0, `Block "${block.path}" should have at least one header`);
    }
  });

  it('/_astro/* has immutable cache directive', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    const astroBlock = blocks.find((b) => b.path === '/_astro/*');
    assert.ok(astroBlock, '/_astro/* block should exist');
    const cacheHeader = astroBlock.headers.find((h) => h.startsWith('Cache-Control:'));
    assert.ok(cacheHeader, 'Cache-Control header should exist');
    assert.ok(cacheHeader.includes('immutable'), 'Should include immutable directive');
    assert.ok(cacheHeader.includes('max-age=31536000'), 'Should have 1 year max-age');
  });

  it('/* security headers still exist (regression)', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    const globalBlock = blocks.find((b) => b.path === '/*');
    assert.ok(globalBlock, '/* block should exist');
    const headerNames = globalBlock.headers.map((h) => h.split(':')[0].trim());
    assert.ok(headerNames.includes('X-Frame-Options'), 'X-Frame-Options should exist');
    assert.ok(headerNames.includes('X-Content-Type-Options'), 'X-Content-Type-Options should exist');
    assert.ok(headerNames.includes('Strict-Transport-Security'), 'HSTS should exist');
    assert.ok(headerNames.includes('Referrer-Policy'), 'Referrer-Policy should exist');
    assert.ok(headerNames.includes('Permissions-Policy'), 'Permissions-Policy should exist');
  });

  it('/blog/images/* has cache header', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    const blogBlock = blocks.find((b) => b.path === '/blog/images/*');
    assert.ok(blogBlock, '/blog/images/* block should exist');
    const cacheHeader = blogBlock.headers.find((h) => h.startsWith('Cache-Control:'));
    assert.ok(cacheHeader, 'Cache-Control header should exist for blog images');
  });

  it('/badges/* has cache header', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    const badgesBlock = blocks.find((b) => b.path === '/badges/*');
    assert.ok(badgesBlock, '/badges/* block should exist');
    const cacheHeader = badgesBlock.headers.find((h) => h.startsWith('Cache-Control:'));
    assert.ok(cacheHeader, 'Cache-Control header should exist for badges');
  });

  it('/favicon.svg has cache header', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    const faviconBlock = blocks.find((b) => b.path === '/favicon.svg');
    assert.ok(faviconBlock, '/favicon.svg block should exist');
  });

  it('/og-default.png has cache header', () => {
    content = readFileSync(headersPath, 'utf-8');
    blocks = parseHeaders(content);
    const ogBlock = blocks.find((b) => b.path === '/og-default.png');
    assert.ok(ogBlock, '/og-default.png block should exist');
  });
});
