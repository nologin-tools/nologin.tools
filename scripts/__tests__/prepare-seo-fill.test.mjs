// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildIssueBody } from '../prepare-seo-fill.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTools(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Tool ${i + 1}`,
    slug: `tool-${i + 1}`,
    url: `https://tool${i + 1}.com`,
    description: `Description for tool ${i + 1}`,
    core_task: `Core task for tool ${i + 1}`,
  }));
}

function buildTagMap(tools) {
  const map = new Map();
  for (const tool of tools) {
    map.set(tool.id, [`category:Design`, `pricing:Free`]);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildIssueBody', () => {
  it('should include all tool names in the body', () => {
    const tools = buildTools(3);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('Tool 1'));
    assert.ok(body.includes('Tool 2'));
    assert.ok(body.includes('Tool 3'));
  });

  it('should include tool slugs', () => {
    const tools = buildTools(2);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('`tool-1`'));
    assert.ok(body.includes('`tool-2`'));
  });

  it('should include tool URLs', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('https://tool1.com'));
  });

  it('should include tool descriptions and core tasks', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('Description for tool 1'));
    assert.ok(body.includes('Core task for tool 1'));
  });

  it('should include tags from tagMap', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('category:Design'));
    assert.ok(body.includes('pricing:Free'));
  });

  it('should handle tools with no tags', () => {
    const tools = buildTools(1);
    const emptyTagMap = new Map();
    const body = buildIssueBody(tools, emptyTagMap);
    assert.ok(body.includes('Tool 1'));
    assert.ok(!body.includes('**Tags**'));
  });

  it('should include SEO writing standards', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('SEO Writing Standards'));
    assert.ok(body.includes('≤ 44 chars'));
    assert.ok(body.includes('120-155 chars'));
    assert.ok(body.includes('seoIntent'));
    assert.ok(body.includes('seoTaskPhrase'));
  });

  it('should include the tool count in the title line', () => {
    const tools = buildTools(5);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('5 tool(s) need SEO metadata'));
  });

  it('should include JSON format example', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('.github/auto-seo/{slug}.json'));
  });

  it('should include no-login intent requirement', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('without login'));
    assert.ok(body.includes('without signup'));
  });

  it('should include quality rules', () => {
    const tools = buildTools(1);
    const body = buildIssueBody(tools, buildTagMap(tools));
    assert.ok(body.includes('unique'));
    assert.ok(body.includes('helps you'));
  });
});
