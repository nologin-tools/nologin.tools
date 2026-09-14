// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const TOOL_DETAIL_PAGE = resolve(ROOT, 'src/components/ToolDetailPage.astro');
const HOME_PAGE = resolve(ROOT, 'src/components/HomePage.astro');
const LAYOUT = resolve(ROOT, 'src/layouts/Layout.astro');

describe('SEO & GEO: Structured Data & Semantic Markup', () => {
  it('ToolDetailPage has visible FAQ section matching FAQPage schema', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');

    // Must have FAQPage JSON-LD
    assert.ok(content.includes("'@type': 'FAQPage'"), 'Must contain FAQPage in JSON-LD');
    assert.ok(content.includes("'tool.faq.q1'"), 'FAQPage must contain question 1');
    assert.ok(content.includes("'tool.faq.q2'"), 'FAQPage must contain question 2');

    // Must have visible FAQ HTML section
    assert.ok(content.includes('<section class="border-t border-neutral-100 pt-8" aria-labelledby="tool-faq-heading">'), 'Must render visible FAQ section in HTML');
    assert.ok(content.includes("t(locale, 'tool.faq.q1', { name: tool.name })"), 'Visible FAQ must display question 1');
    assert.ok(content.includes("t(locale, 'tool.faq.q2', { name: tool.name })"), 'Visible FAQ must display question 2');
    assert.ok(content.includes("t(locale, 'tool.faq.a1', { name: tool.name })"), 'Visible FAQ must display answer 1');
    assert.ok(content.includes("t(locale, 'tool.faq.a2', { name: tool.name, coreTask: tool.coreTask })"), 'Visible FAQ must display answer 2');
  });

  it('ToolDetailPage has Verification Details factsheet for GEO quotability', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');
    assert.ok(content.includes('Verification Details'), 'Must render Verification Details section');
    assert.ok(content.includes('None Required'), 'Must prominently show None Required for account');
    assert.ok(content.includes('Category'), 'Must show Category in factsheet');
    assert.ok(content.includes('Processing'), 'Must show Processing in factsheet');
    assert.ok(content.includes('Pricing'), 'Must show Pricing in factsheet');
  });

  it('ToolDetailPage has enhanced SoftwareApplication schema', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');
    assert.ok(content.includes('isAccessibleForFree: true'), 'Must declare isAccessibleForFree: true');
    assert.ok(content.includes('featureList'), 'Must include featureList');
    assert.ok(content.includes('operatingSystem: \'All, Web Browser\''), 'Must include operatingSystem');
    assert.ok(content.includes('getApplicationCategory('), 'Must dynamically resolve applicationCategory');
    assert.ok(content.includes("name: 'NoLoginTools.org'"), 'Must attribute publisher to NoLoginTools.org');
  });

  it('HomePage has enhanced WebSite and Organization schema', () => {
    const content = readFileSync(HOME_PAGE, 'utf-8');
    assert.ok(content.includes('"@type": "WebSite"'), 'Must contain WebSite schema');
    assert.ok(content.includes('"@id": "https://nologin.tools/#organization"'), 'WebSite must reference organization ID');
    assert.ok(content.includes('"about": {'), 'WebSite must declare about entity');
    assert.ok(content.includes('"knowsAbout": ['), 'Organization must declare knowsAbout entity topics');
  });

  it('Layout.astro includes standard SEO and GEO meta tags', () => {
    const content = readFileSync(LAYOUT, 'utf-8');
    assert.ok(content.includes('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />'), 'Must set robots max-snippet');
    assert.ok(content.includes('<link rel="canonical" href={canonicalUrl} />'), 'Must include canonical URL');
    assert.ok(content.includes('<link rel="alternate" hreflang="x-default"'), 'Must include x-default hreflang');
    assert.ok(content.includes('<meta property="og:image" content={ogImageUrl} />'), 'Must include OpenGraph image');
    assert.ok(content.includes('<meta name="twitter:card" content="summary_large_image" />'), 'Must include Twitter large card');
    assert.ok(content.includes('INDEXABLE_LOCALES.filter'), 'Must filter hreflang links to INDEXABLE_LOCALES to avoid noindex conflicts');
  });
});
