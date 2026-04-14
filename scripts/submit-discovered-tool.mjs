// @ts-check
/**
 * Submit a discovered tool to Cloudflare D1 via REST API.
 *
 * Usage:
 *   node scripts/submit-discovered-tool.mjs --file .github/auto-tools/example-com.json
 *
 * Required env vars:
 *   CLOUDFLARE_API_TOKEN
 *   CLOUDFLARE_ACCOUNT_ID
 *
 * The tool is inserted as status='approved' with approved_at=now.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateToolData } from './validate-tool-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// urlToSlug (exact mirror of src/lib/utils.ts:1-8)
// ---------------------------------------------------------------------------

/**
 * @param {string} url
 * @returns {string}
 */
export function urlToSlug(url) {
  const parsed = new URL(url);
  const raw = (parsed.hostname + parsed.pathname).replace(/\/+$/, '');
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// D1 REST API helpers (from fetch-build-data.mjs)
// ---------------------------------------------------------------------------

/**
 * Strip JSONC comments while preserving strings.
 * @param {string} str
 * @returns {string}
 */
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

/**
 * @param {string} d1Api
 * @param {string} apiToken
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any[]>}
 */
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
    const text = await res.text();
    throw new Error(`D1 API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
  }

  return json.result?.[0]?.results ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Submit tool data to D1.
 * @param {string} filePath
 * @param {{ apiToken: string, accountId: string, databaseId: string }} config
 * @returns {Promise<{ slug: string, toolId: number }>}
 */
export async function submitTool(filePath, config) {
  const content = readFileSync(resolve(filePath), 'utf-8');
  const data = JSON.parse(content);

  // Validate
  const validation = validateToolData(data);
  if (!validation.valid) {
    throw new Error(`Validation failed:\n${validation.errors.map((e) => `  - ${e}`).join('\n')}`);
  }

  const { apiToken, accountId, databaseId } = config;
  const d1Api = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const slug = urlToSlug(data.url);
  const now = Math.floor(Date.now() / 1000);

  // Check for duplicate
  const existing = await queryD1(d1Api, apiToken, 'SELECT id FROM tools WHERE slug = ?', [slug]);
  if (existing.length > 0) {
    console.log(`[submit-tool] Tool with slug "${slug}" already exists (id: ${existing[0].id}), skipping.`);
    return { slug, toolId: existing[0].id };
  }

  // INSERT tool
  await queryD1(d1Api, apiToken, `
    INSERT INTO tools (
      slug, name, url, description, core_task,
      seo_title, seo_description, seo_focus_keyword, seo_intent, seo_task_phrase,
      no_login_pledge, status, submitted_at, approved_at, repo_url, twitter_url, github_url, discord_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'approved', ?, ?, ?, ?, ?, ?)
  `, [
    slug,
    data.name,
    data.url,
    data.description,
    data.coreTask,
    data.seoTitle,
    data.seoDescription,
    data.seoFocusKeyword,
    data.seoIntent,
    data.seoTaskPhrase,
    now,
    now,
    data.repoUrl || null,
    data.twitterUrl || null,
    data.githubUrl || null,
    data.discordUrl || null,
  ]);

  // Get the new tool ID
  const newTool = await queryD1(d1Api, apiToken, 'SELECT id FROM tools WHERE slug = ?', [slug]);
  if (newTool.length === 0) {
    throw new Error('Failed to retrieve inserted tool ID');
  }
  const toolId = newTool[0].id;
  console.log(`[submit-tool] Inserted tool "${data.name}" (id: ${toolId}, slug: ${slug})`);

  // INSERT tags
  const tagsToInsert = [...data.tags];

  // Auto-add source:Open Source if repoUrl is set
  if (data.repoUrl) {
    const hasSource = tagsToInsert.some((t) => t.key === 'source');
    if (!hasSource) {
      tagsToInsert.push({ key: 'source', value: 'Open Source' });
    }
  }

  if (tagsToInsert.length > 0) {
    const placeholders = tagsToInsert.map(() => '(?, ?, ?)').join(', ');
    const params = tagsToInsert.flatMap((t) => [toolId, t.key, t.value]);
    await queryD1(d1Api, apiToken,
      `INSERT INTO tags (tool_id, tag_key, tag_value) VALUES ${placeholders}`,
      params
    );
  }
  console.log(`[submit-tool] Inserted ${tagsToInsert.length} tag(s)`);

  // INSERT initial health check
  await queryD1(d1Api, apiToken,
    'INSERT INTO health_checks (tool_id, checked_at, is_online, http_status, response_time_ms) VALUES (?, ?, 1, 200, 0)',
    [toolId, now]
  );
  console.log(`[submit-tool] Inserted initial health check`);

  return { slug, toolId };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/submit-discovered-tool.mjs'));

if (isMainModule) {
  const fileIdx = process.argv.indexOf('--file');
  const filePath = fileIdx !== -1 ? process.argv[fileIdx + 1] : process.argv[2];

  if (!filePath) {
    console.error('Usage: node scripts/submit-discovered-tool.mjs --file <path-to-tool.json>');
    process.exit(1);
  }

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    console.error('[submit-tool] Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID');
    process.exit(1);
  }

  // Read database_id from wrangler.jsonc
  const wranglerPath = resolve(__dirname, '../wrangler.jsonc');
  const wranglerContent = readFileSync(wranglerPath, 'utf-8');
  const wranglerJson = JSON.parse(
    stripJsonComments(wranglerContent).replace(/,(\s*[}\]])/g, '$1')
  );
  const databaseId = wranglerJson.d1_databases?.[0]?.database_id;
  if (!databaseId) {
    console.error('[submit-tool] Could not find database_id in wrangler.jsonc');
    process.exit(1);
  }

  submitTool(filePath, { apiToken, accountId, databaseId })
    .then(({ slug, toolId }) => {
      console.log(`[submit-tool] Done: slug=${slug}, toolId=${toolId}`);
    })
    .catch((err) => {
      console.error(`[submit-tool] Fatal error: ${err.message}`);
      process.exit(1);
    });
}
