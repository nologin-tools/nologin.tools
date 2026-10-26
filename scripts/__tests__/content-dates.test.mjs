import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { latestContentDate, toolContentDate, withContentUpdatedAt, sameTags } from '../../src/lib/content-dates.mjs';

test('tool date follows substantive content, ignoring operational freshness and incomplete dates', () => {
  const tool = { approvedAt: '2026-01-10', contentUpdatedAt: '2026-02-12',
    githubFetchedAt: '2026-10-26', githubUpdatedAt: '2026-10-25', healthChecks: [{ checkedAt: '2026-10-26' }] };
  assert.equal(toolContentDate(tool, { testedAt: '2026-10' }), '2026-02-12T00:00:00.000Z');
  assert.equal(toolContentDate(tool, { contentUpdatedAt: '2026-09-12' }), '2026-09-12T00:00:00.000Z');
  assert.equal(toolContentDate(tool, null, { contentUpdatedAt: '2026-10-01' }), '2026-10-01T00:00:00.000Z');
  assert.equal(toolContentDate(tool, null, null, { updatedAt: '2026-10-20' }), '2026-10-20T00:00:00.000Z');
  assert.equal(latestContentDate(null, undefined, 'invalid', '2026-10'), undefined);
});

test('identical editorial and translation syncs retain dates; visible changes advance them', () => {
  const old = { description: 'Text', _hash: 'old', testedAt: '2026-09', contentUpdatedAt: '2026-09-01' };
  assert.equal(withContentUpdatedAt(old, { description: 'Text', _hash: 'new', testedAt: '2026-10' }, '2026-10-26').contentUpdatedAt, '2026-09-01');
  assert.equal(withContentUpdatedAt(old, { description: 'Corrected' }, '2026-10-26').contentUpdatedAt, '2026-10-26');
  assert.equal(withContentUpdatedAt({ description: 'Text' }, { description: 'Text' }).contentUpdatedAt, undefined);
  assert.equal(sameTags([{ tagKey: 'category', tagValue: 'AI' }, { tagKey: 'pricing', tagValue: 'Free' }],
    [{ key: 'pricing', value: 'Free' }, { key: 'category', value: 'AI' }]), true);
  assert.equal(sameTags([{ key: 'category', value: 'AI' }], [{ key: 'category', value: 'Design' }]), false);
});

test('D1 migration tracks real metadata edits but not no-op updates or health/repository refreshes', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const file of readdirSync(new URL('../../migrations/', import.meta.url)).filter(f => f.endsWith('.sql')).sort()) {
      db.exec(readFileSync(new URL(`../../migrations/${file}`, import.meta.url), 'utf8'));
    }
    db.exec("INSERT INTO tools (slug,name,url,core_task,submitted_at) VALUES ('test','Test','https://example.com','Test task',1)");
    const date = () => db.prepare("SELECT content_updated_at AS date FROM tools WHERE slug='test'").get().date;
    assert.equal(date(), null);
    db.exec("UPDATE tools SET description = 'New description' WHERE slug='test'");
    assert.ok(date() > 0);
    db.exec("UPDATE tools SET content_updated_at=123 WHERE slug='test'");
    db.exec("UPDATE tools SET description = 'New description', github_stars=5, github_fetched_at=999 WHERE slug='test'");
    db.exec("INSERT INTO health_checks (tool_id,checked_at,is_online) VALUES (1,999,1)");
    assert.equal(date(), 123);
    db.exec("UPDATE tools SET description = NULL WHERE slug='test'");
    assert.ok(date() > 123);
  } finally { db.close(); }
});
