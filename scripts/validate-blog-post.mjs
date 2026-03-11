// @ts-check
/**
 * Validate blog post quality for CI.
 *
 * Usage:
 *   node scripts/validate-blog-post.mjs                   # validate all posts in src/content/blog/
 *   node scripts/validate-blog-post.mjs path/to/post.md   # validate specific file(s)
 *
 * Exit code:
 *   0 — all checks passed (warnings are OK)
 *   1 — at least one error found
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');

// ---------------------------------------------------------------------------
// Banned AI phrases
// ---------------------------------------------------------------------------

const BANNED_PHRASES = [
  'delve',
  'in this article we will',
  "it's worth noting",
  'in conclusion',
  'game-changer',
  'game changer',
  'seamless',
  'leverage',
  'robust',
  'cutting-edge',
  'cutting edge',
  'empower',
  'unlock',
  'without further ado',
  'dive in',
  "in today's digital age",
  'harness',
  'revolutionize',
  'streamline',
  'elevate',
  'foster',
  'spearhead',
  'paradigm',
  'synergy',
];

// Contextual phrases — only flagged as metaphorical use
const METAPHOR_PHRASES = [
  { phrase: 'navigate', pattern: /\bnavigate\b(?!\s+(?:to|the\s+(?:page|site|menu|tab|url|web)))/gi },
  { phrase: 'landscape', pattern: /\blandscape\b(?!\s+(?:mode|orientation|photo|image|picture|format))/gi },
  { phrase: 'comprehensive', pattern: /\bcomprehensive\b\s+(?:guide|article|post|overview|look)/gi },
];

// ---------------------------------------------------------------------------
// Frontmatter parser
// ---------------------------------------------------------------------------

/**
 * Parse YAML frontmatter from markdown content.
 * @param {string} content
 * @returns {{ frontmatter: Record<string, any> | null, body: string }}
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of raw.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;

    const [, key, val] = kv;
    let value = val.trim();

    // Parse arrays: ["a", "b"]
    if (value.startsWith('[')) {
      try {
        value = JSON.parse(value);
      } catch {
        value = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    }
    // Strip quotes
    else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Booleans
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

// ---------------------------------------------------------------------------
// Validation checks
// ---------------------------------------------------------------------------

/**
 * @typedef {{ level: 'error' | 'warning', message: string }} Issue
 */

/**
 * Validate a single blog post.
 * @param {string} filePath
 * @param {string} content
 * @returns {Issue[]}
 */
export function validatePost(filePath, content) {
  /** @type {Issue[]} */
  const issues = [];

  const { frontmatter, body } = parseFrontmatter(content);

  // --- Frontmatter checks ---
  if (!frontmatter) {
    issues.push({ level: 'error', message: 'Missing frontmatter (no --- delimiters found)' });
    return issues; // Can't check further
  }

  if (!frontmatter.title || String(frontmatter.title).trim() === '') {
    issues.push({ level: 'error', message: 'Missing or empty `title` in frontmatter' });
  } else {
    const titleLen = String(frontmatter.title).length;
    if (titleLen < 50) {
      issues.push({ level: 'warning', message: `Title too short (${titleLen} chars, recommended 50-70)` });
    }
    if (titleLen > 70) {
      issues.push({ level: 'warning', message: `Title too long (${titleLen} chars, recommended 50-70)` });
    }
  }

  if (!frontmatter.description || String(frontmatter.description).trim() === '') {
    issues.push({ level: 'error', message: 'Missing or empty `description` in frontmatter' });
  } else {
    const descLen = String(frontmatter.description).length;
    if (descLen < 120) {
      issues.push({ level: 'warning', message: `Description too short (${descLen} chars, recommended 120-160)` });
    }
    if (descLen > 160) {
      issues.push({ level: 'warning', message: `Description too long (${descLen} chars, recommended 120-160)` });
    }
  }

  if (!frontmatter.publishedAt) {
    issues.push({ level: 'error', message: 'Missing `publishedAt` in frontmatter' });
  }

  const tags = frontmatter.tags;
  if (!tags || (Array.isArray(tags) && tags.length === 0)) {
    issues.push({ level: 'error', message: 'Missing or empty `tags` in frontmatter' });
  } else if (Array.isArray(tags)) {
    if (tags.length < 2) {
      issues.push({ level: 'warning', message: `Too few tags (${tags.length}, recommended 2-5)` });
    }
    if (tags.length > 5) {
      issues.push({ level: 'warning', message: `Too many tags (${tags.length}, recommended 2-5)` });
    }
  }

  // --- Body checks ---
  // Word count (split on whitespace, filter empty)
  const words = body.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  if (wordCount < 1000) {
    issues.push({ level: 'error', message: `Article too short (${wordCount} words, minimum 1000)` });
  }

  // H2 headings count
  const h2Matches = body.match(/^##\s+.+$/gm) || [];
  if (h2Matches.length < 2) {
    issues.push({ level: 'warning', message: `Too few H2 headings (${h2Matches.length}, recommended at least 2)` });
  }

  // Internal links
  const internalLinks = body.match(/\]\(\s*\/(?:tool|blog)\//g) || [];
  if (internalLinks.length < 1) {
    issues.push({ level: 'warning', message: 'No internal links found (recommend at least 1 /tool/ or /blog/ link)' });
  }

  // AI phrase detection
  const bodyLower = body.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (bodyLower.includes(phrase.toLowerCase())) {
      issues.push({ level: 'error', message: `Contains banned AI phrase: "${phrase}"` });
    }
  }

  for (const { phrase, pattern } of METAPHOR_PHRASES) {
    if (pattern.test(body)) {
      issues.push({ level: 'error', message: `Contains banned metaphorical use of "${phrase}"` });
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Main (CLI)
// ---------------------------------------------------------------------------

/**
 * In CI (PR context), find only changed/added blog files vs base branch.
 * @returns {string[] | null} — list of changed blog files, or null if not in PR context
 */
function getChangedBlogFiles() {
  const baseBranch = process.env.GITHUB_BASE_REF;
  if (!baseBranch) return null;

  try {
    const diff = execSync(
      `git diff --name-only --diff-filter=ACMR origin/${baseBranch}...HEAD -- src/content/blog/`,
      { encoding: 'utf-8' }
    ).trim();
    if (!diff) return [];
    return diff
      .split('\n')
      .filter((f) => f.endsWith('.md'))
      .map((f) => resolve(ROOT, f))
      .filter((f) => existsSync(f));
  } catch {
    return null; // Fall back to checking all files
  }
}

function main() {
  const args = process.argv.slice(2);

  /** @type {string[]} */
  let files;

  if (args.length > 0) {
    files = args.map((f) => resolve(f));
  } else {
    // In CI PR context, only validate changed files
    const changedFiles = getChangedBlogFiles();
    if (changedFiles !== null) {
      files = changedFiles;
      if (files.length === 0) {
        console.log('No changed blog posts to validate.');
        process.exit(0);
      }
      console.log(`Validating ${files.length} changed blog file(s)...`);
    } else {
      try {
        files = readdirSync(BLOG_DIR)
          .filter((f) => f.endsWith('.md'))
          .map((f) => resolve(BLOG_DIR, f));
      } catch {
        console.log('No blog posts found in src/content/blog/');
        process.exit(0);
      }
    }
  }

  if (files.length === 0) {
    console.log('No blog posts to validate.');
    process.exit(0);
  }

  let hasErrors = false;

  const LOCALE_DIRS = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

  for (const file of files) {
    // Skip translated blog posts (in locale subdirectories)
    const relativePath = file.replace(BLOG_DIR + '/', '');
    const firstSegment = relativePath.split('/')[0];
    if (LOCALE_DIRS.includes(firstSegment)) {
      console.log(`⊘ ${file} (skipped: translated post)`);
      continue;
    }

    const content = readFileSync(file, 'utf-8');
    const issues = validatePost(file, content);

    if (issues.length === 0) {
      console.log(`✓ ${file}`);
      continue;
    }

    for (const issue of issues) {
      const prefix = issue.level === 'error' ? '✗ ERROR' : '⚠ WARNING';
      console.log(`${prefix}: ${file} — ${issue.message}`);
      if (issue.level === 'error') hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log('\nValidation failed with errors.');
    process.exit(1);
  } else {
    console.log('\nValidation passed.');
    process.exit(0);
  }
}

// Only run main when executed directly (not imported)
const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/validate-blog-post.mjs'));

if (isMainModule) {
  main();
}
