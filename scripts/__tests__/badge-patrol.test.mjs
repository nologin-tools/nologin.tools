import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { containsBadgeEmbed, stratifyOutreachCohorts } from '../badge-patrol.mjs';

describe('badge-patrol logic', () => {
  describe('containsBadgeEmbed', () => {
    it('detects standard badge markdown embed', () => {
      const markdown = `
# My Tool
[![Verified by NoLoginTools.org](https://nologin.tools/badges/flat.svg)](https://nologin.tools/badge/my-tool)
A great tool.
      `;
      assert.equal(containsBadgeEmbed(markdown), true);
    });

    it('detects badge text attribution or badge.svg', () => {
      assert.equal(containsBadgeEmbed('<img src="https://nologintools.org/badges/plastic.svg">'), true);
      assert.equal(containsBadgeEmbed('Certified and Verified by NoLoginTools.org in 2026'), true);
      assert.equal(containsBadgeEmbed('[NoLogin](https://nologin.tools/badge/tool-slug)'), true);
    });

    it('returns false for unrelated content and generic badges', () => {
      assert.equal(containsBadgeEmbed('# Clean README\n\nNo badges here.'), false);
      assert.equal(containsBadgeEmbed('https://deepwiki.com/badge.svg'), false);
      assert.equal(containsBadgeEmbed('https://img.shields.io/badge/license-MIT-blue.svg'), false);
      assert.equal(containsBadgeEmbed('https://github.com/org/repo/workflows/CI/badge.svg'), false);
      assert.equal(containsBadgeEmbed(''), false);
      assert.equal(containsBadgeEmbed(null), false);
    });
  });

  describe('stratifyOutreachCohorts', () => {
    it('accurately divides tools into active, notified, indie, and flagship tiers', () => {
      const mockTools = [
        { id: 1, name: 'Exhibitor', slug: 'exhibitor', repoUrl: 'https://github.com/a/b', githubStars: 120 },
        { id: 2, name: 'Notified Tool', slug: 'notified', repoUrl: 'https://github.com/c/d', githubStars: 500 },
        { id: 3, name: 'Indie High Affinity', slug: 'indie', repoUrl: 'https://github.com/e/f', githubStars: 350 },
        { id: 4, name: 'Flagship Masterpiece', slug: 'flagship', repoUrl: 'https://github.com/g/h', githubStars: 25000 },
        { id: 5, name: 'Micro Tool', slug: 'micro', repoUrl: 'https://github.com/i/j', githubStars: 10 },
      ];

      const notificationMap = new Map([
        [2, { status: 'created', issueUrl: 'https://github.com/c/d/issues/1' }],
      ]);
      const activeExhibitors = new Set([1]);

      const cohorts = stratifyOutreachCohorts(mockTools, notificationMap, activeExhibitors);

      assert.equal(cohorts.exhibiting.length, 1);
      assert.equal(cohorts.exhibiting[0].name, 'Exhibitor');

      assert.equal(cohorts.alreadyNotified.length, 1);
      assert.equal(cohorts.alreadyNotified[0].name, 'Notified Tool');

      assert.equal(cohorts.indieCandidates.length, 1);
      assert.equal(cohorts.indieCandidates[0].name, 'Indie High Affinity');

      assert.equal(cohorts.flagshipCandidates.length, 1);
      assert.equal(cohorts.flagshipCandidates[0].name, 'Flagship Masterpiece');

      assert.equal(cohorts.unclassified.length, 1);
      assert.equal(cohorts.unclassified[0].name, 'Micro Tool');
    });
  });
});
