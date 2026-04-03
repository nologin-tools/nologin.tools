// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrontmatter,
  mapTagsForDevto,
  prepareDevtoBody,
  formatMastodonPost,
  formatBlueskyPost,
  buildBlueskyFacets,
  extractSlug,
  parseArgs,
} from '../syndicate-blog.mjs';

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------

describe('parseFrontmatter', () => {
  it('should parse title, description, and tags', () => {
    const content = [
      '---',
      'title: "My Blog Post"',
      'description: "A short description"',
      'tags: ["privacy", "tools"]',
      'publishedAt: 2026-04-01',
      '---',
      '',
      'Body content here.',
    ].join('\n');

    const { frontmatter, body } = parseFrontmatter(content);
    assert.equal(frontmatter.title, 'My Blog Post');
    assert.equal(frontmatter.description, 'A short description');
    assert.deepEqual(frontmatter.tags, ['privacy', 'tools']);
    assert.ok(body.includes('Body content here.'));
  });

  it('should return null frontmatter when no delimiters', () => {
    const { frontmatter } = parseFrontmatter('Just some text');
    assert.equal(frontmatter, null);
  });

  it('should parse boolean values', () => {
    const content = '---\nfeatured: true\ndraft: false\n---\n\nBody';
    const { frontmatter } = parseFrontmatter(content);
    assert.equal(frontmatter.featured, true);
    assert.equal(frontmatter.draft, false);
  });
});

// ---------------------------------------------------------------------------
// mapTagsForDevto
// ---------------------------------------------------------------------------

describe('mapTagsForDevto', () => {
  it('should always include nologin as first tag', () => {
    const result = mapTagsForDevto(['privacy', 'tools']);
    assert.equal(result[0], 'nologin');
  });

  it('should map known tags', () => {
    const result = mapTagsForDevto(['privacy', 'open-source']);
    assert.ok(result.includes('privacy'));
    assert.ok(result.includes('opensource'));
  });

  it('should cap at 4 tags', () => {
    const result = mapTagsForDevto(['privacy', 'tools', 'tutorial', 'ai', 'design', 'security']);
    assert.equal(result.length, 4);
  });

  it('should deduplicate mapped tags', () => {
    // Both 'tutorial' and 'guide' map to 'tutorial'
    const result = mapTagsForDevto(['tutorial', 'guide']);
    const tutorialCount = result.filter((t) => t === 'tutorial').length;
    assert.equal(tutorialCount, 1);
  });

  it('should filter out unknown tags', () => {
    const result = mapTagsForDevto(['unknowntag123']);
    assert.deepEqual(result, ['nologin']);
  });

  it('should handle empty array', () => {
    const result = mapTagsForDevto([]);
    assert.deepEqual(result, ['nologin']);
  });
});

// ---------------------------------------------------------------------------
// prepareDevtoBody
// ---------------------------------------------------------------------------

describe('prepareDevtoBody', () => {
  it('should convert relative image paths to absolute', () => {
    const body = '![hero](/blog/images/my-post/hero.jpg)';
    const result = prepareDevtoBody(body);
    assert.equal(result, '![hero](https://nologin.tools/blog/images/my-post/hero.jpg)');
  });

  it('should convert relative tool links to absolute', () => {
    const body = 'Check out [Excalidraw](/tool/excalidraw-com)';
    const result = prepareDevtoBody(body);
    assert.ok(result.includes('https://nologin.tools/tool/excalidraw-com'));
  });

  it('should convert relative blog links to absolute', () => {
    const body = 'Read more in [this post](/blog/another-post)';
    const result = prepareDevtoBody(body);
    assert.ok(result.includes('https://nologin.tools/blog/another-post'));
  });

  it('should preserve external URLs', () => {
    const body = 'Visit [GitHub](https://github.com) for more.';
    const result = prepareDevtoBody(body);
    assert.equal(result, body);
  });

  it('should handle body with no relative paths', () => {
    const body = 'Just plain text with no links.';
    const result = prepareDevtoBody(body);
    assert.equal(result, body);
  });

  it('should handle multiple relative links', () => {
    const body = '[A](/tool/a) and [B](/blog/b) and ![C](/blog/images/c/hero.jpg)';
    const result = prepareDevtoBody(body);
    assert.ok(result.includes('https://nologin.tools/tool/a'));
    assert.ok(result.includes('https://nologin.tools/blog/b'));
    assert.ok(result.includes('https://nologin.tools/blog/images/c/hero.jpg'));
  });
});

// ---------------------------------------------------------------------------
// formatMastodonPost
// ---------------------------------------------------------------------------

describe('formatMastodonPost', () => {
  it('should include title, description, URL, and hashtags', () => {
    const result = formatMastodonPost({
      title: 'My Post',
      description: 'A description',
      url: 'https://nologin.tools/blog/my-post',
      tags: ['privacy', 'tools'],
    });
    assert.ok(result.includes('My Post'));
    assert.ok(result.includes('A description'));
    assert.ok(result.includes('https://nologin.tools/blog/my-post'));
    assert.ok(result.includes('#privacy'));
    assert.ok(result.includes('#tools'));
  });

  it('should strip special characters from hashtags', () => {
    const result = formatMastodonPost({
      title: 'Test',
      description: 'Desc',
      url: 'https://example.com',
      tags: ['open-source', 'web dev'],
    });
    assert.ok(result.includes('#opensource'));
    assert.ok(result.includes('#webdev'));
  });

  it('should limit to 5 hashtags', () => {
    const result = formatMastodonPost({
      title: 'Test',
      description: 'Desc',
      url: 'https://example.com',
      tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    });
    const hashtagCount = (result.match(/#/g) || []).length;
    assert.equal(hashtagCount, 5);
  });
});

// ---------------------------------------------------------------------------
// formatBlueskyPost
// ---------------------------------------------------------------------------

describe('formatBlueskyPost', () => {
  it('should include title, description, and URL', () => {
    const result = formatBlueskyPost({
      title: 'My Post',
      description: 'A short description',
      url: 'https://nologin.tools/blog/my-post',
    });
    assert.ok(result.includes('My Post'));
    assert.ok(result.includes('A short description'));
    assert.ok(result.includes('https://nologin.tools/blog/my-post'));
  });

  it('should stay within 300 character limit', () => {
    const result = formatBlueskyPost({
      title: 'A'.repeat(50),
      description: 'B'.repeat(300),
      url: 'https://nologin.tools/blog/my-post',
    });
    assert.ok(result.length <= 300);
  });

  it('should truncate long descriptions with ellipsis', () => {
    const result = formatBlueskyPost({
      title: 'Short Title',
      description: 'X'.repeat(300),
      url: 'https://nologin.tools/blog/p',
    });
    assert.ok(result.includes('\u2026'));
    assert.ok(result.length <= 300);
  });

  it('should handle case where title + URL already near limit', () => {
    const result = formatBlueskyPost({
      title: 'T'.repeat(250),
      description: 'Some description',
      url: 'https://nologin.tools/blog/my-post',
    });
    // Should still include URL
    assert.ok(result.includes('https://nologin.tools/blog/my-post'));
  });
});

// ---------------------------------------------------------------------------
// buildBlueskyFacets
// ---------------------------------------------------------------------------

describe('buildBlueskyFacets', () => {
  it('should create correct byte offsets for URL', () => {
    const url = 'https://nologin.tools/blog/test';
    const text = `My Post\n\nDescription\n\n${url}`;
    const facets = buildBlueskyFacets(text, url);

    assert.equal(facets.length, 1);
    assert.equal(facets[0].features[0].$type, 'app.bsky.richtext.facet#link');
    assert.equal(facets[0].features[0].uri, url);

    // Verify byte offsets
    const encoder = new TextEncoder();
    const fullBytes = encoder.encode(text);
    const extractedUrl = new TextDecoder().decode(
      fullBytes.slice(facets[0].index.byteStart, facets[0].index.byteEnd)
    );
    assert.equal(extractedUrl, url);
  });

  it('should return empty array when URL not found', () => {
    const facets = buildBlueskyFacets('No URL here', 'https://example.com');
    assert.deepEqual(facets, []);
  });

  it('should handle UTF-8 text before URL', () => {
    const url = 'https://nologin.tools/blog/test';
    const text = `\u2605 \u65e5\u672c\u8a9e\u30c6\u30b9\u30c8\n\n${url}`;
    const facets = buildBlueskyFacets(text, url);

    assert.equal(facets.length, 1);
    const encoder = new TextEncoder();
    const fullBytes = encoder.encode(text);
    const extractedUrl = new TextDecoder().decode(
      fullBytes.slice(facets[0].index.byteStart, facets[0].index.byteEnd)
    );
    assert.equal(extractedUrl, url);
  });
});

// ---------------------------------------------------------------------------
// extractSlug
// ---------------------------------------------------------------------------

describe('extractSlug', () => {
  it('should extract slug from file path', () => {
    assert.equal(extractSlug('src/content/blog/my-post.md'), 'my-post');
  });

  it('should handle nested paths', () => {
    assert.equal(extractSlug('some/deep/path/post-name.md'), 'post-name');
  });
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('should parse --file argument', () => {
    const result = parseArgs(['node', 'script.mjs', '--file', 'src/content/blog/test.md']);
    assert.equal(result.file, 'src/content/blog/test.md');
  });

  it('should return empty string when no arguments', () => {
    const result = parseArgs(['node', 'script.mjs']);
    assert.equal(result.file, '');
  });
});
