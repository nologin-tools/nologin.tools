// @ts-check
/**
 * scripts/ego-lock.mjs
 * 
 * Cross-process concurrency mutex and orphan space garbage collector for ego-browser operations.
 * Enforces Concurrency = 1 (Strict Serial Execution) across all test runs, subagents, and batch scripts.
 */

import { openSync, closeSync, unlinkSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export const LOCK_FILE_PATH = join(tmpdir(), 'ego-nologin-browser.lock');

/**
 * Check if a process with the given PID is currently alive on the host.
 * @param {number} pid 
 * @returns {boolean}
 */
function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Acquire the global cross-process ego-browser lock.
 * @param {Object} [options]
 * @param {number} [options.timeoutMs=60000] - Max time to wait for the lock
 * @param {number} [options.staleAgeMs=120000] - Lock age considered stale/crashed
 * @param {string} [options.label='ego-session'] - Description of the task holding the lock
 * @param {boolean} [options.verbose=false]
 * @returns {Promise<boolean>}
 */
export async function acquireEgoLock(options = {}) {
  const {
    timeoutMs = 600000,
    staleAgeMs = 1800000,
    label = 'ego-session',
    verbose = false
  } = options;

  const startTime = Date.now();
  let firstWait = true;

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Attempt atomic file creation (O_CREAT | O_EXCL)
      const fd = openSync(LOCK_FILE_PATH, 'wx');
      const payload = {
        pid: process.pid,
        label,
        createdAt: Date.now(),
        iso: new Date().toISOString()
      };
      writeFileSync(fd, JSON.stringify(payload, null, 2), 'utf-8');
      closeSync(fd);
      if (verbose) {
        console.log(`[ego-lock] Acquired lock for [${label}] (PID: ${process.pid})`);
      }
      return true;
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }

      // Lock file exists. Inspect for stale / crashed owner
      try {
        if (existsSync(LOCK_FILE_PATH)) {
          const content = readFileSync(LOCK_FILE_PATH, 'utf-8');
          const lockData = JSON.parse(content);
          const lockAge = Date.now() - (lockData.createdAt || 0);

          const ownerDead = lockData.pid && !isPidAlive(lockData.pid);
          const isStale = lockAge > staleAgeMs;

          if (ownerDead) {
            console.warn(`[ego-lock] Breaking stale lock from dead PID ${lockData.pid} (${lockData.label || 'unknown'}), age: ${(lockAge / 1000).toFixed(1)}s`);
            try { unlinkSync(LOCK_FILE_PATH); } catch {}
            continue; // Retry acquisition immediately
          }

          if (isStale) {
            console.warn(`[ego-lock] Breaking lock exceeding ${(staleAgeMs / 60000).toFixed(0)}m timeout from PID ${lockData.pid} (${lockData.label || 'unknown'}), age: ${(lockAge / 1000).toFixed(1)}s (owner alive: ${!ownerDead})`);
            try { unlinkSync(LOCK_FILE_PATH); } catch {}
            continue; // Retry acquisition immediately
          }

          if (firstWait && verbose) {
            console.log(`[ego-lock] Waiting for lock held by PID ${lockData.pid} [${lockData.label}] (elapsed: ${(lockAge / 1000).toFixed(1)}s)...`);
            firstWait = false;
          }
        }
      } catch (parseErr) {
        // Corrupted lock file, safely remove and retry
        try { unlinkSync(LOCK_FILE_PATH); } catch {}
        continue;
      }

      // Wait 300ms before retrying
      await new Promise(r => setTimeout(r, 300));
    }
  }

  throw new Error(`[ego-lock] Timeout waiting for lock after ${timeoutMs}ms. Another process may be running ego-browser.`);
}

/**
 * Release the global cross-process ego-browser lock.
 * @param {boolean} [force=false] - If true, release regardless of current PID match
 */
export function releaseEgoLock(force = false) {
  try {
    if (existsSync(LOCK_FILE_PATH)) {
      const content = readFileSync(LOCK_FILE_PATH, 'utf-8');
      const lockData = JSON.parse(content);
      if (force || lockData.pid === process.pid) {
        unlinkSync(LOCK_FILE_PATH);
      }
    }
  } catch (e) {
    // Ignore errors during release
  }
}

// Ensure lock is cleaned up on unexpected process exit
process.on('exit', () => releaseEgoLock(false));
process.on('SIGINT', () => { releaseEgoLock(false); process.exit(130); });
process.on('SIGTERM', () => { releaseEgoLock(false); process.exit(143); });

/**
 * Executes a function with exclusive access to ego-browser and automatic orphan space cleanup.
 * @template T
 * @param {() => Promise<T>} fn 
 * @param {Object} [options]
 * @param {number} [options.timeoutMs=60000]
 * @param {string} [options.label='ego-task']
 * @param {boolean} [options.preClean=true]
 * @param {boolean} [options.postClean=false]
 * @param {boolean} [options.verbose=false]
 * @returns {Promise<T>}
 */
export async function withEgoLock(fn, options = {}) {
  const {
    timeoutMs = 600000,
    label = 'ego-task',
    preClean = true,
    postClean = false,
    verbose = false
  } = options;

  await acquireEgoLock({ timeoutMs, label, verbose });
  try {
    if (preClean) {
      cleanOrphanTaskSpaces({ verbose });
    }
    return await fn();
  } finally {
    if (postClean) {
      cleanOrphanTaskSpaces({ verbose });
    }
    releaseEgoLock(false);
  }
}

/**
 * List all TaskSpaces currently existing in ego-browser.
 * @returns {Array<{ id: number, name: string, ownership: string, recentTabTitles?: string[] }>}
 */
export function listEgoSpaces() {
  const nodeScript = `
(async () => {
  try {
    const spaces = await listTaskSpaces();
    console.log(JSON.stringify({ ok: true, spaces }));
  } catch (err) {
    console.log(JSON.stringify({ ok: false, error: err.message }));
  }
})();
`;
  const res = spawnSync('ego-browser', ['nodejs'], {
    input: nodeScript,
    encoding: 'utf-8',
    timeout: 10000
  });

  if (res.error || res.status !== 0) {
    return [];
  }

  try {
    const lines = (res.stdout || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
    const jsonLine = lines.reverse().find(l => l.startsWith('{"ok":'));
    if (!jsonLine) return [];
    const parsed = JSON.parse(jsonLine);
    return parsed.ok ? (parsed.spaces || []) : [];
  } catch {
    return [];
  }
}

/**
 * Scans ego-browser and closes any orphan TaskSpaces matching prefix (e.g. 'nologin-').
 * @param {Object} [options]
 * @param {string} [options.prefix='nologin-']
 * @param {boolean} [options.verbose=false]
 * @returns {{ cleanedCount: number, cleaned: Array<{ id: number, name: string }> }}
 */
export function cleanOrphanTaskSpaces(options = {}) {
  const { prefix = 'nologin-', verbose = false } = options;

  const nodeScript = `
(async () => {
  try {
    const spaces = await listTaskSpaces();
    const targets = spaces.filter(s => s.name && s.name.startsWith(${JSON.stringify(prefix)}));
    const cleaned = [];
    for (const s of targets) {
      try {
        const t = await taskSpace(s.id);
        await t.finish({ keep: [] });
        cleaned.push({ id: s.id, name: s.name });
      } catch (e) {}
    }
    console.log(JSON.stringify({ ok: true, cleaned }));
  } catch (err) {
    console.log(JSON.stringify({ ok: false, error: err.message }));
  }
})();
`;

  try {
    const res = spawnSync('ego-browser', ['nodejs'], {
      input: nodeScript,
      encoding: 'utf-8',
      timeout: 15000
    });

    if (res.error || res.status !== 0) {
      if (verbose) console.warn('[ego-cleaner] Clean command exited with error:', res.stderr);
      return { cleanedCount: 0, cleaned: [] };
    }

    const lines = (res.stdout || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
    const jsonLine = lines.reverse().find(l => l.startsWith('{"ok":'));
    if (!jsonLine) return { cleanedCount: 0, cleaned: [] };
    const parsed = JSON.parse(jsonLine);

    if (parsed.ok && parsed.cleaned?.length > 0) {
      if (verbose) {
        console.log(`🧹 [ego-cleaner] Cleaned up ${parsed.cleaned.length} orphan TaskSpaces:`, parsed.cleaned.map(c => `${c.name} (#${c.id})`).join(', '));
      }
      return { cleanedCount: parsed.cleaned.length, cleaned: parsed.cleaned };
    }

    return { cleanedCount: 0, cleaned: [] };
  } catch (err) {
    if (verbose) console.warn('[ego-cleaner] Failed to scan/clean spaces:', err.message);
    return { cleanedCount: 0, cleaned: [] };
  }
}
