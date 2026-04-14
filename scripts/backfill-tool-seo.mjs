#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildToolSeoMeta } from '../src/lib/tool-seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

export function buildSeoUpdate(tool, force = false) {
  const generated = buildToolSeoMeta({
    name: tool.name,
    description: tool.description,
    coreTask: tool.coreTask,
    seoTitle: force ? null : tool.seoTitle,
    seoDescription: force ? null : tool.seoDescription,
    seoFocusKeyword: force ? null : tool.seoFocusKeyword,
    seoIntent: force ? null : tool.seoIntent,
    seoTaskPhrase: force ? null : tool.seoTaskPhrase,
  });

  return {
    seoTitle: force ? generated.title : tool.seoTitle || generated.title,
    seoDescription: force ? generated.description : tool.seoDescription || generated.description,
    seoFocusKeyword: force ? generated.focusKeyword : tool.seoFocusKeyword || generated.focusKeyword,
    seoIntent: force ? generated.intent : tool.seoIntent || generated.intent,
    seoTaskPhrase: force ? generated.taskPhrase : tool.seoTaskPhrase || generated.taskPhrase,
  };
}

async function main() {
  const dryRun = !process.argv.includes('--write');
  const force = process.argv.includes('--force');

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
  const whereClause = force
    ? `WHERE status = 'approved'`
    : `WHERE status = 'approved'
       AND (
         seo_title IS NULL OR seo_title = '' OR
         seo_description IS NULL OR seo_description = '' OR
         seo_focus_keyword IS NULL OR seo_focus_keyword = '' OR
         seo_intent IS NULL OR seo_intent = '' OR
         seo_task_phrase IS NULL OR seo_task_phrase = ''
       )`;

  const tools = await queryD1(d1Api, apiToken, `
    SELECT id, name, description, core_task, seo_title, seo_description, seo_focus_keyword, seo_intent, seo_task_phrase
    FROM tools
    ${whereClause}
    ORDER BY id
  `);

  console.log(`[seo-backfill] Found ${tools.length} tool(s) to process`);

  let updated = 0;
  for (const tool of tools) {
    const next = buildSeoUpdate({
      name: tool.name,
      description: tool.description,
      coreTask: tool.core_task,
      seoTitle: tool.seo_title,
      seoDescription: tool.seo_description,
      seoFocusKeyword: tool.seo_focus_keyword,
      seoIntent: tool.seo_intent,
      seoTaskPhrase: tool.seo_task_phrase,
    }, force);

    if (dryRun) {
      console.log(`[seo-backfill] Dry run #${tool.id}: ${tool.name}`);
      continue;
    }

    await queryD1(d1Api, apiToken, `
      UPDATE tools
      SET seo_title = ?, seo_description = ?, seo_focus_keyword = ?, seo_intent = ?, seo_task_phrase = ?
      WHERE id = ?
    `, [
      next.seoTitle,
      next.seoDescription,
      next.seoFocusKeyword,
      next.seoIntent,
      next.seoTaskPhrase,
      tool.id,
    ]);
    updated++;
    console.log(`[seo-backfill] Updated #${tool.id}: ${tool.name}`);
  }

  console.log(`[seo-backfill] ${dryRun ? 'Dry run complete' : `Updated ${updated} tool(s)`}`);
}

const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/backfill-tool-seo.mjs'));

if (isMainModule) {
  main().catch((err) => {
    console.error(`[seo-backfill] Fatal error: ${err.message}`);
    process.exit(1);
  });
}
