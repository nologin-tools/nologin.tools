// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const AI_TXT_PATH = resolve(ROOT, 'public/.well-known/ai.txt');
const AI_SUMMARY_PATH = resolve(ROOT, 'public/ai/summary.json');
const AI_FAQ_PATH = resolve(ROOT, 'public/ai/faq.json');
const AI_SERVICE_PATH = resolve(ROOT, 'public/ai/service.json');
const HOME_PAGE = resolve(ROOT, 'src/components/HomePage.astro');

describe('GEO: AI Discovery Endpoints & Agent Readiness', () => {
  it('public/.well-known/ai.txt exists and contains proper crawler permissions', () => {
    assert.ok(existsSync(AI_TXT_PATH), 'public/.well-known/ai.txt must exist');
    const content = readFileSync(AI_TXT_PATH, 'utf-8').trim();
    assert.ok(content.length > 50, 'ai.txt must contain substantive text');

    // Crawler permissions
    assert.match(content, /Allow-Training:\s*yes/i, 'Must specify Allow-Training');
    assert.match(content, /Allow-Inference:\s*yes/i, 'Must specify Allow-Inference');
    assert.match(content, /Allow-Citations:\s*yes/i, 'Must specify Allow-Citations');

    // Index linkages
    assert.ok(content.includes('https://nologin.tools/sitemap.xml'), 'Must link sitemap');
    assert.ok(content.includes('https://nologin.tools/llms.txt'), 'Must link llms.txt');
    assert.ok(content.includes('https://nologin.tools/llms-full.txt'), 'Must link llms-full.txt');
    assert.ok(content.includes('https://nologin.tools/ai/summary.json'), 'Must link summary.json');
  });

  it('public/ai/summary.json is valid and meets geo-optimizer length and webmcp requirements', () => {
    assert.ok(existsSync(AI_SUMMARY_PATH), 'public/ai/summary.json must exist');
    const raw = readFileSync(AI_SUMMARY_PATH, 'utf-8');
    const data = JSON.parse(raw);

    assert.ok(typeof data.name === 'string' && data.name.length >= 3, 'name must be at least 3 characters');
    assert.ok(typeof data.description === 'string' && data.description.length >= 20, 'description must be at least 20 characters');
    assert.equal(data.url, 'https://nologin.tools', 'url must match canonical site URL');
    assert.ok(typeof data.lastModified === 'string' && data.lastModified.length > 10, 'lastModified must be valid ISO date');

    // WebMCP declarations
    assert.ok(data.webmcp && data.webmcp.available === true, 'webmcp must be declared and available');
    assert.ok(Array.isArray(data.webmcp.tools) && data.webmcp.tools.length > 0, 'webmcp.tools must list tools');
  });

  it('public/ai/faq.json is valid and contains standard Q&A pairs for answer engines', () => {
    assert.ok(existsSync(AI_FAQ_PATH), 'public/ai/faq.json must exist');
    const raw = readFileSync(AI_FAQ_PATH, 'utf-8');
    const data = JSON.parse(raw);

    assert.ok(Array.isArray(data.faqs) && data.faqs.length >= 2, 'faqs must contain at least 2 items');
    for (const faq of data.faqs) {
      assert.ok(typeof faq.question === 'string' && faq.question.length >= 10, 'FAQ question must be >= 10 characters');
      assert.ok(typeof faq.answer === 'string' && faq.answer.length >= 20, 'FAQ answer must be >= 20 characters');
    }
  });

  it('public/ai/service.json is valid and declares core platform capabilities', () => {
    assert.ok(existsSync(AI_SERVICE_PATH), 'public/ai/service.json must exist');
    const raw = readFileSync(AI_SERVICE_PATH, 'utf-8');
    const data = JSON.parse(raw);

    assert.ok(typeof data.name === 'string' && data.name.length >= 3, 'name must be at least 3 characters');
    assert.ok(Array.isArray(data.capabilities) && data.capabilities.length > 0, 'capabilities must be non-empty list');
  });

  it('HomePage.astro declares SearchAction, dateModified, and Organization contactPoint', () => {
    const content = readFileSync(HOME_PAGE, 'utf-8');

    // WebSite SearchAction & dateModified
    assert.ok(content.includes('"@type": "SearchAction"'), 'WebSite schema must contain SearchAction');
    assert.ok(content.includes('"dateModified": latestApprovedAt'), 'WebSite schema must contain dateModified');
    assert.ok(content.includes('modifiedTime={latestApprovedAt}'), 'Layout must receive modifiedTime');

    // Organization contactPoint & areaServed
    assert.ok(content.includes('"areaServed": "Worldwide"'), 'Organization schema must declare areaServed');
    assert.ok(content.includes('"@type": "ContactPoint"'), 'Organization schema must declare ContactPoint');
    assert.ok(content.includes('contact@nologintools.org'), 'Organization must provide contact email');
  });
});
