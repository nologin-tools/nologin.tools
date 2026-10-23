// @ts-check
/**
 * Shared Cloudflare D1 client for operations scripts.
 *
 * - Uses the D1 REST API when CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID are present (CI).
 * - Falls back to `wrangler d1 execute --remote` locally.
 *
 * Writes to the `tools` table must go through the review/admin APIs (see admin-api.mjs).
 * This client is intended for read queries and append-only observation tables
 * (e.g. `health_checks`).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv, ROOT_DIR } from './env.mjs';

const DB_NAME = 'nologin-tools-db';

function readDatabaseId() {
  const raw = readFileSync(resolve(ROOT_DIR, 'wrangler.jsonc'), 'utf-8');
  const match = raw.match(/"database_id"\s*:\s*"([^"]+)"/);
  if (!match) throw new Error('database_id not found in wrangler.jsonc');
  return match[1];
}

/**
 * Inline positional params for wrangler CLI execution.
 * @param {string} sql
 * @param {unknown[]} params
 */
export function inlineParams(sql, params) {
  let i = 0;
  return sql.replace(/\?/g, () => {
    if (i >= params.length) throw new Error('Not enough SQL params');
    const p = params[i++];
    if (p === null || p === undefined) return 'NULL';
    if (typeof p === 'number') return String(p);
    if (typeof p === 'boolean') return p ? '1' : '0';
    return `'${String(p).replace(/'/g, "''")}'`;
  });
}

/**
 * Execute one SQL statement and return result rows.
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<any[]>}
 */
export async function queryD1(sql, params = []) {
  loadEnv();
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (token && accountId) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${readDatabaseId()}/query`;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, params }),
      });
      if (res.ok) {
        const json = await res.json();
        if (!json.success) throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
        return json.result?.[0]?.results ?? [];
      }
      if (attempt === 3 || res.status < 500) {
        throw new Error(`D1 API error (${res.status}): ${await res.text()}`);
      }
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }

  const command = inlineParams(sql, params).replace(/\s*\n\s*/g, ' ').trim();
  const bin = resolve(ROOT_DIR, 'node_modules/.bin/wrangler');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = execFileSync(
        bin,
        ['d1', 'execute', DB_NAME, '--remote', '--json', '--command', command],
        { cwd: ROOT_DIR, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, env: { ...process.env, CI: '1' } }
      );
      return JSON.parse(out)[0]?.results ?? [];
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return [];
}
