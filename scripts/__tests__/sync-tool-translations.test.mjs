// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  computeSourceHash,
  auditTranslations,
  applyTranslations,
  SUPPORTED_LOCALES,
} from '../sync-tool-translations.mjs';

describe('sync-tool-translations', () => {
  it('computes consistent source hashes based on description and SEO fields', () => {
    const tool = {
      description: 'A simple privacy tool.',
      coreTask: 'Protect personal browsing history',
      seoTitle: 'Tool: Protect personal browsing',
      seoDescription: 'Tool helps protect browsing history.',
      seoTaskPhrase: 'protect browsing history',
      seoFocusKeyword: 'privacy browser tool',
    };

    const hash1 = computeSourceHash(tool);
    const hash2 = computeSourceHash({ ...tool });
    assert.equal(hash1.length, 16);
    assert.equal(hash1, hash2);

    // Modifying description changes hash
    const hashModified = computeSourceHash({ ...tool, description: 'Updated description.' });
    assert.notEqual(hash1, hashModified);
  });

  it('audits translation status correctly (missing, outdated, synced)', () => {
    const toolSynced = {
      id: 1,
      slug: 'synced-tool',
      name: 'Synced Tool',
      status: 'approved',
      description: 'Desc 1',
      coreTask: 'Task 1',
    };
    const toolMissing = {
      id: 2,
      slug: 'missing-tool',
      name: 'Missing Tool',
      status: 'approved',
      description: 'Desc 2',
      coreTask: 'Task 2',
    };
    const toolOutdated = {
      id: 3,
      slug: 'outdated-tool',
      name: 'Outdated Tool',
      status: 'approved',
      description: 'Desc 3',
      coreTask: 'Task 3',
    };

    const buildData = {
      tools: [toolSynced, toolMissing, toolOutdated],
    };

    const hashSynced = computeSourceHash(toolSynced);

    /** @type {Record<string, Record<string, any>>} */
    const translations = {};
    for (const locale of SUPPORTED_LOCALES) {
      translations[locale] = {
        'synced-tool': {
          _hash: hashSynced,
          description: 'Desc translated',
          coreTask: 'Task translated',
        },
        'outdated-tool': {
          _hash: 'oldhash123456789',
          description: 'Old translated',
          coreTask: 'Old task',
        },
        // 'missing-tool' is omitted entirely
      };
    }

    const audit = auditTranslations(buildData, translations);

    assert.equal(audit.summary.totalApproved, 3);
    assert.equal(audit.summary.fullySynced, 1);
    assert.equal(audit.summary.needsAttention, 2);

    for (const locale of SUPPORTED_LOCALES) {
      assert.equal(audit.summary.missingCount[locale], 1);
      assert.equal(audit.summary.outdatedCount[locale], 1);
    }

    const missingItem = audit.items.find((i) => i.slug === 'missing-tool');
    assert.ok(missingItem);
    assert.equal(missingItem.locales.zh.status, 'missing');

    const outdatedItem = audit.items.find((i) => i.slug === 'outdated-tool');
    assert.ok(outdatedItem);
    assert.equal(outdatedItem.locales.zh.status, 'outdated');
  });

  it('applies translations for a pending tool using payload _source metadata', () => {
    const root = mkdtempSync(join(tmpdir(), 'translations-source-'));
    try {
      mkdirSync(root, { recursive: true });
      for (const locale of SUPPORTED_LOCALES) {
        writeFileSync(join(root, `${locale}.json`), '{}\n', 'utf-8');
      }

      const source = {
        description: 'A newly reviewed browser utility.',
        coreTask: 'Process files locally'
      };
      const localeMap = Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, {
        description: `${locale} description`,
        coreTask: `${locale} task`
      }]));
      const result = applyTranslations({
        buildData: { tools: [] },
        translationsDir: root,
        payload: {
          'new-pending-tool': {
            _source: source,
            ...localeMap
          }
        }
      });

      assert.deepEqual(result.updatedSlugs, ['new-pending-tool']);
      assert.equal(result.updatedLocales.length, SUPPORTED_LOCALES.length);
      const zh = JSON.parse(readFileSync(join(root, 'zh.json'), 'utf-8'));
      assert.equal(zh['new-pending-tool']._hash, computeSourceHash(source));
      assert.equal(zh['new-pending-tool'].description, 'zh description');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
