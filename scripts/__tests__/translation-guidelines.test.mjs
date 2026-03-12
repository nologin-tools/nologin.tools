// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(__dirname, '..');
const ROOT = resolve(SCRIPTS_DIR, '..');

const GUIDELINES_PATH = resolve(SCRIPTS_DIR, 'translation-guidelines.md');
const TRANSLATE_YML_PATH = resolve(ROOT, '.github/workflows/translate.yml');

const TARGET_LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

describe('translation-guidelines.md', () => {
  it('should exist', () => {
    assert.ok(existsSync(GUIDELINES_PATH), 'scripts/translation-guidelines.md must exist');
  });

  it('should contain a Universal Principles section', () => {
    const content = readFileSync(GUIDELINES_PATH, 'utf-8');
    assert.ok(content.includes('Universal Principles'), 'Missing Universal Principles section');
  });

  it('should contain the core REWRITE principle', () => {
    const content = readFileSync(GUIDELINES_PATH, 'utf-8');
    assert.ok(
      content.toLowerCase().includes('rewrite'),
      'Missing core REWRITE principle'
    );
  });

  for (const locale of TARGET_LOCALES) {
    it(`should contain a section for locale: ${locale}`, () => {
      const content = readFileSync(GUIDELINES_PATH, 'utf-8');
      // Check for locale code in a heading (e.g., "## Chinese (zh)")
      const pattern = new RegExp(`\\(${locale}\\)`, 'i');
      assert.ok(
        pattern.test(content),
        `Missing section for locale "${locale}" — expected a heading containing "(${locale})"`
      );
    });
  }

  it('should contain style reference for each language', () => {
    const content = readFileSync(GUIDELINES_PATH, 'utf-8');
    assert.ok(content.includes('Style Reference'), 'Missing Style Reference sections');
    // At least 7 occurrences (one per language)
    const matches = content.match(/Style Reference/g) || [];
    assert.ok(
      matches.length >= 7,
      `Expected at least 7 Style Reference sections, found ${matches.length}`
    );
  });

  it('should mention formality/register for each language', () => {
    const content = readFileSync(GUIDELINES_PATH, 'utf-8');
    // Each language section should discuss formality (tú/vous/du/해요체/etc.)
    const formalityTerms = ['tú', 'tu', 'du', 'você', '해요체', '敬体', 'です/ます'];
    const found = formalityTerms.filter((term) => content.includes(term));
    assert.ok(
      found.length >= 5,
      `Expected formality guidance for most languages, found terms: ${found.join(', ')}`
    );
  });
});

describe('translate.yml references guidelines', () => {
  it('should reference translation-guidelines.md in the workflow', () => {
    const content = readFileSync(TRANSLATE_YML_PATH, 'utf-8');
    assert.ok(
      content.includes('translation-guidelines.md'),
      'translate.yml must reference scripts/translation-guidelines.md'
    );
  });

  it('should mention REWRITE principle', () => {
    const content = readFileSync(TRANSLATE_YML_PATH, 'utf-8');
    assert.ok(
      content.toLowerCase().includes('rewrite'),
      'translate.yml should mention the REWRITE principle'
    );
  });
});
