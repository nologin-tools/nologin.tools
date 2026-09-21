import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_WORKSTATIONS,
  recalibrateToolScore,
  EDITORIAL_PATH,
  BUILD_DATA_PATH,
  LOCALES
} from '../recalibrate-catalog-scores.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Catalog Score Recalibration & Anti-Inflation Governance', () => {
  it('identifies canonical workstations and awards Editor Choice with Depth >= 22', () => {
    const mockWorkstation = {
      slug: 'excalidraw-com',
      name: 'Excalidraw',
      description: 'Virtual collaborative whiteboard',
      coreTask: 'Draw vector diagrams and wireframes',
      tags: [
        { tagKey: 'data', tagValue: 'Client-Side Only' },
        { tagKey: 'offline', tagValue: 'Works Offline' }
      ]
    };
    const mockEditorial = {
      bestFor: 'Technical diagrams and whiteboard sketching',
      pros: ['Local canvas architecture with infinite canvas', 'Zero-latency vector rendering'],
      cons: ['Collaboration requires remote server']
    };

    const calibrated = recalibrateToolScore(mockWorkstation, mockEditorial);
    assert.equal(calibrated.verdictTier, 'editors-choice');
    assert.ok(calibrated.overall >= 90, `Editor Choice must be >= 90 (got ${calibrated.overall})`);
    assert.ok(calibrated.depth >= 22, `Editor Choice must have Depth >= 22 (got ${calibrated.depth})`);
  });

  it('calibrates advanced utilities into highly-recommended tier (80-89)', () => {
    const mockAdvancedTool = {
      slug: 'json-to-csv-tool',
      name: 'JSON to CSV Converter',
      description: 'Batch convert JSON arrays into CSV with custom delimiter and transform inspector',
      coreTask: 'Convert data structures client-side',
      tags: [
        { tagKey: 'data', tagValue: 'Client-Side Only' },
        { tagKey: 'type', tagValue: 'PWA' }
      ]
    };
    const mockEditorial = {
      bestFor: 'Large array JSON conversion with schema inspector',
      pros: ['Fast batch parser', 'Immediate CSV download'],
      cons: ['Large files >50MB may slow UI']
    };

    const calibrated = recalibrateToolScore(mockAdvancedTool, mockEditorial);
    assert.equal(calibrated.verdictTier, 'highly-recommended');
    assert.ok(calibrated.overall >= 80 && calibrated.overall <= 89, `Highly recommended must be 80-89 (got ${calibrated.overall})`);
    assert.ok(calibrated.depth >= 16 && calibrated.depth <= 20, `Advanced utility depth must be 16-20 (got ${calibrated.depth})`);
  });

  it('calibrates single-purpose utilities into capable-utility tier (70-79)', () => {
    const mockSimpleTool = {
      slug: 'quick-uuid-gen',
      name: 'Quick UUID Generator',
      description: 'Generate version 4 UUIDs instantly',
      coreTask: 'Generate random UUID strings',
      tags: [
        { tagKey: 'data', tagValue: 'Client-Side Only' }
      ]
    };
    const mockEditorial = {
      bestFor: 'Quickly generating v4 UUIDs for development test cases',
      pros: ['Immediate single-click generation', 'One-click clipboard copy'],
      cons: ['No batch generation parameter']
    };

    const calibrated = recalibrateToolScore(mockSimpleTool, mockEditorial);
    assert.equal(calibrated.verdictTier, 'capable-utility');
    assert.ok(calibrated.overall >= 70 && calibrated.overall <= 79, `Capable utility must be 70-79 (got ${calibrated.overall})`);
    assert.ok(calibrated.depth <= 14, `Single-task utility depth must be <= 14 (got ${calibrated.depth})`);
  });

  it('preserves emergency-only classification and exact 5D math for restricted tools', () => {
    const mockEmergencyTool = {
      slug: 'mp3cut-net',
      name: 'MP3Cut'
    };
    const mockEmergencyEditorial = {
      verdictTier: 'emergency-only',
      productScore: {
        overall: 50,
        frictionless: 11,
        depth: 15,
        exportFreedom: 10,
        privacy: 5,
        polish: 9
      }
    };

    const calibrated = recalibrateToolScore(mockEmergencyTool, mockEmergencyEditorial);
    assert.equal(calibrated.verdictTier, 'emergency-only');
    assert.equal(calibrated.overall, 50);
    const sum = calibrated.frictionless + calibrated.depth + calibrated.exportFreedom + calibrated.privacy + calibrated.polish;
    assert.equal(sum, calibrated.overall);
  });

  it('maintains the healthy pyramid target distribution across the active catalog', () => {
    const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
    const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
    const approvedTools = (buildData.tools || []).filter((/** @type {any} */ t) => t.status === 'approved');

    const counts = { 'editors-choice': 0, 'highly-recommended': 0, 'capable-utility': 0, 'emergency-only': 0 };

    for (const tool of approvedTools) {
      const entry = editorial[tool.slug];
      assert.ok(entry, `Tool ${tool.slug} must exist in editorial`);
      const en = entry.en;
      assert.ok(en, `Tool ${tool.slug} must have English editorial record`);
      counts[en.verdictTier]++;

      // Verify all 8 locales have identical score & tier
      for (const loc of LOCALES) {
        if (entry[loc]) {
          assert.equal(entry[loc].productScore.overall, en.productScore.overall, `${tool.slug} [${loc}] overall score must match [en]`);
          assert.equal(entry[loc].verdictTier, en.verdictTier, `${tool.slug} [${loc}] verdictTier must match [en]`);
        }
      }
    }

    const editorsPct = (counts['editors-choice'] / approvedTools.length) * 100;
    assert.ok(editorsPct >= 12 && editorsPct <= 16, `Editor's Choice should represent 12-16% of catalog (got ${editorsPct.toFixed(1)}%)`);
    assert.ok(counts['emergency-only'] > 0, 'Emergency only tier should contain ad/restricted outliers');
    assert.ok(counts['highly-recommended'] > counts['editors-choice'], 'Highly recommended must exceed Editor Choice');
  });
});
