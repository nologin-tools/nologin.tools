// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const MAIN_ROBOTS_PATH = resolve(ROOT, 'public/robots.txt');
const ORG_ROBOTS_PATH = resolve(ROOT, 'sites/org/public/robots.txt');

describe('SEO & GEO: robots.txt compliance', () => {
  it('public/robots.txt exists', () => {
    assert.ok(existsSync(MAIN_ROBOTS_PATH), 'public/robots.txt must exist');
  });

  it('public/robots.txt explicitly configures key AI search crawlers', () => {
    const content = readFileSync(MAIN_ROBOTS_PATH, 'utf-8');
    const aiBots = [
      'PerplexityBot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'GPTBot',
      'ClaudeBot',
      'anthropic-ai',
      'Google-Extended',
      'Applebot-Extended',
      'Meta-ExternalAgent',
    ];

    for (const bot of aiBots) {
      assert.ok(
        content.includes(`User-agent: ${bot}`),
        `robots.txt must contain User-agent for ${bot}`
      );
    }
  });

  it('public/robots.txt protects sensitive /admin and /api/ paths', () => {
    const content = readFileSync(MAIN_ROBOTS_PATH, 'utf-8');
    assert.ok(content.includes('Disallow: /admin'), 'Must disallow /admin');
    assert.ok(content.includes('Disallow: /api/'), 'Must disallow /api/');
    assert.ok(content.includes('Disallow: /ssr/'), 'Must disallow /ssr/');
  });

  it('public/robots.txt declares sitemap and llms-txt', () => {
    const content = readFileSync(MAIN_ROBOTS_PATH, 'utf-8');
    assert.ok(
      content.includes('Sitemap: https://nologin.tools/sitemap.xml'),
      'Must declare sitemap.xml location'
    );
    assert.ok(
      content.includes('llms-txt: https://nologin.tools/llms.txt'),
      'Must declare llms-txt location'
    );
  });

  it('sites/org/public/robots.txt exists and configures AI crawlers and llms-txt', () => {
    assert.ok(existsSync(ORG_ROBOTS_PATH), 'sites/org/public/robots.txt must exist');
    const content = readFileSync(ORG_ROBOTS_PATH, 'utf-8');
    assert.ok(content.includes('User-agent: PerplexityBot'), 'Org robots must include PerplexityBot');
    assert.ok(content.includes('User-agent: OAI-SearchBot'), 'Org robots must include OAI-SearchBot');
    assert.ok(content.includes('User-agent: ClaudeBot'), 'Org robots must include ClaudeBot');
    assert.ok(
      content.includes('Sitemap: https://nologintools.org/sitemap.xml'),
      'Org robots must declare sitemap.xml'
    );
    assert.ok(
      content.includes('llms-txt: https://nologintools.org/llms.txt'),
      'Org robots must declare llms-txt'
    );
  });
});
