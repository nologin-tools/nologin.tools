import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeScore } from '../../src/lib/score.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const BUILD_DATA_PATH = resolve(ROOT, 'src/data/build-data.json');
const EDITORIAL_PATH = resolve(ROOT, 'src/data/tool-editorial.json');
const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

describe('Editor\'s Choice Discovery & Alternative Recommendations', () => {
  const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
  const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
  const approvedTools = (buildData.tools || []).filter(t => t.status === 'approved');

  it('identifies all 42 Editor\'s Choice tools with score >= 90', () => {
    const editorsTools = approvedTools.filter(t => {
      const ed = editorial[t.slug]?.en;
      return ed?.verdictTier === 'editors-choice';
    });

    assert.equal(editorsTools.length, 42, 'Must have exactly 42 Editor Choice tools in approved catalog');

    for (const tool of editorsTools) {
      const ed = editorial[tool.slug]?.en;
      assert.ok(ed.productScore.overall >= 90, `${tool.slug} Editor Choice score must be >= 90 (got ${ed.productScore.overall})`);
      assert.ok(ed.productScore.depth >= 22, `${tool.slug} Editor Choice depth must be >= 22 (got ${ed.productScore.depth})`);
    }
  });

  it('correctly sorts Editor Choice tools using unified recommendation scores', () => {
    const editorsToolsWithScore = approvedTools
      .filter(t => editorial[t.slug]?.en?.verdictTier === 'editors-choice')
      .map(tool => {
        const ed = editorial[tool.slug]?.en;
        const score = computeScore(tool, { status: 'online' }, ed);
        return { tool, score, ed };
      })
      .sort((a, b) => b.score - a.score);

    for (let i = 1; i < editorsToolsWithScore.length; i++) {
      assert.ok(
        editorsToolsWithScore[i - 1].score >= editorsToolsWithScore[i].score,
        `Index ${i - 1} (${editorsToolsWithScore[i - 1].score}) must be >= index ${i} (${editorsToolsWithScore[i].score})`
      );
    }
  });

  it('recommends top-rated Editor Choice workstation in the same category for lower-tier tools', () => {
    // In Design category, find a non-Editor's Choice tool
    const designTools = approvedTools.filter(t =>
      t.tags.some(tag => tag.tagKey === 'category' && tag.tagValue === 'Design')
    );

    const nonWorkstations = designTools.filter(t => editorial[t.slug]?.en?.verdictTier !== 'editors-choice');
    assert.ok(nonWorkstations.length > 0, 'Must have non-workstation tools in Design');

    const sample = nonWorkstations[0];

    // Find top Editor's Choice alternative in Design
    const topAlt = designTools
      .filter(t => t.slug !== sample.slug && editorial[t.slug]?.en?.verdictTier === 'editors-choice')
      .sort((a, b) => (editorial[b.slug]?.en?.productScore?.overall ?? 0) - (editorial[a.slug]?.en?.productScore?.overall ?? 0))[0];

    assert.ok(topAlt, 'Should find top alternative in Design');
    assert.equal(editorial[topAlt.slug]?.en?.verdictTier, 'editors-choice');
    assert.ok((editorial[topAlt.slug]?.en?.productScore?.overall ?? 0) >= 90);
    assert.notEqual(topAlt.slug, sample.slug);
  });

  it('ensures all 8 locales contain required Discovery i18n keys', () => {
    const requiredKeys = [
      'home.editorsChoiceSpotlight',
      'home.editorsChoiceHeading',
      'home.editorsChoiceSubtitle',
      'tool.editorial.topWorkstation',
      'tool.editorial.viewWorkstation'
    ];

    for (const loc of LOCALES) {
      const filePath = resolve(ROOT, 'src/i18n', `${loc}.json`);
      const dict = JSON.parse(readFileSync(filePath, 'utf-8'));
      for (const key of requiredKeys) {
        assert.ok(dict[key], `[${loc}] Missing key: ${key}`);
        assert.ok(dict[key].trim().length > 0, `[${loc}] Key ${key} must not be empty`);
      }
    }
  });
});
