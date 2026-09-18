#!/usr/bin/env node
// @ts-check
/**
 * Push indexable URLs to the IndexNow protocol (Bing, Yandex, Seznam, Naver).
 *
 * Usage:
 *   node scripts/push-indexnow.mjs [--dry-run] [--key <key>] [--limit <n>]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export const DEFAULT_INDEXNOW_KEY = 'c8d3e2b14f6a7905182746359012abcd';
export const HOST = 'nologin.tools';

/**
 * Extracts all <loc> URLs from a sitemap XML string.
 * @param {string} xml
 * @returns {string[]}
 */
export function extractUrlsFromSitemap(xml) {
  const urls = [];
  const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

/**
 * Prepares IndexNow payload.
 * @param {string[]} urls
 * @param {string} key
 * @returns {object}
 */
export function buildIndexNowPayload(urls, key = DEFAULT_INDEXNOW_KEY) {
  return {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: urls,
  };
}

/**
 * Main execution function
 */
export async function pushIndexNow(options = {}) {
  const isDryRun = options.dryRun ?? process.argv.includes('--dry-run');
  const key = options.key || DEFAULT_INDEXNOW_KEY;
  const fetchImpl = options.fetchImpl || fetch;

  let xml = options.sitemapXml || '';
  const distSitemap = resolve(ROOT, 'dist/sitemap.xml');
  const publicSitemap = resolve(ROOT, 'public/sitemap.xml');

  if (!xml) {
    try {
      console.log(`[indexnow] Fetching live sitemap from https://${HOST}/sitemap.xml...`);
      const res = await fetchImpl(`https://${HOST}/sitemap.xml`);
      if (res.ok) {
        xml = await res.text();
      }
    } catch (err) {
      console.warn('[indexnow] Failed to fetch remote sitemap:', err.message);
    }
  }
  if (!xml && existsSync(distSitemap)) {
    console.warn('[indexnow] Falling back to dist/sitemap.xml because the live sitemap was unavailable.');
    xml = readFileSync(distSitemap, 'utf-8');
  } else if (!xml && existsSync(publicSitemap)) {
    console.warn('[indexnow] Falling back to public/sitemap.xml because the live sitemap was unavailable.');
    xml = readFileSync(publicSitemap, 'utf-8');
  }

  if (!xml) {
    console.error('[indexnow] Error: No sitemap.xml found. Run `pnpm build` first or ensure site is accessible.');
    return { success: false, count: 0 };
  }

  const urls = extractUrlsFromSitemap(xml);
  if (urls.length === 0) {
    console.error('[indexnow] Error: No URLs extracted from sitemap.');
    return { success: false, count: 0 };
  }

  const limitIndex = process.argv.indexOf('--limit');
  const limit = options.limit ?? (limitIndex !== -1 ? parseInt(process.argv[limitIndex + 1], 10) : undefined);
  const targetUrls = limit ? urls.slice(0, limit) : urls;

  const payload = buildIndexNowPayload(targetUrls, key);

  console.log(`[indexnow] Prepared ${targetUrls.length} URLs for submission to IndexNow.`);
  console.log(`[indexnow] Key: ${payload.key}`);
  console.log(`[indexnow] Key Location: ${payload.keyLocation}`);

  if (isDryRun) {
    console.log('[indexnow] DRY RUN MODE: submission skipped.');
    console.log('[indexnow] Sample URLs:', targetUrls.slice(0, 5));
    return { success: true, count: targetUrls.length, dryRun: true };
  }

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];
  const endpointResults = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`[indexnow] Submitting to ${endpoint}...`);
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 202) {
        console.log(`[indexnow] Success (${res.status}) from ${endpoint}`);
        endpointResults.push({ endpoint, ok: true, status: res.status });
      } else {
        const text = await res.text().catch(() => '');
        console.warn(`[indexnow] Warning: Response ${res.status} from ${endpoint}: ${text}`);
        endpointResults.push({ endpoint, ok: false, status: res.status, error: text });
      }
    } catch (err) {
      console.error(`[indexnow] Submission error from ${endpoint}:`, err);
      endpointResults.push({ endpoint, ok: false, status: null, error: err.message });
    }
  }

  const successCount = endpointResults.filter(result => result.ok).length;
  return {
    success: successCount === endpoints.length,
    partial: successCount > 0 && successCount < endpoints.length,
    successCount,
    endpointResults,
    count: targetUrls.length,
    dryRun: false,
  };
}

// Run directly if invoked as main script
const isMain = process.argv[1] && process.argv[1].endsWith('push-indexnow.mjs');
if (isMain) {
  pushIndexNow().then((res) => {
    if (!res.success) {
      process.exit(1);
    }
  });
}
