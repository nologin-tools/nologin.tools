import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

test('production build query preserves substantive modification dates in the generated snapshot', () => {
  const root = mkdtempSync(join(tmpdir(), 'nologin-build-data-'));
  const dbPath = join(root, 'fixture.sqlite');
  const db = new DatabaseSync(dbPath);
  try {
    for (const file of readdirSync(new URL('../../migrations/', import.meta.url)).filter(f => f.endsWith('.sql')).sort()) {
      db.exec(readFileSync(new URL(`../../migrations/${file}`, import.meta.url), 'utf8'));
    }
    db.exec("INSERT INTO tools (slug,name,url,core_task,status,submitted_at,approved_at,content_updated_at) VALUES ('fixture-com','Fixture','https://fixture.com','Test task','approved',1,2,1793013822)");
    mkdirSync(join(root, 'scripts'));
    copyFileSync(new URL('../fetch-build-data.mjs', import.meta.url), join(root, 'scripts/fetch-build-data.mjs'));
    writeFileSync(join(root, 'wrangler.jsonc'), JSON.stringify({ d1_databases: [{ database_id: 'fixture' }] }));
    // Execute the actual build script against SQLite-backed D1 responses. This
    // catches omitted SELECT columns as well as serialization regressions.
    execFileSync(process.execPath, ['--input-type=module', '-e', `
      import { DatabaseSync } from 'node:sqlite';
      const db = new DatabaseSync(${JSON.stringify(dbPath)});
      globalThis.fetch = async (_url, options) => {
        const { sql, params } = JSON.parse(options.body);
        const results = db.prepare(sql).all(...params);
        return { ok: true, json: async () => ({ success: true, result: [{ results }] }) };
      };
      await import(${JSON.stringify(pathToFileURL(join(root, 'scripts/fetch-build-data.mjs')).href)});
      db.close();
    `], { env: { ...process.env, CLOUDFLARE_API_TOKEN: 'fixture', CLOUDFLARE_ACCOUNT_ID: 'fixture' }, stdio: 'pipe' });
    const snapshot = JSON.parse(readFileSync(join(root, 'src/data/build-data.json'), 'utf8'));
    assert.equal(snapshot.tools.length, 1);
    assert.equal(snapshot.tools[0].contentUpdatedAt, '2026-10-26T11:23:42.000Z');
    assert.equal(snapshot.tools[0].approvedAt, '1970-01-01T00:00:02.000Z');
  } finally {
    db.close();
    rmSync(root, { recursive: true, force: true });
  }
});
