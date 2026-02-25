// @ts-check
/**
 * Fetch build data from Cloudflare D1 REST API for static site generation.
 *
 * Usage:
 *   node scripts/fetch-build-data.mjs          # fetch from remote D1
 *   node scripts/fetch-build-data.mjs --mock   # generate empty data (for PR build checks)
 *
 * Required env vars (non-mock):
 *   CLOUDFLARE_API_TOKEN
 *   CLOUDFLARE_ACCOUNT_ID
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../src/data/build-data.json');

const isMock = process.argv.includes('--mock');

if (isMock) {
  console.log('[build-data] Generating mock data...');
  const mockData = {
    generatedAt: new Date().toISOString(),
    tools: [],
  };
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(mockData, null, 2));
  console.log(`[build-data] Mock data written to ${OUTPUT_PATH}`);
  process.exit(0);
}

// Read database_id from wrangler.jsonc
const wranglerPath = resolve(__dirname, '../wrangler.jsonc');
const wranglerContent = readFileSync(wranglerPath, 'utf-8');
// Strip comments (// ...) for JSON parsing
const wranglerJson = JSON.parse(
  wranglerContent.replace(/\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1')
);
const databaseId = wranglerJson.d1_databases?.[0]?.database_id;
if (!databaseId) {
  console.error('[build-data] Could not find database_id in wrangler.jsonc');
  process.exit(1);
}

const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!apiToken || !accountId) {
  console.error('[build-data] Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID');
  process.exit(1);
}

const D1_API = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

/**
 * Execute a SQL query against D1 REST API.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any[]>}
 */
async function queryD1(sql, params = []) {
  const body = { sql, params };
  const res = await fetch(D1_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`D1 API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  }

  return json.result?.[0]?.results ?? [];
}

console.log('[build-data] Fetching data from D1...');

// Query 1: All non-rejected tools
const toolRows = await queryD1(`
  SELECT id, slug, name, url, description, core_task, status,
         submitted_at, approved_at, rejection_reason, submitter_email,
         archive_url, is_featured, featured_at, submitter_ip_hash
  FROM tools
  WHERE status != 'rejected'
  ORDER BY id
`);

console.log(`[build-data] Fetched ${toolRows.length} tools`);

// Query 2: All tags for non-rejected tools
const tagRows = await queryD1(`
  SELECT t.tool_id, t.tag_key, t.tag_value
  FROM tags t
  INNER JOIN tools ON tools.id = t.tool_id
  WHERE tools.status != 'rejected'
`);

console.log(`[build-data] Fetched ${tagRows.length} tags`);

// Query 3: Health checks — last 5 per tool + 14-day history for timeline
// We fetch all checks from the last 14 days (covers both needs)
const fourteenDaysAgoSec = Math.floor((Date.now() - 14 * 86400000) / 1000);
const healthRows = await queryD1(`
  SELECT hc.tool_id, hc.is_online, hc.checked_at, hc.http_status, hc.response_time_ms
  FROM health_checks hc
  INNER JOIN tools ON tools.id = hc.tool_id
  WHERE tools.status != 'rejected'
    AND hc.checked_at > ?
  ORDER BY hc.checked_at DESC
`, [fourteenDaysAgoSec]);

console.log(`[build-data] Fetched ${healthRows.length} health checks`);

// Query 4: Badge displays
const badgeRows = await queryD1(`
  SELECT bd.tool_id, bd.display_type
  FROM badge_displays bd
  INNER JOIN tools ON tools.id = bd.tool_id
  WHERE tools.status != 'rejected'
`);

console.log(`[build-data] Fetched ${badgeRows.length} badge displays`);

// Build lookup maps
const tagMap = new Map();
for (const row of tagRows) {
  const id = row.tool_id;
  if (!tagMap.has(id)) tagMap.set(id, []);
  tagMap.get(id).push({ tagKey: row.tag_key, tagValue: row.tag_value });
}

const badgeMap = new Map();
for (const row of badgeRows) {
  badgeMap.set(row.tool_id, row.display_type);
}

// Group health checks per tool: recent 5 + 14-day history
const healthPerTool = new Map();
for (const row of healthRows) {
  const id = row.tool_id;
  if (!healthPerTool.has(id)) healthPerTool.set(id, []);
  healthPerTool.get(id).push(row);
}

/**
 * Convert D1 integer timestamp (Unix seconds) to ISO string.
 * D1 returns integers for timestamp columns.
 * @param {number|null} ts
 * @returns {string|null}
 */
function toISO(ts) {
  if (ts == null) return null;
  return new Date(ts * 1000).toISOString();
}

// Assemble output
const tools = toolRows.map((t) => {
  const id = t.id;
  const allChecks = healthPerTool.get(id) || [];

  // Recent 5 for effective status computation
  const healthChecks = allChecks.slice(0, 5).map((c) => ({
    isOnline: c.is_online === 1,
    checkedAt: toISO(c.checked_at),
    httpStatus: c.http_status,
    responseTimeMs: c.response_time_ms,
  }));

  // Full 14-day history for timeline
  const healthHistory = allChecks.map((c) => ({
    isOnline: c.is_online === 1,
    checkedAt: toISO(c.checked_at),
  }));

  return {
    id,
    slug: t.slug,
    name: t.name,
    url: t.url,
    description: t.description,
    coreTask: t.core_task,
    status: t.status,
    submittedAt: toISO(t.submitted_at),
    approvedAt: toISO(t.approved_at),
    rejectionReason: t.rejection_reason,
    submitterEmail: t.submitter_email,
    archiveUrl: t.archive_url,
    isFeatured: t.is_featured === 1,
    featuredAt: toISO(t.featured_at),
    tags: tagMap.get(id) || [],
    healthChecks,
    healthHistory,
    badgeDisplayType: badgeMap.get(id) || null,
  };
});

const buildData = {
  generatedAt: new Date().toISOString(),
  tools,
};

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(buildData, null, 2));
console.log(`[build-data] Written ${tools.length} tools to ${OUTPUT_PATH}`);
