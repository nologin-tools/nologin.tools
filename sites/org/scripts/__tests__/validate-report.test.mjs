import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportsDir = join(__dirname, '../../src/content/reports');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentValue = '';
  let inArray = false;
  let arrayValues = [];

  for (const line of lines) {
    if (inArray) {
      if (line.match(/^\s*-\s/)) {
        const val = line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '');
        arrayValues.push(val);
        continue;
      } else {
        frontmatter[currentKey] = arrayValues;
        inArray = false;
        arrayValues = [];
      }
    }

    const keyMatch = line.match(/^(\w+):\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      currentValue = keyMatch[2].trim();

      if (currentValue === '') {
        // Could be start of array or multiline
        continue;
      }

      if (currentValue.startsWith('[') && currentValue.endsWith(']')) {
        // Inline array
        frontmatter[currentKey] = currentValue
          .slice(1, -1)
          .split(',')
          .map(v => v.trim().replace(/^["']|["']$/g, ''));
      } else {
        frontmatter[currentKey] = currentValue.replace(/^["']|["']$/g, '');
      }
    } else if (line.match(/^\s*-\s/) && currentKey) {
      inArray = true;
      const val = line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '');
      arrayValues = [val];
    }
  }

  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayValues;
  }

  return frontmatter;
}

function getBodyContent(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/);
  return match ? match[1].trim() : '';
}

describe('Report frontmatter validation', () => {
  const files = readdirSync(reportsDir).filter(f => f.endsWith('.md'));

  it('should have at least one report', () => {
    assert.ok(files.length > 0, 'No report files found');
  });

  for (const file of files) {
    const content = readFileSync(join(reportsDir, file), 'utf-8');
    const frontmatter = parseFrontmatter(content);

    describe(`${file}`, () => {
      it('should have valid frontmatter', () => {
        assert.ok(frontmatter, 'No frontmatter found');
      });

      it('should have required title field', () => {
        assert.ok(frontmatter.title, 'Missing title');
        assert.ok(frontmatter.title.length > 0, 'Title is empty');
      });

      it('should have required description field', () => {
        assert.ok(frontmatter.description, 'Missing description');
        assert.ok(frontmatter.description.length > 0, 'Description is empty');
      });

      it('should have required publishedAt date', () => {
        assert.ok(frontmatter.publishedAt, 'Missing publishedAt');
        const date = new Date(frontmatter.publishedAt);
        assert.ok(!isNaN(date.getTime()), 'Invalid publishedAt date');
      });

      it('should have valid version format', () => {
        if (frontmatter.version) {
          assert.match(frontmatter.version, /^\d+\.\d+/, 'Version should be X.Y format');
        }
      });

      it('should have tags as array', () => {
        if (frontmatter.tags) {
          assert.ok(Array.isArray(frontmatter.tags), 'Tags should be an array');
          assert.ok(frontmatter.tags.length > 0, 'Tags should not be empty');
        }
      });

      it('should have body content with sufficient word count', () => {
        const body = getBodyContent(content);
        const wordCount = body.split(/\s+/).filter(Boolean).length;
        assert.ok(wordCount >= 1000, `Report should have at least 1000 words, got ${wordCount}`);
      });

      it('should have H2 headings for chapters', () => {
        const body = getBodyContent(content);
        const h2Count = (body.match(/^## /gm) || []).length;
        assert.ok(h2Count >= 3, `Report should have at least 3 H2 headings, got ${h2Count}`);
      });

      it('should reference nologin.tools', () => {
        const body = getBodyContent(content);
        assert.ok(body.includes('nologin.tools'), 'Report should reference nologin.tools');
      });

      it('should have valid updatedAt date if present', () => {
        if (frontmatter.updatedAt) {
          const date = new Date(frontmatter.updatedAt);
          assert.ok(!isNaN(date.getTime()), 'Invalid updatedAt date');
        }
      });

      it('should have description under 300 characters', () => {
        assert.ok(
          frontmatter.description.length <= 300,
          `Description too long: ${frontmatter.description.length} chars (max 300)`
        );
      });
    });
  }
});

describe('Report frontmatter edge cases', () => {
  it('should handle missing optional fields gracefully', () => {
    const minimalContent = `---
title: "Test Report"
description: "A test report"
publishedAt: 2026-01-01
---

## Test content here

This is test body content with enough words to pass validation checks.
`;
    const fm = parseFrontmatter(minimalContent);
    assert.ok(fm, 'Should parse minimal frontmatter');
    assert.equal(fm.title, 'Test Report');
    assert.equal(fm.subtitle, undefined, 'Subtitle should be undefined');
    assert.equal(fm.updatedAt, undefined, 'updatedAt should be undefined');
    assert.equal(fm.abstract, undefined, 'abstract should be undefined');
  });

  it('should reject content without frontmatter', () => {
    const noFm = '# Just a title\n\nSome content';
    const fm = parseFrontmatter(noFm);
    assert.equal(fm, null, 'Should return null for missing frontmatter');
  });
});
