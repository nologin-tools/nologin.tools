import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

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

function detectBadgeInText(content) {
  if (
    content.includes('nologin.tools/badge.svg') ||
    content.includes('nologin.tools/badge/') ||
    content.includes('nologin.tools/badges/') ||
    content.includes('nologintools.org/badge') ||
    content.includes('nologintools.org/badges')
  ) {
    return 'explicit';
  }
  if (
    content.includes('nologin-verified') ||
    content.includes('nologin.tools') ||
    content.includes('nologintools.org')
  ) {
    return 'implicit';
  }
  return 'none';
}

describe('Self-Service Badge Detection Logic', () => {
  it('should detect explicit badge in HTML markup', () => {
    const html = '<footer><a href="https://nologin.tools/badge/excalidraw-com"><img src="https://nologin.tools/badges/flat.svg" alt="Verified" /></a></footer>';
    assert.equal(detectBadgeInText(html), 'explicit');
  });

  it('should detect explicit badge in Markdown README', () => {
    const md = '# My Tool\n\n[![Verified by NoLoginTools.org](https://nologin.tools/badges/flat.svg)](https://nologin.tools/badge/my-tool)\n';
    assert.equal(detectBadgeInText(md), 'explicit');
  });

  it('should detect explicit legacy badge.svg', () => {
    const html = '<img src="https://nologin.tools/badge.svg" />';
    assert.equal(detectBadgeInText(html), 'explicit');
  });

  it('should detect explicit nologintools.org badge link', () => {
    const html = '<a href="https://nologintools.org/badges/flat.svg">Badge</a>';
    assert.equal(detectBadgeInText(html), 'explicit');
  });

  it('should detect implicit text reference', () => {
    const html = '<p>Featured on nologin.tools directory</p>';
    assert.equal(detectBadgeInText(html), 'implicit');
  });

  it('should return none when no reference exists', () => {
    const html = '<p>Just a normal website without any badges.</p>';
    assert.equal(detectBadgeInText(html), 'none');
  });
});

describe('1-Click GitHub README Integration', () => {
  it('should generate valid 1-click README edit URL for GitHub repo', () => {
    const parsed = parseGitHubRepoUrl('https://github.com/excalidraw/excalidraw');
    assert.ok(parsed);
    assert.equal(parsed.owner, 'excalidraw');
    assert.equal(parsed.repo, 'excalidraw');
    const editUrl = `https://github.com/${parsed.owner}/${parsed.repo}/edit/HEAD/README.md`;
    assert.equal(editUrl, 'https://github.com/excalidraw/excalidraw/edit/HEAD/README.md');
  });

  it('should handle repos with trailing slash or .git', () => {
    const parsed = parseGitHubRepoUrl('https://github.com/tastejs/todomvc.git/');
    assert.ok(parsed);
    assert.equal(parsed.owner, 'tastejs');
    assert.equal(parsed.repo, 'todomvc');
  });
});

describe('Cooldown & Slug Validation Logic', () => {
  const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  it('valid slugs should pass regex', () => {
    assert.ok(SLUG_REGEX.test('excalidraw-com'));
    assert.ok(SLUG_REGEX.test('cyberchef'));
    assert.ok(SLUG_REGEX.test('tool-123-abc'));
  });

  it('invalid slugs should be rejected', () => {
    assert.ok(!SLUG_REGEX.test('Invalid Slug'));
    assert.ok(!SLUG_REGEX.test('tool/with/slashes'));
    assert.ok(!SLUG_REGEX.test('tool..dots'));
    assert.ok(!SLUG_REGEX.test(''));
  });

  it('cooldown calculation should block requests under 60 seconds', () => {
    const COOLDOWN_MS = 60 * 1000;
    const now = Date.now();
    const lastChecked = new Date(now - 25 * 1000); // 25s ago
    const elapsed = now - lastChecked.getTime();
    assert.ok(elapsed < COOLDOWN_MS);
    const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    assert.equal(waitSeconds, 35);
  });

  it('cooldown should allow requests older than 60 seconds', () => {
    const COOLDOWN_MS = 60 * 1000;
    const now = Date.now();
    const lastChecked = new Date(now - 70 * 1000); // 70s ago
    const elapsed = now - lastChecked.getTime();
    assert.ok(elapsed >= COOLDOWN_MS);
  });
});

describe('GitHub Notification Template Consistency', () => {
  const githubTs = readFileSync(join(rootDir, 'src/lib/github.ts'), 'utf-8');

  it('should reference NLW-STD-001 specification', () => {
    assert.match(githubTs, /NLW-STD-001/);
    assert.match(githubTs, /https:\/\/nologintools\.org\/standards/);
  });

  it('should include 1-click edit URL pattern', () => {
    assert.match(githubTs, /edit\/HEAD\/README\.md/);
  });

  it('should mention Level 3 ranking boost and instant verification', () => {
    assert.match(githubTs, /\+4 Algorithm Ranking Boost/);
    assert.match(githubTs, /Instant Self-Service Verification/);
  });
});
