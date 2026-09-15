import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateDynamicBadgeSvg,
  measureBadgeTextWidth,
  getDynamicBadgeEmbedCode,
} from '../../src/lib/badge.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

describe('Dynamic Badge & Certificate OG Subsystem', () => {
  describe('Text Measurement for Pixel-Perfect Badges', () => {
    it('accurately estimates character widths', () => {
      assert.ok(measureBadgeTextWidth('verified') >= 35 && measureBadgeTextWidth('verified') <= 55);
      assert.ok(measureBadgeTextWidth('verified active') > measureBadgeTextWidth('verified'));
      assert.ok(measureBadgeTextWidth('pending') >= 35 && measureBadgeTextWidth('pending') <= 55);
      assert.ok(measureBadgeTextWidth('not found') >= 40 && measureBadgeTextWidth('not found') <= 65);
    });

    it('gives higher width to uppercase letters than lowercase', () => {
      assert.ok(measureBadgeTextWidth('ABC') > measureBadgeTextWidth('abc'));
    });
  });

  describe('Dynamic Badge SVG Generator', () => {
    it('generates standard verified badge with correct colors and dimensions', () => {
      const svg = generateDynamicBadgeSvg({ status: 'verified' });
      assert.ok(svg.startsWith('<svg'));
      assert.ok(svg.endsWith('</svg>'));
      assert.ok(svg.includes('fill="#4c1"'), 'Should contain green right background');
      assert.ok(svg.includes('>verified<'), 'Should display verified text');
      assert.ok(svg.includes('>nologin<'), 'Should display nologin label');
      assert.ok(svg.includes('width="118"'), 'Should match standard 118px flat width');
      assert.ok(svg.includes('aria-label="Verified by NoLoginTools.org"'));
    });

    it('generates Level 3 active exhibitor badge with expanded width and emerald color', () => {
      const svg = generateDynamicBadgeSvg({ status: 'active' });
      assert.ok(svg.includes('fill="#16a34a"'), 'Should contain emerald active color');
      assert.ok(svg.includes('>verified active<'), 'Should display verified active');
      assert.ok(svg.includes('fill="#1e293b"'), 'Should have sleek dark slate left section');
      // Active badge has longer text so total width should be wider than 150px
      const match = svg.match(/width="(\d+)"/);
      assert.ok(match, 'Width attribute should exist');
      const width = parseInt(match[1], 10);
      assert.ok(width >= 150, `Expected width >= 150, got ${width}`);
    });

    it('generates pending badge with amber color', () => {
      const svg = generateDynamicBadgeSvg({ status: 'pending' });
      assert.ok(svg.includes('fill="#eab308"'), 'Should contain amber color');
      assert.ok(svg.includes('>pending<'));
    });

    it('generates not_found badge with neutral grey color', () => {
      const svg = generateDynamicBadgeSvg({ status: 'not_found' });
      assert.ok(svg.includes('fill="#737373"'), 'Should contain neutral grey color');
      assert.ok(svg.includes('>not found<'));
    });

    it('supports flat-square style with rx="0"', () => {
      const svg = generateDynamicBadgeSvg({ status: 'verified', style: 'flat-square' });
      assert.ok(svg.includes('rx="0"'), 'Should have zero border radius for square');
    });

    it('supports flat-dark style with dark left background', () => {
      const svg = generateDynamicBadgeSvg({ status: 'verified', style: 'flat-dark' });
      assert.ok(svg.includes('fill="#2d2d2d"'), 'Should have dark left background');
    });

    it('supports custom tool title for accessibility', () => {
      const svg = generateDynamicBadgeSvg({
        status: 'verified',
        title: 'Excalidraw — Verified by NoLoginTools.org',
      });
      assert.ok(svg.includes('aria-label="Excalidraw — Verified by NoLoginTools.org"'));
      assert.ok(svg.includes('<title>Excalidraw — Verified by NoLoginTools.org</title>'));
    });
  });

  describe('Dynamic Badge Embed Code', () => {
    it('produces embed code pointing to /api/badge/[slug].svg', () => {
      const embed = getDynamicBadgeEmbedCode('excalidraw-com', 'https://nologin.tools');
      assert.equal(
        embed.markdown,
        '[![NoLogin Verified](https://nologin.tools/api/badge/excalidraw-com.svg)](https://nologin.tools/badge/excalidraw-com "Verified by NoLoginTools.org")'
      );
      assert.ok(embed.svg.includes('src="https://nologin.tools/api/badge/excalidraw-com.svg"'));
      assert.ok(embed.svg.includes('href="https://nologin.tools/badge/excalidraw-com"'));
    });
  });

  describe('Endpoint File Integrity', () => {
    it('ensures dynamic badge API file exists and is valid', () => {
      const filePath = join(rootDir, 'src/pages/api/badge/[slug].ts');
      assert.ok(existsSync(filePath), 'src/pages/api/badge/[slug].ts should exist');
      const content = readFileSync(filePath, 'utf8');
      assert.ok(content.includes('generateDynamicBadgeSvg'));
      assert.ok(content.includes('Cache-Control'));
      assert.ok(content.includes('image/svg+xml'));
    });

    it('ensures Certificate OG generator endpoint exists and is valid', () => {
      const filePath = join(rootDir, 'src/pages/api/og/badge/[slug].ts');
      assert.ok(existsSync(filePath), 'src/pages/api/og/badge/[slug].ts should exist');
      const content = readFileSync(filePath, 'utf8');
      assert.ok(content.includes('@cf-wasm/og/workerd'));
      assert.ok(content.includes('NLW-STD-001'));
      assert.ok(content.includes('Digital Trust Certificate'));
    });
  });
});
