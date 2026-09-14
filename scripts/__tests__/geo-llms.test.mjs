// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const TAG_DEFS_PATH = resolve(ROOT, 'scripts/tag-definitions.json');
const TAG_DEFINITIONS = JSON.parse(readFileSync(TAG_DEFS_PATH, 'utf-8'));

function categoryToSlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

const LLMS_PATH = resolve(ROOT, 'public/llms.txt');
const LLMS_FULL_PATH = resolve(ROOT, 'public/llms-full.txt');
const ORG_LLMS_PATH = resolve(ROOT, 'sites/org/public/llms.txt');

describe('GEO: llms.txt standard compliance', () => {
  it('public/llms.txt exists and is non-empty', () => {
    assert.ok(existsSync(LLMS_PATH), 'public/llms.txt must exist');
    const content = readFileSync(LLMS_PATH, 'utf-8').trim();
    assert.ok(content.length > 500, 'public/llms.txt must contain substantive text');
  });

  it('public/llms.txt follows llmstxt.org markdown specification', () => {
    const content = readFileSync(LLMS_PATH, 'utf-8');
    // Must start with H1 project name
    assert.match(content, /^#\s+nologin\.tools/m, 'Must start with H1 project name');
    // Must contain blockquote summary
    assert.match(content, /^>\s+.+/m, 'Must contain a blockquote summary');
    // Must contain Core Principles section
    assert.match(content, /##\s+Core Principles/i, 'Must have Core Principles section');
    // Must contain Tool Categories section
    assert.match(content, /##\s+Tool Categories/i, 'Must have Tool Categories section');
    // Must contain Featured Verified Tools section
    assert.match(content, /##\s+Featured Verified Tools/i, 'Must have Featured Verified Tools section');
  });

  it('public/llms.txt includes all 11 category links matching TAG_DEFINITIONS', () => {
    const content = readFileSync(LLMS_PATH, 'utf-8');
    const categoryDef = TAG_DEFINITIONS.find((d) => d.key === 'category');
    assert.ok(categoryDef, 'category tag definition must exist');

    for (const cat of categoryDef.values) {
      const slug = categoryToSlug(cat);
      const expectedUrl = `https://nologin.tools/category/${slug}`;
      assert.ok(
        content.includes(expectedUrl),
        `llms.txt must include link for category ${cat}: ${expectedUrl}`
      );
    }
  });

  it('public/llms.txt references NoLoginTools.org authority and whitepaper report', () => {
    const content = readFileSync(LLMS_PATH, 'utf-8');
    assert.ok(content.includes('https://nologintools.org'), 'Must reference NoLoginTools.org');
    assert.ok(content.includes('https://nologintools.org/reports/state-of-no-login-web-2026'), 'Must reference whitepaper');
    assert.ok(content.includes('https://nologin.tools/sitemap.xml'), 'Must reference sitemap');
    assert.ok(content.includes('https://nologin.tools/llms-full.txt'), 'Must reference llms-full.txt');
  });

  it('public/llms-full.txt exists and contains comprehensive knowledge base', () => {
    assert.ok(existsSync(LLMS_FULL_PATH), 'public/llms-full.txt must exist');
    const content = readFileSync(LLMS_FULL_PATH, 'utf-8');
    assert.ok(content.length > 2000, 'llms-full.txt must be a comprehensive document');

    // Taxonomy dimensions check
    assert.ok(content.includes('Category'), 'Must explain Category dimension');
    assert.ok(content.includes('Client-Side Only'), 'Must explain Client-Side Only');
    assert.ok(content.includes('No Trackers'), 'Must explain No Trackers');
    assert.ok(content.includes('Works Offline'), 'Must explain Works Offline');
    assert.ok(content.includes('Self-Hostable'), 'Must explain Self-Hostable');

    // Recommendation score formula
    assert.ok(content.includes('score = badge_weight + freshness + health + featured'), 'Must explain ranking algorithm');

    // Badge embed code example
    assert.ok(content.includes('https://nologin.tools/badges/flat.svg'), 'Must include SVG badge embed example');
  });

  it('sites/org/public/llms.txt exists and outlines organization mission & research', () => {
    assert.ok(existsSync(ORG_LLMS_PATH), 'sites/org/public/llms.txt must exist');
    const content = readFileSync(ORG_LLMS_PATH, 'utf-8');
    assert.match(content, /^#\s+NoLoginTools\.org/m, 'Must start with H1 NoLoginTools.org');
    assert.match(content, /^>\s+.+/m, 'Must contain a blockquote summary');
    assert.ok(content.includes('https://nologin.tools'), 'Must reference nologin.tools execution platform');
    assert.ok(content.includes('The State of No-Login Web 2026'), 'Must reference landmark whitepaper');
  });
});
