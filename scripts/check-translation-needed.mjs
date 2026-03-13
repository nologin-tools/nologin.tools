#!/usr/bin/env node

/**
 * Pre-check script for the auto-translate workflow.
 * Produces a structured change manifest describing exactly what needs translation.
 *
 * Outputs (GITHUB_OUTPUT):
 *   needs_translation=true/false   (backward-compatible)
 *   task_types=ui,blog,tools       (comma-separated list of task types that need work)
 *   change_manifest=<JSON>         (multiline, structured change details)
 *
 * The manifest avoids Claude having to re-read files and re-compute hashes.
 */

import { readFileSync, existsSync, appendFileSync } from 'fs';
import { createHash, randomUUID } from 'crypto';
import { join } from 'path';
import { readdirSync } from 'fs';

export const LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

export function hash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function setOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${key}=${value}\n`);
  }
  console.log(`${key}=${value}`);
}

function setMultilineOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const delimiter = `ghadelimiter_${randomUUID()}`;
    appendFileSync(outputFile, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
  }
  // For console, print as single-line JSON
  console.log(`${key}=${value}`);
}

/**
 * Check UI strings (en.json vs locale files).
 * Returns the "ui" section of the manifest.
 */
export function checkUI() {
  const result = { sourceHash: '', locales: {} };
  try {
    const enContent = readFileSync(join('src', 'i18n', 'en.json'), 'utf-8');
    const enHash = hash(enContent);
    result.sourceHash = enHash;
    const enData = JSON.parse(enContent);

    for (const locale of LOCALES) {
      const localePath = join('src', 'i18n', `${locale}.json`);
      if (!existsSync(localePath)) {
        console.log(`[ui] Missing translation file: ${localePath}`);
        result.locales[locale] = { status: 'missing' };
        continue;
      }
      try {
        const localeData = JSON.parse(readFileSync(localePath, 'utf-8'));
        if (localeData._sourceHash !== enHash) {
          console.log(`[ui] Source hash mismatch for ${locale}: ${localeData._sourceHash} !== ${enHash}`);
          result.locales[locale] = { status: 'hash_mismatch' };
          continue;
        }
        // Check for missing keys
        const missingKeys = Object.keys(enData).filter(k => !(k in localeData));
        if (missingKeys.length > 0) {
          console.log(`[ui] ${locale} missing ${missingKeys.length} keys`);
          result.locales[locale] = { status: 'missing_keys', missingKeys };
          continue;
        }
        result.locales[locale] = { status: 'up_to_date' };
      } catch {
        console.log(`[ui] Invalid JSON in ${localePath}`);
        result.locales[locale] = { status: 'invalid_json' };
      }
    }
  } catch (err) {
    console.log(`[ui] Error reading en.json: ${err.message}`);
  }
  return result;
}

/**
 * Check blog posts for untranslated or outdated translations.
 * Returns the "blog" section of the manifest.
 */
export function checkBlog() {
  const result = { posts: {} };
  try {
    const blogDir = join('src', 'content', 'blog');
    if (!existsSync(blogDir)) return result;

    const entries = readdirSync(blogDir, { withFileTypes: true });
    const englishPosts = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name);

    for (const post of englishPosts) {
      const englishContent = readFileSync(join(blogDir, post), 'utf-8');
      const bodyMatch = englishContent.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
      const body = bodyMatch ? bodyMatch[1] : englishContent;
      const sourceHash = hash(body);

      const localeStatuses = {};
      for (const locale of LOCALES) {
        const localeDir = join(blogDir, locale);
        const translatedPath = join(localeDir, post);
        if (!existsSync(translatedPath)) {
          console.log(`[blog] Missing translation: ${locale}/${post}`);
          localeStatuses[locale] = 'missing';
          continue;
        }
        // Check sourceHash in frontmatter
        const translatedContent = readFileSync(translatedPath, 'utf-8');
        const sourceHashMatch = translatedContent.match(/sourceHash:\s*["']?(\w+)["']?/);
        if (sourceHashMatch) {
          if (sourceHashMatch[1] !== sourceHash) {
            console.log(`[blog] Content changed for ${locale}/${post}`);
            localeStatuses[locale] = 'hash_mismatch';
            continue;
          }
        } else {
          // No sourceHash in frontmatter — treat as needing update
          console.log(`[blog] No sourceHash in ${locale}/${post}`);
          localeStatuses[locale] = 'hash_mismatch';
          continue;
        }
        localeStatuses[locale] = 'up_to_date';
      }

      // Only include post in manifest if at least one locale needs work
      const needsWork = Object.values(localeStatuses).some(s => s !== 'up_to_date');
      if (needsWork) {
        result.posts[post] = { sourceHash, locales: localeStatuses };
      }
    }
  } catch (err) {
    console.log(`[blog] Error checking blog posts: ${err.message}`);
  }
  return result;
}

/**
 * Check tool descriptions for untranslated or outdated translations.
 * Returns the "tools" section of the manifest.
 */
export function checkTools() {
  const result = { items: {} };
  try {
    const buildDataPath = join('src', 'data', 'build-data.json');
    if (!existsSync(buildDataPath)) {
      console.log('[tools] build-data.json not found, skipping tool check');
      return result;
    }

    const buildData = JSON.parse(readFileSync(buildDataPath, 'utf-8'));
    const tools = buildData.tools?.filter(t => t.status === 'approved') || [];

    // Pre-load all locale translation files
    const translationsByLocale = {};
    for (const locale of LOCALES) {
      const translationsPath = join('src', 'data', 'translations', `${locale}.json`);
      try {
        if (existsSync(translationsPath)) {
          translationsByLocale[locale] = JSON.parse(readFileSync(translationsPath, 'utf-8'));
        } else {
          translationsByLocale[locale] = {};
        }
      } catch {
        translationsByLocale[locale] = {};
      }
    }

    for (const tool of tools) {
      const contentToHash = `${tool.description || ''}|${tool.coreTask || ''}`;
      const sourceHash = hash(contentToHash);

      const localeStatuses = {};
      for (const locale of LOCALES) {
        const existing = translationsByLocale[locale][tool.slug];
        if (!existing) {
          console.log(`[tools] Missing translation for ${tool.slug} in ${locale}`);
          localeStatuses[locale] = 'missing';
          continue;
        }
        if (existing._hash !== sourceHash) {
          console.log(`[tools] Content changed for ${tool.slug} in ${locale}`);
          localeStatuses[locale] = 'hash_mismatch';
          continue;
        }
        localeStatuses[locale] = 'up_to_date';
      }

      // Only include tool in manifest if at least one locale needs work
      const needsWork = Object.values(localeStatuses).some(s => s !== 'up_to_date');
      if (needsWork) {
        result.items[tool.slug] = { sourceHash, locales: localeStatuses };
      }
    }
  } catch (err) {
    console.log(`[tools] Error checking tool translations: ${err.message}`);
  }
  return result;
}

/**
 * Build the full change manifest and determine task types.
 */
export function buildManifest() {
  const ui = checkUI();
  const blog = checkBlog();
  const tools = checkTools();

  const manifest = { ui, blog, tools };

  // Determine which task types need work
  const taskTypes = [];
  const uiNeedsWork = Object.values(ui.locales).some(l => l.status !== 'up_to_date');
  if (uiNeedsWork) taskTypes.push('ui');

  if (Object.keys(blog.posts).length > 0) taskTypes.push('blog');
  if (Object.keys(tools.items).length > 0) taskTypes.push('tools');

  const needsTranslation = taskTypes.length > 0;

  return { manifest, taskTypes, needsTranslation };
}

// --- Main execution (only when run directly) ---
const isMain = !process.argv[1] || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
// More robust check: skip main if NODE_TEST_CONTEXT is set (running under test runner)
const isTestEnv = !!process.env.NODE_TEST_CONTEXT;

if (isMain && !isTestEnv) {
  const { manifest, taskTypes, needsTranslation } = buildManifest();

  setOutput('needs_translation', needsTranslation ? 'true' : 'false');
  if (taskTypes.length > 0) {
    setOutput('task_types', taskTypes.join(','));
  }
  setMultilineOutput('change_manifest', JSON.stringify(manifest));

  process.exit(0);
}
