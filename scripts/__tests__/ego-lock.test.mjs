import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, unlinkSync, writeFileSync, readFileSync } from 'node:fs';
import {
  LOCK_FILE_PATH,
  acquireEgoLock,
  releaseEgoLock,
  withEgoLock,
  listEgoSpaces,
  cleanOrphanTaskSpaces
} from '../ego-lock.mjs';

describe('ego-lock: Cross-Process Concurrency & TaskSpace GC', () => {
  beforeEach(() => {
    try { unlinkSync(LOCK_FILE_PATH); } catch {}
  });

  afterEach(() => {
    try { unlinkSync(LOCK_FILE_PATH); } catch {}
  });

  it('acquires and releases lock cleanly', async () => {
    assert.equal(existsSync(LOCK_FILE_PATH), false);
    
    const acquired = await acquireEgoLock({ label: 'test-acquire', timeoutMs: 2000 });
    assert.equal(acquired, true);
    assert.equal(existsSync(LOCK_FILE_PATH), true);

    const content = JSON.parse(readFileSync(LOCK_FILE_PATH, 'utf-8'));
    assert.equal(content.pid, process.pid);
    assert.equal(content.label, 'test-acquire');

    releaseEgoLock(false);
    assert.equal(existsSync(LOCK_FILE_PATH), false);
  });

  it('recovers from dead PID lock automatically', async () => {
    // Write a lock file with a guaranteed dead PID (e.g. 99999999)
    const deadLock = {
      pid: 99999999,
      label: 'dead-process-task',
      createdAt: Date.now() - 5000
    };
    writeFileSync(LOCK_FILE_PATH, JSON.stringify(deadLock), 'utf-8');
    assert.equal(existsSync(LOCK_FILE_PATH), true);

    // Should detect owner is dead, break lock, and acquire for current process
    const acquired = await acquireEgoLock({ label: 'recovered-task', timeoutMs: 2000 });
    assert.equal(acquired, true);

    const content = JSON.parse(readFileSync(LOCK_FILE_PATH, 'utf-8'));
    assert.equal(content.pid, process.pid);
    assert.equal(content.label, 'recovered-task');

    releaseEgoLock(false);
  });

  it('recovers from stale lock age automatically', async () => {
    // Write a lock file with old timestamp
    const staleLock = {
      pid: process.pid,
      label: 'stale-age-task',
      createdAt: Date.now() - 10000
    };
    writeFileSync(LOCK_FILE_PATH, JSON.stringify(staleLock), 'utf-8');

    // Acquire with staleAgeMs = 5000
    const acquired = await acquireEgoLock({ label: 'fresh-task', timeoutMs: 2000, staleAgeMs: 5000 });
    assert.equal(acquired, true);

    const content = JSON.parse(readFileSync(LOCK_FILE_PATH, 'utf-8'));
    assert.equal(content.label, 'fresh-task');

    releaseEgoLock(false);
  });

  it('withEgoLock wraps asynchronous execution and guarantees release', async () => {
    let executed = false;
    await withEgoLock(async () => {
      assert.equal(existsSync(LOCK_FILE_PATH), true);
      executed = true;
    }, { preClean: false, postClean: false });

    assert.equal(executed, true);
    assert.equal(existsSync(LOCK_FILE_PATH), false);
  });

  it('listEgoSpaces returns an array of spaces', () => {
    const spaces = listEgoSpaces();
    assert.ok(Array.isArray(spaces));
  });

  it('cleanOrphanTaskSpaces executes safely without throwing', () => {
    const res = cleanOrphanTaskSpaces({ prefix: 'non-existent-prefix-' });
    assert.equal(typeof res.cleanedCount, 'number');
    assert.ok(Array.isArray(res.cleaned));
  });
});
