// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computePrivacyScorecard, normalizeTags } from '../../src/lib/privacy-scorecard.mjs';

describe('Deep Privacy & Sandbox Audit Scorecard', () => {
  it('normalizes various tag array representations into a unified map', () => {
    const rawA = [{ tagKey: 'data', tagValue: 'Client-Side Only' }, { tagKey: 'privacy', tagValue: 'No Trackers' }];
    const mapA = normalizeTags(rawA);
    assert.ok(mapA.get('data')?.has('Client-Side Only'));
    assert.ok(mapA.get('privacy')?.has('No Trackers'));

    const rawB = [{ key: 'data', value: 'Server-Side' }, { key: 'pricing', value: 'Free' }];
    const mapB = normalizeTags(rawB);
    assert.ok(mapB.get('data')?.has('Server-Side'));
    assert.ok(mapB.get('pricing')?.has('Free'));

    const rawC = ['data:Client-Side Only', 'offline:Works Offline'];
    const mapC = normalizeTags(rawC);
    assert.ok(mapC.get('data')?.has('Client-Side Only'));
    assert.ok(mapC.get('offline')?.has('Works Offline'));
  });

  it('awards A+ (score >= 90) to gold standard client-side open-source tools', () => {
    const cyberChef = {
      name: 'CyberChef',
      repoUrl: 'https://github.com/gchq/CyberChef',
      githubLicense: 'Apache-2.0',
      githubStars: 28000,
      tags: [
        { key: 'data', value: 'Client-Side Only' },
        { key: 'privacy', value: 'No Trackers' },
        { key: 'offline', value: 'Works Offline' },
      ],
    };
    const health = [{ isOnline: true, responseTimeMs: 120, checkedAt: new Date() }];

    const scorecard = computePrivacyScorecard(cyberChef, health);
    assert.equal(scorecard.overallGrade, 'A+');
    assert.ok(scorecard.overallScore >= 90);
    assert.equal(scorecard.dimensions.sandbox.score, 25);
    assert.equal(scorecard.dimensions.telemetry.score, 25);
    assert.equal(scorecard.dimensions.source.score, 25);
    assert.equal(scorecard.dimensions.resilience.score, 25);
  });

  it('correctly scores proprietary cloud-hosted tools with B+ or B grade', () => {
    const cloudTool = {
      name: 'Temp Mail Provider',
      repoUrl: null,
      tags: [
        { key: 'data', value: 'Server-Side' },
      ],
    };
    const health = [{ isOnline: true, responseTimeMs: 850, checkedAt: new Date() }];

    const scorecard = computePrivacyScorecard(cloudTool, health);
    assert.ok(scorecard.overallScore < 75);
    assert.ok(scorecard.overallGrade === 'B+' || scorecard.overallGrade === 'B');
    assert.equal(scorecard.dimensions.source.score, 12);
    assert.equal(scorecard.dimensions.sandbox.score, 14);
  });

  it('penalizes resilience score when tool is offline', () => {
    const offlineTool = {
      name: 'Defunct Tool',
      tags: [{ key: 'data', value: 'Client-Side Only' }],
      effectiveStatus: 'offline',
    };
    const health = [{ isOnline: false, responseTimeMs: 0, checkedAt: new Date() }];

    const scorecard = computePrivacyScorecard(offlineTool, health);
    assert.equal(scorecard.dimensions.resilience.score, 0);
    assert.equal(scorecard.dimensions.resilience.status, 'Currently Unreachable');
  });

  it('uses custom editorial privacy verdict as summary when provided', () => {
    const tool = {
      name: 'Excalidraw',
      tags: [{ key: 'data', value: 'Client-Side Only' }],
    };
    const editorial = {
      privacyVerdict: 'Excalidraw utilizes end-to-end client-side memory encryption.',
    };

    const scorecard = computePrivacyScorecard(tool, null, editorial);
    assert.equal(scorecard.summary, editorial.privacyVerdict);
  });

  it('reinforces sandbox score when CADES verifies Local Only zero-egress processing', () => {
    const toolWithoutExplicitTag = {
      name: 'Unlabeled Local App',
      tags: [],
    };
    const editorial = {
      dueDiligence: {
        privacyAudit: {
          runtimeClassification: 'Local Only',
          statedPolicyCompliance: 'verified-consistent',
        },
      },
    };

    const scorecard = computePrivacyScorecard(toolWithoutExplicitTag, null, editorial);
    assert.equal(scorecard.dimensions.sandbox.score, 25);
    assert.equal(scorecard.dimensions.sandbox.status, 'In-Browser RAM Sandbox');
  });

  it('penalizes sandbox score when CADES sniffs cloud egress drift despite client-side claims', () => {
    const toolWithMisleadingTag = {
      name: 'Sneaky App',
      tags: [{ key: 'data', value: 'Client-Side Only' }],
    };
    const editorial = {
      dueDiligence: {
        privacyAudit: {
          runtimeClassification: 'Cloud Processed',
          statedPolicyCompliance: 'violation-detected',
        },
      },
    };

    const scorecard = computePrivacyScorecard(toolWithMisleadingTag, null, editorial);
    assert.equal(scorecard.dimensions.sandbox.score, 12);
    assert.equal(scorecard.dimensions.sandbox.status, 'Cloud Egress Detected');
  });
});
