#!/usr/bin/env node
// @ts-check
/**
 * Prepare an SEO fill Issue for tools missing SEO metadata.
 *
 * Queries D1 for approved tools with any NULL/empty SEO field,
 * generates a GitHub Issue body with tool details and SEO writing standards.
 *
 * Usage:
 *   node scripts/prepare-seo-fill.mjs
 *
 * Required env vars:
 *   CLOUDFLARE_API_TOKEN
 *   CLOUDFLARE_ACCOUNT_ID
 *
 * Outputs:
 *   - GitHub Actions output: title, count
 *   - File: /tmp/seo-issue-body.md
 */

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BATCH_SIZE = 15;

// ---------------------------------------------------------------------------
// D1 helpers (shared pattern with other scripts)
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
// Issue body generation
// ---------------------------------------------------------------------------

const SEO_STANDARDS = `
## SEO Writing Standards

For each tool, generate a JSON file \`.github/auto-seo/{slug}.json\` with these fields:

| Field | Constraint | Guidance |
|-------|-----------|----------|
| \`seoTitle\` | **≤ 44 chars** | The site appends " \\| nologin.tools" (16 chars), so Google's ~60-char display = 44 for your title. Format: "{Name} — {core value}" or "{Name}: Free Online {type}". Do NOT append "No Login Required". |
| \`seoDescription\` | **120-155 chars** | Unique, compelling copy. Must naturally mention no-login/no-signup. Do NOT start with "{Name} helps you...". Include a clear benefit or CTA. |
| \`seoFocusKeyword\` | **2-5 word phrase** | A realistic search query users would type, e.g. "free online whiteboard no signup". |
| \`seoIntent\` | **task / alternative / review** | \`task\` = user wants to do something; \`alternative\` = user is looking for a free/no-login alternative to a paid/login tool (e.g. Photopea as Photoshop alternative); \`review\` = user is evaluating the tool. |
| \`seoTaskPhrase\` | **≤ 60 chars, must contain no-login reference** | A concise action phrase like "draw diagrams online without signup". Must include one of: "without login", "without signup", "no login", "no signup", "no account", "without registration", "no registration". |

### JSON format per tool

\`\`\`json
{
  "seoTitle": "Excalidraw — Free Online Whiteboard",
  "seoDescription": "Draw hand-sketched diagrams and wireframes right in your browser. Real-time collaboration, PNG/SVG export — no signup needed.",
  "seoFocusKeyword": "excalidraw online whiteboard free",
  "seoIntent": "task",
  "seoTaskPhrase": "draw diagrams collaboratively without signup"
}
\`\`\`

### Quality rules
- Every \`seoTitle\` must be **unique** across all tools
- Every \`seoDescription\` must be **unique** — no two tools share the same description
- Do NOT use truncated text ending with "..."
- Do NOT repeat "without login" twice in any field
- \`seoDescription\` must NOT start with "{ToolName} helps you" or "{ToolName} is a"
- Write in English
`;

/**
 * Build the Issue body listing tools that need SEO.
 * @param {any[]} tools - Tool rows from D1
 * @param {Map<number, string[]>} tagMap - tool_id → tag strings
 * @returns {string}
 */
export function buildIssueBody(tools, tagMap) {
  const lines = [
    `# SEO Fill: ${tools.length} tool(s) need SEO metadata`,
    '',
    'Generate SEO metadata for each tool listed below. Create one JSON file per tool at `.github/auto-seo/{slug}.json`.',
    '',
    SEO_STANDARDS,
    '---',
    '',
    '## Tools',
    '',
  ];

  for (const tool of tools) {
    const tags = tagMap.get(tool.id) || [];
    lines.push(`### ${tool.name} (\`${tool.slug}\`)`);
    lines.push(`- **URL**: ${tool.url}`);
    lines.push(`- **Description**: ${tool.description}`);
    lines.push(`- **Core Task**: ${tool.core_task}`);
    if (tags.length > 0) {
      lines.push(`- **Tags**: ${tags.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { d1Api, apiToken } = getD1Config();

  // Find approved tools with any NULL/empty SEO field
  const tools = await queryD1(d1Api, apiToken, `
    SELECT id, name, slug, url, description, core_task
    FROM tools
    WHERE status = 'approved'
      AND (
        seo_title IS NULL OR seo_title = '' OR
        seo_description IS NULL OR seo_description = '' OR
        seo_focus_keyword IS NULL OR seo_focus_keyword = '' OR
        seo_intent IS NULL OR seo_intent = '' OR
        seo_task_phrase IS NULL OR seo_task_phrase = ''
      )
    ORDER BY id
    LIMIT ?
  `, [BATCH_SIZE]);

  if (tools.length === 0) {
    console.log('[seo-fill] All tools have SEO metadata — nothing to do');
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      appendFileSync(outputFile, 'count=0\n');
    }
    return;
  }

  console.log(`[seo-fill] Found ${tools.length} tool(s) needing SEO`);

  // Fetch tags for these tools
  const toolIds = tools.map((t) => t.id);
  const placeholders = toolIds.map(() => '?').join(',');
  const tags = await queryD1(d1Api, apiToken,
    `SELECT tool_id, tag_key, tag_value FROM tags WHERE tool_id IN (${placeholders})`,
    toolIds
  );

  /** @type {Map<number, string[]>} */
  const tagMap = new Map();
  for (const tag of tags) {
    if (!tagMap.has(tag.tool_id)) tagMap.set(tag.tool_id, []);
    tagMap.get(tag.tool_id).push(`${tag.tag_key}:${tag.tag_value}`);
  }

  const body = buildIssueBody(tools, tagMap);
  const title = `SEO Fill: ${tools.length} tool(s) need metadata`;

  writeFileSync('/tmp/seo-issue-body.md', body, 'utf-8');
  console.log(`[seo-fill] Issue body written to /tmp/seo-issue-body.md`);

  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `title=${title}\n`);
    appendFileSync(outputFile, `count=${tools.length}\n`);
  }
}

const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/prepare-seo-fill.mjs'));

if (isMainModule) {
  main().catch((err) => {
    console.error(`[seo-fill] Fatal error: ${err.message}`);
    process.exit(1);
  });
}
