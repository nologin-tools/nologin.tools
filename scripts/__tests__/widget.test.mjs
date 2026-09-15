// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const widgetPath = resolve(__dirname, '../../public/widget.js');

describe('NoLogin Switcher Web Widget', () => {
  it('exists in public/ directory', () => {
    assert.ok(existsSync(widgetPath), 'public/widget.js does not exist');
  });

  it('has valid JavaScript syntax without parse errors', () => {
    assert.doesNotThrow(() => {
      execSync(`node --check "${widgetPath}"`);
    });
  });

  it('is ultra-compact (<4KB gzipped)', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    const gzipped = gzipSync(code);
    assert.ok(gzipped.length < 4096, `Widget gzipped size is ${gzipped.length} bytes, expected < 4096 bytes`);
  });

  it('uses Shadow DOM for complete CSS isolation', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    assert.ok(code.includes('attachShadow'), 'Widget does not attach shadow DOM');
    assert.ok(code.includes("mode: 'open'") || code.includes('mode:"open"'), 'Widget should use open shadow DOM mode');
  });

  it('parses all supported configurable data attributes', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    assert.ok(code.includes('data-category'), 'Widget should support data-category');
    assert.ok(code.includes('data-alternative'), 'Widget should support data-alternative');
    assert.ok(code.includes('data-theme'), 'Widget should support data-theme');
    assert.ok(code.includes('data-max'), 'Widget should support data-max');
    assert.ok(code.includes('data-lang'), 'Widget should support data-lang');
    assert.ok(code.includes('data-title'), 'Widget should support data-title');
  });

  it('implements strict XSS sanitization helper', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    assert.ok(code.includes('&amp;'), 'XSS helper should escape &');
    assert.ok(code.includes('&lt;'), 'XSS helper should escape <');
    assert.ok(code.includes('&gt;'), 'XSS helper should escape >');
    assert.ok(code.includes('&quot;'), 'XSS helper should escape "');
    assert.ok(code.includes('&#39;'), 'XSS helper should escape single quotes');
  });

  it('supports light, dark, and auto responsive themes', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    assert.ok(code.includes('nl-dark'), 'CSS should define dark theme');
    assert.ok(code.includes('nl-light'), 'CSS should define light theme');
    assert.ok(code.includes('nl-auto'), 'CSS should define auto theme');
    assert.ok(code.includes('prefers-color-scheme'), 'CSS should include prefers-color-scheme media queries');
  });

  it('supports self-mounting script tags alongside explicit div containers', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    assert.ok(code.includes('.nologin-widget'), 'Should query explicit .nologin-widget divs');
    assert.ok(code.includes('script[src*="widget.js"]'), 'Should query self-mounting script tags');
  });

  it('exposes global NoLoginWidget API for programmatic SPA invocation', () => {
    const code = readFileSync(widgetPath, 'utf-8');
    assert.ok(code.includes('window.NoLoginWidget'), 'Should expose window.NoLoginWidget controller');
    assert.ok(code.includes('render: renderWidget'), 'Should expose render method');
    assert.ok(code.includes('init: initWidgets'), 'Should expose init method');
  });
});
