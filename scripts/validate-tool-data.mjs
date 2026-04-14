// @ts-check
/**
 * Validate auto-discovered tool data JSON for correctness.
 *
 * Usage:
 *   node scripts/validate-tool-data.mjs path/to/tool.json
 *
 * Exit code:
 *   0 — valid
 *   1 — validation errors found
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_INTENTS, includesNoLoginIntent } from '../src/lib/tool-seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Tag definitions (shared with src/lib/tags.ts — single source for scripts)
// ---------------------------------------------------------------------------

const TAG_DEFINITIONS = JSON.parse(readFileSync(resolve(__dirname, 'tag-definitions.json'), 'utf-8'));
const TAG_KEY_MAP = new Map(TAG_DEFINITIONS.map((d) => [d.key, d]));

// Load exclude hostnames from sources config
const sourcesPath = resolve(__dirname, 'tool-discovery-sources.json');
let excludeHostnames = [];
try {
  const sources = JSON.parse(readFileSync(sourcesPath, 'utf-8'));
  excludeHostnames = sources.excludeHostnames || [];
} catch {
  // Sources file not found — skip hostname exclusion
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate tool data object.
 * @param {Record<string, any>} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateToolData(data) {
  /** @type {string[]} */
  const errors = [];

  // --- Required string fields ---
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Missing or empty required field: name');
  } else if (data.name.length < 2) {
    errors.push(`name too short (${data.name.length} chars, minimum 2)`);
  } else if (data.name.length > 100) {
    errors.push(`name too long (${data.name.length} chars, maximum 100)`);
  }

  if (!data.url || typeof data.url !== 'string' || data.url.trim() === '') {
    errors.push('Missing or empty required field: url');
  } else {
    try {
      const parsed = new URL(data.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push(`url must use http or https protocol, got: ${parsed.protocol}`);
      }
      // Check excluded hostnames
      const hostname = parsed.hostname.replace(/^www\./, '');
      if (excludeHostnames.some((h) => hostname === h || hostname.endsWith('.' + h))) {
        errors.push(`url hostname "${hostname}" is in the exclude list`);
      }
    } catch {
      errors.push(`url is not a valid URL: ${data.url}`);
    }
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
    errors.push('Missing or empty required field: description');
  } else if (data.description.length > 500) {
    errors.push(`description too long (${data.description.length} chars, maximum 500)`);
  }

  if (!data.coreTask || typeof data.coreTask !== 'string' || data.coreTask.trim() === '') {
    errors.push('Missing or empty required field: coreTask');
  } else if (data.coreTask.length > 200) {
    errors.push(`coreTask too long (${data.coreTask.length} chars, maximum 200)`);
  }

  if (!data.seoTitle || typeof data.seoTitle !== 'string' || data.seoTitle.trim() === '') {
    errors.push('Missing or empty required field: seoTitle');
  } else if (data.seoTitle.length > 80) {
    errors.push(`seoTitle too long (${data.seoTitle.length} chars, maximum 80)`);
  }

  if (!data.seoDescription || typeof data.seoDescription !== 'string' || data.seoDescription.trim() === '') {
    errors.push('Missing or empty required field: seoDescription');
  } else if (data.seoDescription.length > 180) {
    errors.push(`seoDescription too long (${data.seoDescription.length} chars, maximum 180)`);
  } else if (data.description && data.seoDescription.trim() === data.description.trim()) {
    errors.push('seoDescription should add search-specific context beyond description');
  }

  if (!data.seoTaskPhrase || typeof data.seoTaskPhrase !== 'string' || data.seoTaskPhrase.trim() === '') {
    errors.push('Missing or empty required field: seoTaskPhrase');
  } else if (data.seoTaskPhrase.length > 120) {
    errors.push(`seoTaskPhrase too long (${data.seoTaskPhrase.length} chars, maximum 120)`);
  } else if (!includesNoLoginIntent(data.seoTaskPhrase)) {
    errors.push('seoTaskPhrase must express no-login intent (for example: without signup, no account required)');
  }

  if (!data.seoFocusKeyword || typeof data.seoFocusKeyword !== 'string' || data.seoFocusKeyword.trim() === '') {
    errors.push('Missing or empty required field: seoFocusKeyword');
  } else if (data.seoFocusKeyword.length > 120) {
    errors.push(`seoFocusKeyword too long (${data.seoFocusKeyword.length} chars, maximum 120)`);
  }

  if (!data.seoIntent || typeof data.seoIntent !== 'string' || data.seoIntent.trim() === '') {
    errors.push('Missing or empty required field: seoIntent');
  } else if (!SEO_INTENTS.includes(data.seoIntent)) {
    errors.push(`seoIntent must be one of: ${SEO_INTENTS.join(', ')}`);
  }

  // --- Tags validation ---
  if (!Array.isArray(data.tags)) {
    errors.push('tags must be an array');
  } else {
    let categoryCount = 0;

    for (const tag of data.tags) {
      if (!tag || typeof tag !== 'object') {
        errors.push('Each tag must be an object with key and value');
        continue;
      }
      if (!tag.key || !tag.value) {
        errors.push('Each tag must have key and value fields');
        continue;
      }

      const def = TAG_KEY_MAP.get(tag.key);
      if (!def) {
        errors.push(`Invalid tag key: "${tag.key}" (valid: ${[...TAG_KEY_MAP.keys()].join(', ')})`);
        continue;
      }
      if (!def.values.includes(tag.value)) {
        errors.push(`Invalid tag value "${tag.value}" for key "${tag.key}" (valid: ${def.values.join(', ')})`);
      }

      if (tag.key === 'category') {
        categoryCount++;
      }
    }

    if (categoryCount === 0) {
      errors.push('tags must include exactly one category tag');
    } else if (categoryCount > 1) {
      errors.push(`tags must include exactly one category tag, found ${categoryCount}`);
    }
  }

  // --- Optional fields validation ---
  if (data.repoUrl !== undefined && data.repoUrl !== null && data.repoUrl !== '') {
    try {
      const repoUrlParsed = new URL(data.repoUrl);
      if (repoUrlParsed.hostname !== 'github.com') {
        errors.push(`repoUrl must be a GitHub URL, got hostname: ${repoUrlParsed.hostname}`);
      }
    } catch {
      errors.push(`repoUrl is not a valid URL: ${data.repoUrl}`);
    }
  }

  if (data.twitterUrl !== undefined && data.twitterUrl !== null && data.twitterUrl !== '') {
    try {
      const twParsed = new URL(data.twitterUrl);
      if (!['twitter.com', 'x.com'].includes(twParsed.hostname.replace(/^www\./, ''))) {
        errors.push(`twitterUrl must be a twitter.com or x.com URL`);
      }
    } catch {
      errors.push(`twitterUrl is not a valid URL: ${data.twitterUrl}`);
    }
  }

  if (data.githubUrl !== undefined && data.githubUrl !== null && data.githubUrl !== '') {
    try {
      const ghParsed = new URL(data.githubUrl);
      if (ghParsed.hostname.replace(/^www\./, '') !== 'github.com') {
        errors.push(`githubUrl must be a github.com URL`);
      }
    } catch {
      errors.push(`githubUrl is not a valid URL: ${data.githubUrl}`);
    }
  }

  if (data.discordUrl !== undefined && data.discordUrl !== null && data.discordUrl !== '') {
    try {
      const dcParsed = new URL(data.discordUrl);
      const dcHost = dcParsed.hostname.replace(/^www\./, '');
      if (!['discord.gg', 'discord.com'].includes(dcHost)) {
        errors.push(`discordUrl must be a discord.gg or discord.com URL`);
      }
    } catch {
      errors.push(`discordUrl is not a valid URL: ${data.discordUrl}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/validate-tool-data.mjs'));

if (isMainModule) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/validate-tool-data.mjs <path-to-tool.json>');
    process.exit(1);
  }

  try {
    const content = readFileSync(resolve(filePath), 'utf-8');
    const data = JSON.parse(content);
    const result = validateToolData(data);

    if (result.valid) {
      console.log(`✓ ${filePath} — valid`);
      process.exit(0);
    } else {
      console.error(`✗ ${filePath} — validation failed:`);
      for (const err of result.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }
  } catch (err) {
    console.error(`✗ ${filePath} — ${err.message}`);
    process.exit(1);
  }
}
