#!/usr/bin/env node
// @ts-check
/**
 * Push SEO metadata from JSON files to Cloudflare D1.
 *
 * Reads `.github/auto-seo/{slug}.json` files, validates each,
 * and updates the corresponding tool's SEO fields in D1.
 *
 * Usage:
 *   node scripts/push-seo-update.mjs [--write] [--file path/to/file.json]
 *
 * Without --write, runs in dry-run mode (validate only).
 * With --file, processes a single file instead of scanning the directory.
 *
 * Required env vars:
 *   CLOUDFLARE_API_TOKEN
 *   CLOUDFLARE_ACCOUNT_ID
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_INTENTS, includesNoLoginIntent } from '../src/lib/tool-seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// D1 helpers
// ---------------------------------------------------------------------------

function stripJsonComments(str) {
  let result = '';
  let inString = false;
  for (let i = 0; i < str.length; i++) {
    if (inString) {
      if (str[i] === '\\') { result += str[i] + (str[i + 1] || ''); i++; continue; }
      if (str[i] === '"') inString = false;
      result += str[i];
    } else if (str[i] === '"') {
      inString = true;
      result += str[i];
    } else if (str[i] === '/' && str[i + 1] === '/') {
      while (i < str.length && str[i] !== '\n') i++;
      i--;
    } else if (str[i] === '/' && str[i + 1] === '*') {
      i += 2;
      while (i < str.length && !(str[i] === '*' && str[i + 1] === '/')) i++;
      i++;
    } else {
      result += str[i];
    }
  }
  return result;
}

async function queryD1(d1Api, apiToken, sql, params = []) {
  const res = await fetch(d1Api, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });
  if (!res.ok) {
    throw new Error(`D1 API error (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  }
  return json.result?.[0]?.results ?? [];
}

function getD1Config() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!apiToken || !accountId) {
    throw new Error('Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID');
  }
  const wranglerPath = resolve(__dirname, '../wrangler.jsonc');
  const wranglerContent = readFileSync(wranglerPath, 'utf-8');
  const wranglerJson = JSON.parse(stripJsonComments(wranglerContent).replace(/,(\s*[}\]])/g, '$1'));
  const databaseId = wranglerJson.d1_databases?.[0]?.database_id;
  if (!databaseId) {
    throw new Error('Could not find database_id in wrangler.jsonc');
  }
  const d1Api = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
  return { d1Api, apiToken };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a single SEO data object.
 * @param {Record<string, any>} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSeoData(data) {
  const errors = [];

  if (!data.seoTitle || typeof data.seoTitle !== 'string' || data.seoTitle.trim() === '') {
    errors.push('Missing or empty: seoTitle');
  } else if (data.seoTitle.length > 80) {
    errors.push(`seoTitle too long (${data.seoTitle.length} chars, max 80)`);
  }

  if (!data.seoDescription || typeof data.seoDescription !== 'string' || data.seoDescription.trim() === '') {
    errors.push('Missing or empty: seoDescription');
  } else if (data.seoDescription.length > 180) {
    errors.push(`seoDescription too long (${data.seoDescription.length} chars, max 180)`);
  }

  if (!data.seoFocusKeyword || typeof data.seoFocusKeyword !== 'string' || data.seoFocusKeyword.trim() === '') {
    errors.push('Missing or empty: seoFocusKeyword');
  } else if (data.seoFocusKeyword.length > 120) {
    errors.push(`seoFocusKeyword too long (${data.seoFocusKeyword.length} chars, max 120)`);
  }

  if (!data.seoIntent || typeof data.seoIntent !== 'string') {
    errors.push('Missing or empty: seoIntent');
  } else if (!SEO_INTENTS.includes(data.seoIntent)) {
    errors.push(`seoIntent must be one of: ${SEO_INTENTS.join(', ')}`);
  }

  if (!data.seoTaskPhrase || typeof data.seoTaskPhrase !== 'string' || data.seoTaskPhrase.trim() === '') {
    errors.push('Missing or empty: seoTaskPhrase');
  } else if (data.seoTaskPhrase.length > 120) {
    errors.push(`seoTaskPhrase too long (${data.seoTaskPhrase.length} chars, max 120)`);
  } else if (!includesNoLoginIntent(data.seoTaskPhrase)) {
    errors.push('seoTaskPhrase must include no-login intent (e.g. "without signup", "no account required")');
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const write = process.argv.includes('--write');
  const fileArgIdx = process.argv.indexOf('--file');
  const singleFile = fileArgIdx !== -1 ? process.argv[fileArgIdx + 1] : null;

  /** @type {string[]} */
  let files;
  if (singleFile) {
    files = [resolve(singleFile)];
  } else {
    const dir = resolve(__dirname, '../.github/auto-seo');
    try {
      files = readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => resolve(dir, f));
    } catch {
      console.log('[push-seo] No .github/auto-seo/ directory found');
      return;
    }
  }

  if (files.length === 0) {
    console.log('[push-seo] No JSON files to process');
    return;
  }

  const { d1Api, apiToken } = write ? getD1Config() : { d1Api: '', apiToken: '' };

  let success = 0;
  let failed = 0;

  for (const filePath of files) {
    const slug = basename(filePath, '.json');
    let data;
    try {
      data = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`[push-seo] ✗ ${slug} — invalid JSON: ${err.message}`);
      failed++;
      continue;
    }

    const result = validateSeoData(data);
    if (!result.valid) {
      console.error(`[push-seo] ✗ ${slug} — validation failed:`);
      for (const err of result.errors) {
        console.error(`    - ${err}`);
      }
      failed++;
      continue;
    }

    if (!write) {
      console.log(`[push-seo] ✓ ${slug} — valid (dry-run)`);
      console.log(`    title: ${data.seoTitle}`);
      console.log(`    desc:  ${data.seoDescription.slice(0, 60)}...`);
      success++;
      continue;
    }

    try {
      await queryD1(d1Api, apiToken, `
        UPDATE tools
        SET seo_title = ?, seo_description = ?, seo_focus_keyword = ?, seo_intent = ?, seo_task_phrase = ?
        WHERE slug = ? AND status = 'approved'
      `, [
        data.seoTitle,
        data.seoDescription,
        data.seoFocusKeyword,
        data.seoIntent,
        data.seoTaskPhrase,
        slug,
      ]);
      console.log(`[push-seo] ✓ ${slug} — updated`);
      success++;
    } catch (err) {
      console.error(`[push-seo] ✗ ${slug} — D1 error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[push-seo] Done: ${success} succeeded, ${failed} failed (${write ? 'write' : 'dry-run'})`);
  if (failed > 0) process.exit(1);
}

const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/push-seo-update.mjs'));

if (isMainModule) {
  main().catch((err) => {
    console.error(`[push-seo] Fatal error: ${err.message}`);
    process.exit(1);
  });
}
