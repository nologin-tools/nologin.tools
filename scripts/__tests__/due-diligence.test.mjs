import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDueDiligence } from '../../src/lib/due-diligence.mjs';

describe('due-diligence resolver', () => {
  it('preserves existing complete dueDiligence object unchanged', () => {
    const mockTool = { name: 'Custom Tool' };
    const mockEditorial = {
      dueDiligence: {
        community: { status: 'community-acclaimed', sentimentScore: 99, summary: 'Custom summary', sources: ['Custom'] },
        openSource: { isRepoVerified: true, isSelfHostable: true, license: 'MIT', vitality: 'active', repoUrl: 'https://github.com/custom' },
        privacyAudit: { runtimeClassification: 'Local Only', statedPolicyCompliance: 'verified-consistent', zeroEgressConfirmed: true, dataRetentionPolicy: 'None' },
        visualCraft: { adPollutionTier: 'zero-ads', uiAesthetics: 'exceptional', watermarkFree: true, hasDeceptiveElements: false, visualProofCaptured: true }
      }
    };

    const resolved = resolveDueDiligence(mockTool, mockEditorial);
    assert.deepEqual(resolved, mockEditorial.dueDiligence);
  });

  it('derives grounded evidence for an open-source client-side tool', () => {
    const tool = {
      name: 'Excalidraw',
      repoUrl: 'https://github.com/excalidraw/excalidraw',
      githubStars: 85000,
      githubLicense: 'MIT',
      tags: [
        { tagKey: 'data', tagValue: 'Client-Side Only' },
        { tagKey: 'privacy', tagValue: 'No Trackers' },
      ],
    };
    const editorial = {
      verdictTier: 'editors-choice',
      productScore: {
        overall: 96,
        frictionless: 20,
        depth: 25,
        exportFreedom: 19,
        privacy: 20,
        polish: 14,
      },
    };

    const dd = resolveDueDiligence(tool, editorial);

    assert.equal(dd.community?.status, 'community-acclaimed');
    assert.ok(dd.community?.sources?.includes('GitHub'));
    assert.equal(dd.openSource?.isRepoVerified, true);
    assert.equal(dd.openSource?.license, 'MIT');
    assert.equal(dd.openSource?.vitality, 'active');
    assert.equal(dd.privacyAudit?.runtimeClassification, 'Local Only');
    assert.equal(dd.privacyAudit?.zeroEgressConfirmed, true);
    assert.equal(dd.visualCraft?.watermarkFree, true);
    assert.equal(dd.visualCraft?.adPollutionTier, 'zero-ads');
  });

  it('derives grounded evidence for a proprietary cloud tool', () => {
    const tool = {
      name: 'Web Utility',
      tags: [
        { tagKey: 'data', tagValue: 'Server / Cloud' },
        { tagKey: 'pricing', tagValue: 'Free' },
      ],
    };
    const editorial = {
      verdictTier: 'capable-utility',
      productScore: {
        overall: 75,
        frictionless: 17,
        depth: 18,
        exportFreedom: 15,
        privacy: 14,
        polish: 11,
      },
    };

    const dd = resolveDueDiligence(tool, editorial);

    assert.equal(dd.community?.status, 'verified-authentic');
    assert.equal(dd.openSource?.isRepoVerified, false);
    assert.equal(dd.openSource?.license, 'Proprietary');
    assert.equal(dd.openSource?.vitality, 'closed-source');
    assert.equal(dd.privacyAudit?.runtimeClassification, 'Cloud Processed');
    assert.equal(dd.privacyAudit?.zeroEgressConfirmed, false);
    assert.equal(dd.visualCraft?.watermarkFree, false); // exportScore 15 < 16
  });
});
