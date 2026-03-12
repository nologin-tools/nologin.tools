// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, validatePost } from '../validate-blog-post.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a valid blog post with overridable parts.
 * @param {object} [opts]
 * @param {string} [opts.title]
 * @param {string} [opts.description]
 * @param {string} [opts.publishedAt]
 * @param {string[]} [opts.tags]
 * @param {string} [opts.body]
 * @param {boolean} [opts.noFrontmatter]
 * @returns {string}
 */
function buildPost(opts = {}) {
  if (opts.noFrontmatter) return opts.body || 'Just some text without frontmatter.';

  const title = opts.title ?? 'A Practical Guide to Using No-Login Browser Tools Today';
  const description =
    opts.description ??
    'Learn how to use privacy-friendly browser tools that work without signup, covering image editing, document conversion, and more.';
  const publishedAt = opts.publishedAt ?? '2026-03-10';
  const tags = opts.tags ?? ['privacy', 'tools', 'guide'];

  const fm = [
    '---',
    `title: "${title}"`,
    `description: "${description}"`,
    `publishedAt: ${publishedAt}`,
    `author: "nologin.tools"`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
    `featured: false`,
    '---',
  ].join('\n');

  // Generate a body with enough words (default ~1100 words)
  const defaultBody = [
    '',
    '## Why Browser Tools Matter',
    '',
    'The web has changed. You no longer need to install software to get real work done.',
    'Browser-based tools handle everything from image editing to code formatting,',
    'and the best ones let you jump in without creating an account.',
    '',
    'Check out [Excalidraw](/tool/excalidraw-com) for whiteboard sketches.',
    'Also see our [welcome post](/blog/welcome) for background.',
    '',
    '## How to Pick the Right Tool',
    '',
    'Not all browser tools are equal. Some still track you heavily.',
    'Look for tools that process data locally — in your browser, not on a server.',
    'According to the [EFF](https://www.eff.org), client-side processing is the gold standard.',
    'The [Mozilla Foundation](https://foundation.mozilla.org) agrees.',
    '',
    '## Real-World Examples',
    '',
    'Here are tools that actually work without signup:',
    '',
    '> "The best tool is the one you can use right now." — Some wise person',
    '',
    // Pad with enough content to reach ~1100 words
    ...Array.from({ length: 100 }, (_, i) =>
      `This is paragraph ${i + 1} with enough words to pad the article to meet the minimum word count requirement for quality checks.`
    ),
  ].join('\n');

  return fm + '\n' + (opts.body ?? defaultBody);
}

// ---------------------------------------------------------------------------
// parseFrontmatter tests
// ---------------------------------------------------------------------------

describe('parseFrontmatter', () => {
  it('should parse valid frontmatter', () => {
    const { frontmatter, body } = parseFrontmatter(buildPost());
    assert.ok(frontmatter);
    assert.equal(frontmatter.title, 'A Practical Guide to Using No-Login Browser Tools Today');
    assert.equal(frontmatter.publishedAt, '2026-03-10');
    assert.deepEqual(frontmatter.tags, ['privacy', 'tools', 'guide']);
    assert.equal(frontmatter.featured, false);
    assert.ok(body.includes('## Why Browser Tools Matter'));
  });

  it('should return null frontmatter when missing', () => {
    const { frontmatter } = parseFrontmatter('Just text, no frontmatter');
    assert.equal(frontmatter, null);
  });
});

// ---------------------------------------------------------------------------
// validatePost tests
// ---------------------------------------------------------------------------

describe('validatePost', () => {
  it('should pass for a fully compliant post', () => {
    const content = buildPost();
    const issues = validatePost('test.md', content);
    const errors = issues.filter((i) => i.level === 'error');
    assert.equal(errors.length, 0, `Unexpected errors: ${errors.map((e) => e.message).join(', ')}`);
  });

  it('should error when title is missing', () => {
    const content = buildPost({ title: '' });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('title')));
  });

  it('should error when tags are empty', () => {
    const content = buildPost({ tags: [] });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('tags')));
  });

  it('should warn when title exceeds 70 characters', () => {
    const longTitle = 'A'.repeat(75);
    const content = buildPost({ title: longTitle });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'warning' && i.message.includes('Title too long')));
  });

  it('should warn when description is under 120 characters', () => {
    const content = buildPost({ description: 'Too short description here.' });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'warning' && i.message.includes('Description too short')));
  });

  it('should error when body has fewer than 1000 words', () => {
    const content = buildPost({ body: '## Short\n\nThis is way too short.' });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('too short')));
  });

  it('should error when post contains "delve into"', () => {
    const body = buildPost().replace('## Why Browser Tools Matter', '## Why We Delve Into Browser Tools');
    const issues = validatePost('test.md', body);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('delve')));
  });

  it('should error when post contains "game-changer"', () => {
    const padded = buildPost();
    const content = padded.replace('The web has changed.', 'This is a game-changer.');
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('game-changer')));
  });

  it('should error when post contains "seamless"', () => {
    const content = buildPost().replace('The web has changed.', 'It provides a seamless experience.');
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('seamless')));
  });

  it('should warn when tags exceed 5', () => {
    const content = buildPost({ tags: ['a', 'b', 'c', 'd', 'e', 'f'] });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'warning' && i.message.includes('Too many tags')));
  });

  it('should pass with exactly 1000 words (boundary)', () => {
    // Build a body with exactly ~1000 words
    const words = Array.from({ length: 990 }, (_, i) => `word${i}`).join(' ');
    const body = `## Heading One\n\n${words}\n\n## Heading Two\n\nMore content here for the second heading with some extra words to be safe.\n\nCheck [tool](/tool/test-tool) and [blog](/blog/welcome).`;
    const content = buildPost({ body });
    const issues = validatePost('test.md', content);
    const wordErrors = issues.filter((i) => i.level === 'error' && i.message.includes('too short'));
    assert.equal(wordErrors.length, 0, `Should not error at ~1000 words`);
  });

  it('should error when frontmatter is missing entirely', () => {
    const content = buildPost({ noFrontmatter: true, body: 'No frontmatter at all.' });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('frontmatter')));
  });

  it('should error when publishedAt is missing', () => {
    // Manually construct without publishedAt
    const content = [
      '---',
      'title: "A Practical Guide to Using No-Login Browser Tools Today"',
      'description: "Learn how to use privacy-friendly browser tools that work without signup, covering image editing, document conversion, and more."',
      'author: "nologin.tools"',
      'tags: ["privacy", "tools"]',
      '---',
      '',
      '## Heading',
      '',
      ...Array.from({ length: 110 }, (_, i) => `Word padding sentence number ${i} to reach the minimum word count.`),
    ].join('\n');
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('publishedAt')));
  });

  it('should warn with fewer than 2 H2 headings', () => {
    const body = [
      '## Only One Heading',
      '',
      ...Array.from({ length: 110 }, (_, i) => `Sentence ${i} padding to reach word count minimum requirement for validation.`),
      '',
      'Check [tool](/tool/test) and [post](/blog/welcome).',
    ].join('\n');
    const content = buildPost({ body });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'warning' && i.message.includes('H2')));
  });

  it('should warn when no internal links are present', () => {
    const body = [
      '## Heading One',
      '',
      '## Heading Two',
      '',
      ...Array.from({ length: 110 }, (_, i) => `Sentence ${i} for padding to meet word count requirements.`),
    ].join('\n');
    const content = buildPost({ body });
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'warning' && i.message.includes('internal links')));
  });

  it('should not flag "navigate to the page" (literal use)', () => {
    const content = buildPost().replace('The web has changed.', 'Navigate to the page and click submit.');
    const issues = validatePost('test.md', content);
    const navErrors = issues.filter((i) => i.message.includes('navigate'));
    assert.equal(navErrors.length, 0);
  });

  it('should flag "navigate the challenges" (metaphorical use)', () => {
    const content = buildPost().replace('The web has changed.', 'You need to navigate the challenges of privacy.');
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'error' && i.message.includes('navigate')));
  });

  it('should not flag "landscape mode" (literal use)', () => {
    const content = buildPost().replace('The web has changed.', 'Switch to landscape mode for better viewing.');
    const issues = validatePost('test.md', content);
    const landErrors = issues.filter((i) => i.message.includes('landscape'));
    assert.equal(landErrors.length, 0);
  });

  it('should warn when post has no image', () => {
    const content = buildPost();
    const issues = validatePost('test.md', content);
    assert.ok(issues.some((i) => i.level === 'warning' && i.message.includes('No image')));
  });

  it('should not warn when post contains an image', () => {
    const content = buildPost().replace(
      '## Why Browser Tools Matter',
      '![Hero image](/blog/images/test/hero.jpg)\n\n## Why Browser Tools Matter'
    );
    const issues = validatePost('test.md', content);
    const imageWarnings = issues.filter((i) => i.level === 'warning' && i.message.includes('No image'));
    assert.equal(imageWarnings.length, 0);
  });
});
