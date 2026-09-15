// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALTERNATIVE_TARGETS,
  getAlternativeTargets,
  getAlternativeBySlug,
  findAlternativeByAlias,
} from '../../src/lib/alternatives-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const editorialPath = resolve(__dirname, '../../src/data/tool-editorial.json');
/** @type {Record<string, Record<string, { alternativeTo?: string[]; bestFor?: string; pros?: string[]; cons?: string[]; privacyVerdict?: string }>>} */
const editorialData = JSON.parse(readFileSync(editorialPath, 'utf-8'));

describe('Alternative Targets Definitions', () => {
  it('defines 16 high-intent software targets', () => {
    assert.equal(ALTERNATIVE_TARGETS.length, 16);
    const targets = getAlternativeTargets();
    assert.equal(targets.length, 16);
  });

  it('has valid URL-safe slugs for all targets', () => {
    const slugRegex = /^[a-z0-9-]+$/;
    for (const target of ALTERNATIVE_TARGETS) {
      assert.ok(slugRegex.test(target.slug), `Target ${target.name} has invalid slug: ${target.slug}`);
      assert.ok(target.name.length > 0, `Target slug ${target.slug} has empty name`);
      assert.ok(target.headline.length > 10, `Target slug ${target.slug} has headline too short`);
      assert.ok(target.primaryUtility.length > 5, `Target slug ${target.slug} has primaryUtility too short`);
      assert.ok(target.aliases.length > 0, `Target slug ${target.slug} has no aliases`);
    }
  });

  it('ensures all target slugs are unique', () => {
    const slugs = ALTERNATIVE_TARGETS.map((t) => t.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(uniqueSlugs.size, slugs.length, 'Duplicate slugs found in ALTERNATIVE_TARGETS');
  });
});

describe('getAlternativeBySlug', () => {
  it('resolves valid target by slug', () => {
    const photoshop = getAlternativeBySlug('photoshop');
    assert.ok(photoshop);
    assert.equal(photoshop.name, 'Adobe Photoshop');
    assert.equal(photoshop.category, 'Design');

    const canva = getAlternativeBySlug('canva');
    assert.ok(canva);
    assert.equal(canva.name, 'Canva');

    const figma = getAlternativeBySlug('figma');
    assert.ok(figma);
    assert.equal(figma.name, 'Figma');
  });

  it('returns undefined for non-existent target slug', () => {
    assert.equal(getAlternativeBySlug('non-existent-software'), undefined);
    assert.equal(getAlternativeBySlug(''), undefined);
  });
});

describe('findAlternativeByAlias', () => {
  it('matches target by exact canonical name', () => {
    const target = findAlternativeByAlias('Adobe Photoshop');
    assert.ok(target);
    assert.equal(target.slug, 'photoshop');
  });

  it('matches target case-insensitively', () => {
    const target = findAlternativeByAlias('adobe photoshop');
    assert.ok(target);
    assert.equal(target.slug, 'photoshop');
  });

  it('matches target by alias variants', () => {
    assert.equal(findAlternativeByAlias('Photoshop')?.slug, 'photoshop');
    assert.equal(findAlternativeByAlias('Adobe Photoshop Save for Web')?.slug, 'photoshop');
    assert.equal(findAlternativeByAlias('Canva Pro Background Remover')?.slug, 'canva');
    assert.equal(findAlternativeByAlias('Figma FigJam')?.slug, 'figma');
    assert.equal(findAlternativeByAlias('Apple Freeform')?.slug, 'miro');
    assert.equal(findAlternativeByAlias('Microsoft Visio')?.slug, 'lucidchart');
    assert.equal(findAlternativeByAlias('QuillBot')?.slug, 'grammarly');
  });

  it('returns undefined for unknown software alias', () => {
    assert.equal(findAlternativeByAlias('UnknownSoftwareXYZ123'), undefined);
  });
});

describe('Editorial Tool Matching for All 16 Targets', () => {
  function getMatchingSlugs(target) {
    const matchingSlugs = new Set();
    for (const [toolSlug, entry] of Object.entries(editorialData)) {
      const alts = entry.en?.alternativeTo || [];
      if (alts.some((a) => target.aliases.some((alias) => alias.toLowerCase() === a.toLowerCase()))) {
        matchingSlugs.add(toolSlug);
      }
    }
    return Array.from(matchingSlugs);
  }

  it('ensures every single target has at least 1 verified tool match', () => {
    for (const target of ALTERNATIVE_TARGETS) {
      const matched = getMatchingSlugs(target);
      assert.ok(
        matched.length >= 1,
        `Target ${target.slug} (${target.name}) must have at least 1 matched tool, got 0`
      );
    }
  });

  it('matches high-intent tools for Photoshop', () => {
    const matched = getMatchingSlugs(getAlternativeBySlug('photoshop'));
    assert.ok(matched.includes('photopea-com'), 'Photopea should be matched for Photoshop');
    assert.ok(matched.includes('remove-bg'), 'Remove.bg should be matched for Photoshop');

    const photopea = editorialData['photopea-com']?.en;
    assert.ok(photopea);
    assert.ok(photopea.pros.length > 0);
    assert.ok(photopea.cons.length > 0);
    assert.ok(photopea.privacyVerdict.length > 0);
  });

  it('matches high-intent tools for Figma and Miro', () => {
    const figmaMatched = getMatchingSlugs(getAlternativeBySlug('figma'));
    assert.ok(figmaMatched.includes('excalidraw-com') || figmaMatched.includes('tldraw-com'));

    const miroMatched = getMatchingSlugs(getAlternativeBySlug('miro'));
    assert.ok(miroMatched.includes('excalidraw-com') || miroMatched.includes('tldraw-com'));
  });

  it('matches high-intent tools for Zoom, Notion, and Smallpdf', () => {
    assert.ok(getMatchingSlugs(getAlternativeBySlug('zoom')).includes('meet-jit-si'));
    assert.ok(getMatchingSlugs(getAlternativeBySlug('notion')).includes('dillinger-io'));
    assert.ok(getMatchingSlugs(getAlternativeBySlug('smallpdf')).includes('tools-pdf24-org-en'));
  });
});
