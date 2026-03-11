#!/usr/bin/env node

/**
 * Pre-check script for the auto-translate workflow.
 * Determines if any translations are needed by comparing hashes.
 *
 * Outputs: needs_translation=true/false to GITHUB_OUTPUT
 */

import { readFileSync, existsSync, appendFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { readdirSync } from 'fs';

const LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

function hash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function setOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${key}=${value}\n`);
  }
  console.log(`${key}=${value}`);
}

let needsTranslation = false;

// 1. Check if en.json has changed vs locale files' _sourceHash
try {
  const enContent = readFileSync(join('src', 'i18n', 'en.json'), 'utf-8');
  const enHash = hash(enContent);

  for (const locale of LOCALES) {
    const localePath = join('src', 'i18n', `${locale}.json`);
    if (!existsSync(localePath)) {
      console.log(`[ui] Missing translation file: ${localePath}`);
      needsTranslation = true;
      break;
    }
    try {
      const localeData = JSON.parse(readFileSync(localePath, 'utf-8'));
      if (localeData._sourceHash !== enHash) {
        console.log(`[ui] Source hash mismatch for ${locale}: ${localeData._sourceHash} !== ${enHash}`);
        needsTranslation = true;
        break;
      }
      // Check for missing keys
      const enData = JSON.parse(enContent);
      const missingKeys = Object.keys(enData).filter(k => !(k in localeData));
      if (missingKeys.length > 0) {
        console.log(`[ui] ${locale} missing ${missingKeys.length} keys`);
        needsTranslation = true;
        break;
      }
    } catch {
      console.log(`[ui] Invalid JSON in ${localePath}`);
      needsTranslation = true;
      break;
    }
  }
} catch (err) {
  console.log(`[ui] Error reading en.json: ${err.message}`);
}

// 2. Check for untranslated blog posts
if (!needsTranslation) {
  try {
    const blogDir = join('src', 'content', 'blog');
    if (existsSync(blogDir)) {
      const entries = readdirSync(blogDir, { withFileTypes: true });
      const englishPosts = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name);

      for (const locale of LOCALES) {
        const localeDir = join(blogDir, locale);
        for (const post of englishPosts) {
          const translatedPath = join(localeDir, post);
          if (!existsSync(translatedPath)) {
            console.log(`[blog] Missing translation: ${locale}/${post}`);
            needsTranslation = true;
            break;
          }
          // Check sourceHash in frontmatter
          const translatedContent = readFileSync(translatedPath, 'utf-8');
          const sourceHashMatch = translatedContent.match(/sourceHash:\s*["']?(\w+)["']?/);
          if (sourceHashMatch) {
            const englishContent = readFileSync(join(blogDir, post), 'utf-8');
            // Hash the body (after frontmatter)
            const bodyMatch = englishContent.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
            const body = bodyMatch ? bodyMatch[1] : englishContent;
            const currentHash = hash(body);
            if (sourceHashMatch[1] !== currentHash) {
              console.log(`[blog] Content changed for ${locale}/${post}`);
              needsTranslation = true;
              break;
            }
          }
        }
        if (needsTranslation) break;
      }
    }
  } catch (err) {
    console.log(`[blog] Error checking blog posts: ${err.message}`);
  }
}

// 3. Check for untranslated tool descriptions
if (!needsTranslation) {
  try {
    const buildDataPath = join('src', 'data', 'build-data.json');
    if (existsSync(buildDataPath)) {
      const buildData = JSON.parse(readFileSync(buildDataPath, 'utf-8'));
      const tools = buildData.tools?.filter(t => t.status === 'approved') || [];

      for (const locale of LOCALES) {
        const translationsPath = join('src', 'data', 'translations', `${locale}.json`);
        let translations = {};
        try {
          if (existsSync(translationsPath)) {
            translations = JSON.parse(readFileSync(translationsPath, 'utf-8'));
          }
        } catch {}

        for (const tool of tools) {
          const existing = translations[tool.slug];
          if (!existing) {
            console.log(`[tools] Missing translation for ${tool.slug} in ${locale}`);
            needsTranslation = true;
            break;
          }
          // Check hash
          const contentToHash = `${tool.description || ''}|${tool.coreTask || ''}`;
          const currentHash = hash(contentToHash);
          if (existing._hash !== currentHash) {
            console.log(`[tools] Content changed for ${tool.slug} in ${locale}`);
            needsTranslation = true;
            break;
          }
        }
        if (needsTranslation) break;
      }
    } else {
      console.log('[tools] build-data.json not found, skipping tool check');
    }
  } catch (err) {
    console.log(`[tools] Error checking tool translations: ${err.message}`);
  }
}

setOutput('needs_translation', needsTranslation ? 'true' : 'false');
process.exit(0);
