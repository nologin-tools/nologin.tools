// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Logic mirroring src/lib/badge.ts
const BADGE_STYLES = [
  { id: 'flat', label: 'Flat', path: '/badges/flat.svg', width: 118, height: 20, group: 'standard' },
  { id: 'flat-square', label: 'Flat Square', path: '/badges/flat-square.svg', width: 118, height: 20, group: 'standard' },
  { id: 'plastic', label: 'Plastic', path: '/badges/plastic.svg', width: 116, height: 18, group: 'standard' },
  { id: 'for-the-badge', label: 'For The Badge', path: '/badges/for-the-badge.svg', width: 191, height: 28, group: 'standard' },
  { id: 'social', label: 'Social', path: '/badges/social.svg', width: 142, height: 20, group: 'social' },
  { id: 'flat-dark', label: 'Flat', path: '/badges/flat-dark.svg', width: 118, height: 20, group: 'dark' },
  { id: 'flat-square-dark', label: 'Flat Square', path: '/badges/flat-square-dark.svg', width: 118, height: 20, group: 'dark' },
  { id: 'plastic-dark', label: 'Plastic', path: '/badges/plastic-dark.svg', width: 116, height: 18, group: 'dark' },
  { id: 'for-the-badge-dark', label: 'For The Badge', path: '/badges/for-the-badge-dark.svg', width: 191, height: 28, group: 'dark' },
  { id: 'flat-blue', label: 'Blue', path: '/badges/flat-blue.svg', width: 118, height: 20, group: 'color' },
  { id: 'flat-purple', label: 'Purple', path: '/badges/flat-purple.svg', width: 118, height: 20, group: 'color' },
  { id: 'flat-orange', label: 'Orange', path: '/badges/flat-orange.svg', width: 118, height: 20, group: 'color' },
];

const ORIGINAL_BADGE = {
  id: 'original',
  label: 'Original',
  path: '/badge.svg',
  width: 160,
  height: 28,
};

function getBadgeEmbedCode(slug, siteUrl, style = 'flat') {
  const badge = style === 'original'
    ? ORIGINAL_BADGE
    : BADGE_STYLES.find((s) => s.id === style) || BADGE_STYLES[0];

  return {
    svg: `<a href="${siteUrl}/badge/${slug}">\n  <img src="${siteUrl}${badge.path}" alt="NoLogin Verified" title="Verified by NoLoginTools.org" />\n</a>`,
    markdown: `[![NoLogin Verified](${siteUrl}${badge.path})](${siteUrl}/badge/${slug} "Verified by NoLoginTools.org")`,
    meta: `<meta name="nologin-verified" content="${slug}" />`,
    link: `<a href="${siteUrl}/badge/${slug}">NoLogin Verified</a>`,
  };
}

function getBadgeWeight(displayType) {
  switch (displayType) {
    case 'explicit':
      return 4;
    case 'implicit':
      return 2;
    default:
      return 0;
  }
}

describe('getBadgeEmbedCode', () => {
  it('generates markdown snippet formatted for GitHub READMEs', () => {
    const code = getBadgeEmbedCode('excalidraw-com', 'https://nologin.tools', 'flat');
    assert.equal(
      code.markdown,
      '[![NoLogin Verified](https://nologin.tools/badges/flat.svg)](https://nologin.tools/badge/excalidraw-com "Verified by NoLoginTools.org")'
    );
  });

  it('generates svg embed snippet with official title attribute', () => {
    const code = getBadgeEmbedCode('excalidraw-com', 'https://nologin.tools', 'flat');
    assert.ok(code.svg.includes('title="Verified by NoLoginTools.org"'));
    assert.ok(code.svg.includes('alt="NoLogin Verified"'));
    assert.ok(code.svg.includes('href="https://nologin.tools/badge/excalidraw-com"'));
  });

  it('generates correct style paths for different variants', () => {
    const flatSquare = getBadgeEmbedCode('test-tool', 'https://nologin.tools', 'flat-square');
    assert.ok(flatSquare.markdown.includes('/badges/flat-square.svg'));

    const social = getBadgeEmbedCode('test-tool', 'https://nologin.tools', 'social');
    assert.ok(social.markdown.includes('/badges/social.svg'));

    const dark = getBadgeEmbedCode('test-tool', 'https://nologin.tools', 'flat-dark');
    assert.ok(dark.markdown.includes('/badges/flat-dark.svg'));

    const original = getBadgeEmbedCode('test-tool', 'https://nologin.tools', 'original');
    assert.ok(original.markdown.includes('/badge.svg'));
  });

  it('falls back to default flat badge when given unknown style', () => {
    // @ts-ignore
    const code = getBadgeEmbedCode('test-tool', 'https://nologin.tools', 'unknown-style');
    assert.ok(code.markdown.includes('/badges/flat.svg'));
  });
});

describe('getBadgeWeight', () => {
  it('awards +4 algorithm boost for explicit badge display', () => {
    assert.equal(getBadgeWeight('explicit'), 4);
  });

  it('awards +2 algorithm boost for implicit meta/link display', () => {
    assert.equal(getBadgeWeight('implicit'), 2);
  });

  it('awards 0 boost for none or missing badge', () => {
    assert.equal(getBadgeWeight('none'), 0);
    assert.equal(getBadgeWeight(null), 0);
    assert.equal(getBadgeWeight(undefined), 0);
  });
});
