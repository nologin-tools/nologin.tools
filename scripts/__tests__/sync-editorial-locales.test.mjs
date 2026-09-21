import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLocaleBlock,
  auditEditorialLocales,
  applyEditorialChunk,
  SUPPORTED_LOCALES
} from '../sync-editorial-locales.mjs';

describe('sync-editorial-locales', () => {
  const validEnBlock = {
    bestFor: 'Rapid client-side diagramming and vector sketching without account barriers',
    pros: [
      'Zero-egress IndexedDB canvas persistence',
      'Lossless SVG and high-DPI PNG export'
    ],
    cons: [
      'Collaboration requires opting into external signaling server'
    ],
    privacyVerdict: 'No external requests observed during the tested workflow.',
    benchmarkNotes: 'Tested complex drawing for 60s with 0ms freeze and 45KB SVG export.',
    productScore: {
      overall: 98,
      frictionless: 20,
      depth: 24,
      exportFreedom: 20,
      privacy: 20,
      polish: 14
    },
    verdictTier: 'editors-choice',
    alternativeTo: ['Miro', 'Lucidchart'],
    testedAt: '2026-09'
  };

  it('validates a complete and compliant locale block', () => {
    const result = validateLocaleBlock('en', validEnBlock);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('flags missing or invalid text fields', () => {
    const invalidBlock = {
      ...validEnBlock,
      bestFor: 'Too short',
      pros: ['Only one pro'],
      cons: []
    };
    const result = validateLocaleBlock('ja', invalidBlock);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('pros')));
    assert.ok(result.errors.some(e => e.includes('cons')));
  });

  it('flags productScore sum mismatch', () => {
    const mismatchedBlock = {
      ...validEnBlock,
      productScore: {
        overall: 99, // sum is 98
        frictionless: 20,
        depth: 24,
        exportFreedom: 20,
        privacy: 20,
        polish: 14
      }
    };
    const result = validateLocaleBlock('de', mismatchedBlock);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('sum mismatch')));
  });

  it('correctly audits coverage across approved tools', () => {
    const mockEditorial = {
      'tool-a': {
        en: validEnBlock,
        zh: validEnBlock
      },
      'tool-b': {
        en: validEnBlock
      }
    };
    const mockApproved = [
      { slug: 'tool-a', name: 'Tool A' },
      { slug: 'tool-b', name: 'Tool B' }
    ];

    const audit = auditEditorialLocales(mockEditorial, mockApproved);
    assert.equal(audit.summary.totalApproved, 2);
    assert.equal(audit.summary.fullyCovered, 0);
    assert.equal(audit.summary.needsWorkCount, 2);
    assert.equal(audit.summary.missingPerLocale.en, 0);
    assert.equal(audit.summary.missingPerLocale.zh, 1);
    assert.equal(audit.summary.missingPerLocale.ja, 2);
  });

  it('safely applies chunk and synchronizes canonical product scores and tiers', () => {
    const mockEditorial = {
      'tool-a': {
        en: validEnBlock,
        zh: validEnBlock
      }
    };

    const chunk = {
      'tool-a': {
        ja: {
          bestFor: 'アカウント不要のブラウザ完結型ベクター描画ツール',
          pros: [
            'IndexedDBによる完全ローカル保存',
            '無劣化SVGおよび高解像度PNG出力'
          ],
          cons: [
            '共同編集にはシグナリングサーバー接続が必要'
          ],
          privacyVerdict: 'テストセッション中に外部データ送信は一切観測されませんでした。',
          benchmarkNotes: '60秒間の作図テストでフリーズ0ms、45KBのSVGを出力。'
        }
      }
    };

    const res = applyEditorialChunk(mockEditorial, chunk);
    assert.equal(res.errors.length, 0);
    assert.equal(res.updatedSlugs.length, 1);
    assert.equal(res.updatedLocales.ja, 1);

    // Verify synchronized meta fields
    const jaEntry = mockEditorial['tool-a'].ja;
    assert.ok(jaEntry);
    assert.equal(jaEntry.productScore.overall, 98);
    assert.equal(jaEntry.verdictTier, 'editors-choice');
    assert.deepEqual(jaEntry.alternativeTo, ['Miro', 'Lucidchart']);
    assert.equal(jaEntry.testedAt, '2026-09');
  });
});
