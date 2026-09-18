// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeScore } from '../../src/lib/score.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const EDITORIAL_PATH = resolve(ROOT, 'src/data/tool-editorial.json');

describe('Unified 5D Scoring Model & Recommendation Rebalancing', () => {
  it('calculates computeScore with rebalanced weights: explicit badge=4, implicit=2, none=0', () => {
    const baseTool = {
      id: 1,
      name: 'Test Tool',
      url: 'https://test.example.com',
      slug: 'test-example-com',
      description: 'A test tool',
      status: 'approved',
      approvedAt: new Date().toISOString(), // fresh < 30d -> freshness = 5
      badgeDisplayType: 'explicit',
      isFeatured: false,
      tags: [],
      healthChecks: [],
    };
    const healthOnline = { status: 'online' };

    // Explicit badge (+4) + Freshness (+5) + Health (+3) + Product (0) + Evergreen (0) = 12
    const scoreExplicit = computeScore(baseTool, healthOnline);
    assert.equal(scoreExplicit, 12);

    // Implicit badge (+2)
    const scoreImplicit = computeScore({ ...baseTool, badgeDisplayType: 'implicit' }, healthOnline);
    assert.equal(scoreImplicit, 10);

    // None (+0)
    const scoreNone = computeScore({ ...baseTool, badgeDisplayType: 'none' }, healthOnline);
    assert.equal(scoreNone, 8);
  });

  it('awards Evergreen boost (+3) for mature tools (>= 60 days) with continuous online health', () => {
    const matureDate = new Date(Date.now() - 100 * 86400000).toISOString(); // 100 days old -> freshness = 1
    const matureTool = {
      id: 2,
      name: 'Classic Stable Tool',
      url: 'https://stable.example.com',
      slug: 'stable-example-com',
      description: 'Classic stable tool',
      status: 'approved',
      approvedAt: matureDate,
      badgeDisplayType: 'none',
      isFeatured: false,
      tags: [],
      healthChecks: [],
    };

    // When online: Badge (0) + Freshness (1) + Health (3) + Evergreen (+3) = 7
    const scoreOnline = computeScore(matureTool, { status: 'online' });
    assert.equal(scoreOnline, 7);

    // When unstable: Badge (0) + Freshness (1) + Health (1) + Evergreen (0) = 2
    const scoreUnstable = computeScore(matureTool, { status: 'unstable' });
    assert.equal(scoreUnstable, 2);
  });

  it('boosts high-performing audited tools up to +10 in recommendation score', () => {
    const freshTool = {
      id: 3,
      name: 'Photopea',
      url: 'https://photopea.com',
      slug: 'photopea-com',
      description: 'Photo editor',
      status: 'approved',
      approvedAt: new Date().toISOString(), // freshness = 5
      badgeDisplayType: 'none',
      isFeatured: false,
      tags: [],
      healthChecks: [],
    };
    const editorialJson = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
    const photopeaEditorial = editorialJson['photopea-com']?.en;

    // Badge (0) + Freshness (5) + Health (3) + ProductBoost (10) = 18
    const score = computeScore(freshTool, { status: 'online' }, photopeaEditorial);
    assert.equal(score, 18);
  });

  it('ensures all entries in tool-editorial.json adhere to the 5D Product Power schema', () => {
    const editorialJson = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
    let verifiedCount = 0;

    for (const [slug, locales] of Object.entries(editorialJson)) {
      for (const [lang, entry] of Object.entries(locales)) {
        if (!entry || !entry.productScore) continue;
        const ps = entry.productScore;

        assert.ok(typeof ps.overall === 'number' && ps.overall >= 0 && ps.overall <= 100, `${slug}.${lang}.overall must be 0-100`);
        assert.ok(typeof ps.frictionless === 'number' && ps.frictionless >= 0 && ps.frictionless <= 20, `${slug}.${lang}.frictionless must be 0-20`);
        assert.ok(typeof ps.depth === 'number' && ps.depth >= 0 && ps.depth <= 25, `${slug}.${lang}.depth must be 0-25`);
        assert.ok(typeof ps.exportFreedom === 'number' && ps.exportFreedom >= 0 && ps.exportFreedom <= 20, `${slug}.${lang}.exportFreedom must be 0-20`);
        assert.ok(typeof ps.privacy === 'number' && ps.privacy >= 0 && ps.privacy <= 20, `${slug}.${lang}.privacy must be 0-20`);
        assert.ok(typeof ps.polish === 'number' && ps.polish >= 0 && ps.polish <= 15, `${slug}.${lang}.polish must be 0-15`);

        const sum = ps.frictionless + ps.depth + ps.exportFreedom + ps.privacy + ps.polish;
        assert.equal(sum, ps.overall, `${slug}.${lang} 5 dimensions sum (${sum}) must equal overall (${ps.overall})`);

        verifiedCount++;
      }
    }

    assert.ok(verifiedCount >= 100, `Must verify at least 100 locale entries (found ${verifiedCount})`);
  });
});
