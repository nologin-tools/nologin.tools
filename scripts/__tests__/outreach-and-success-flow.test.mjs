import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function parseGitHubRepoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

function getGitHubReadmeEditUrl(repoUrl) {
  const gh = parseGitHubRepoUrl(repoUrl);
  if (!gh) return null;
  return `https://github.com/${gh.owner}/${gh.repo}/edit/HEAD/README.md`;
}

function classifyOutreachStatus(tool, notif, badge) {
  if (badge?.displayType === 'explicit') {
    return 'badge_active';
  }
  if (notif?.status === 'created') {
    return 'notified';
  }
  return 'need_outreach';
}

function parseCertificateLookupQuery(input, locale = 'en') {
  const val = input.trim().toLowerCase();
  if (!val) return null;
  const match = val.match(/\(([^)]+)\)$/);
  const slug = match ? match[1] : val;
  const encodedSlug = encodeURIComponent(slug);
  return locale === 'en' ? `/badge/${encodedSlug}` : `/${locale}/badge/${encodedSlug}`;
}

describe('Outreach & Conversion Optimization Pipeline', () => {
  describe('Outreach CRM Classification', () => {
    it('classifies tool as badge_active if badge display is explicit', () => {
      const tool = { id: 1, name: 'Excalidraw', repoUrl: 'https://github.com/excalidraw/excalidraw' };
      const notif = { status: 'created' };
      const badge = { displayType: 'explicit' };
      assert.equal(classifyOutreachStatus(tool, notif, badge), 'badge_active');
    });

    it('classifies tool as badge_active even if notification was never sent', () => {
      const tool = { id: 2, name: 'CyberChef', repoUrl: 'https://github.com/gchq/CyberChef' };
      const notif = null;
      const badge = { displayType: 'explicit' };
      assert.equal(classifyOutreachStatus(tool, notif, badge), 'badge_active');
    });

    it('classifies tool as notified if issue was created and badge is not yet explicit', () => {
      const tool = { id: 3, name: 'DrawIO', repoUrl: 'https://github.com/jgraph/drawio' };
      const notif = { status: 'created', issueUrl: 'https://github.com/jgraph/drawio/issues/100' };
      const badge = { displayType: 'none' };
      assert.equal(classifyOutreachStatus(tool, notif, badge), 'notified');
    });

    it('classifies tool as need_outreach if never notified and no badge', () => {
      const tool = { id: 4, name: 'JSONHero', repoUrl: 'https://github.com/jsonhero-io/jsonhero-web' };
      const notif = null;
      const badge = null;
      assert.equal(classifyOutreachStatus(tool, notif, badge), 'need_outreach');
    });

    it('classifies tool as need_outreach if notification previously errored', () => {
      const tool = { id: 5, name: 'ToolError', repoUrl: 'https://github.com/example/tool' };
      const notif = { status: 'error', errorMessage: 'Rate limited' };
      const badge = { displayType: 'none' };
      assert.equal(classifyOutreachStatus(tool, notif, badge), 'need_outreach');
    });
  });

  describe('1-Click GitHub README Edit Link Generation', () => {
    it('generates direct README edit link for standard repo URL', () => {
      const url = 'https://github.com/excalidraw/excalidraw';
      assert.equal(getGitHubReadmeEditUrl(url), 'https://github.com/excalidraw/excalidraw/edit/HEAD/README.md');
    });

    it('handles repo URLs ending in .git and trailing slashes', () => {
      const url = 'https://github.com/gchq/CyberChef.git/';
      assert.equal(getGitHubReadmeEditUrl(url), 'https://github.com/gchq/CyberChef/edit/HEAD/README.md');
    });

    it('returns null for non-GitHub URLs or malformed URLs', () => {
      assert.equal(getGitHubReadmeEditUrl('https://gitlab.com/foo/bar'), null);
      assert.equal(getGitHubReadmeEditUrl('not-a-url'), null);
      assert.equal(getGitHubReadmeEditUrl('https://github.com/'), null);
    });
  });

  describe('Certificate Quick Lookup Parser', () => {
    it('parses raw slug in English', () => {
      assert.equal(parseCertificateLookupQuery('excalidraw-com', 'en'), '/badge/excalidraw-com');
    });

    it('parses datalist format "Tool Name (slug)"', () => {
      assert.equal(
        parseCertificateLookupQuery('Excalidraw (excalidraw-com)', 'en'),
        '/badge/excalidraw-com'
      );
    });

    it('preserves multi-language locale prefix', () => {
      assert.equal(
        parseCertificateLookupQuery('Excalidraw (excalidraw-com)', 'zh'),
        '/zh/badge/excalidraw-com'
      );
      assert.equal(
        parseCertificateLookupQuery('cyberchef', 'ja'),
        '/ja/badge/cyberchef'
      );
    });

    it('handles trimming and URL encoding', () => {
      assert.equal(
        parseCertificateLookupQuery('  my tool (my-tool-1)  ', 'en'),
        '/badge/my-tool-1'
      );
      assert.equal(parseCertificateLookupQuery('', 'en'), null);
      assert.equal(parseCertificateLookupQuery('   ', 'en'), null);
    });
  });
});
