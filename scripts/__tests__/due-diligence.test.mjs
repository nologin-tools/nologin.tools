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

  it('does not turn high scores, tags or repository metadata into test evidence', () => {
    const tool = { repoUrl: 'https://github.com/example/project', githubStars: 100000,
      githubLicense: 'MIT', tags: [{ tagKey: 'data', tagValue: 'Client-Side Only' }] };
    assert.equal(resolveDueDiligence(tool, { productScore: { overall: 99, privacy: 20, exportFreedom: 20 } }), null);
    assert.equal(resolveDueDiligence(tool, { dueDiligence: {} }), null);
    assert.equal(resolveDueDiligence({}, undefined), null);
  });

  it('preserves partial observations without inventing untested categories', () => {
    const evidence = { privacyAudit: { runtimeClassification: 'Payload Egress Observed', zeroEgressConfirmed: false } };
    assert.deepEqual(resolveDueDiligence({}, { dueDiligence: evidence }), evidence);
    assert.equal(resolveDueDiligence({}, { dueDiligence: evidence }).visualCraft, undefined);
  });
});
