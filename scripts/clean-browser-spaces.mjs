#!/usr/bin/env node
// @ts-check
/**
 * scripts/clean-browser-spaces.mjs
 * 
 * Standalone CLI tool to monitor and clean up open TaskSpaces and tabs in ego-browser.
 * 
 * Usage:
 *   node scripts/clean-browser-spaces.mjs          # Clean all orphan 'nologin-*' spaces
 *   node scripts/clean-browser-spaces.mjs --status # View all spaces without closing
 *   node scripts/clean-browser-spaces.mjs --all    # Clean all agent-owned spaces
 *   node scripts/clean-browser-spaces.mjs --unlock # Clear any lingering lockfile
 */

import { listEgoSpaces, cleanOrphanTaskSpaces, releaseEgoLock, LOCK_FILE_PATH } from './ego-lock.mjs';
import { existsSync, readFileSync } from 'node:fs';

async function main() {
  const args = process.argv.slice(2);
  const isStatusOnly = args.includes('--status');
  const cleanAllAgent = args.includes('--all');
  const isUnlockOnly = args.includes('--unlock');

  if (isUnlockOnly) {
    if (existsSync(LOCK_FILE_PATH)) {
      const content = readFileSync(LOCK_FILE_PATH, 'utf-8');
      releaseEgoLock(true);
      console.log(`🔓 Lockfile at ${LOCK_FILE_PATH} successfully removed: ${content.trim()}`);
    } else {
      console.log(`ℹ️ No lockfile currently exists at ${LOCK_FILE_PATH}`);
    }
    return;
  }

  console.log(`\n======================================================`);
  console.log(`🔍 Ego Browser TaskSpace & Resource Status`);
  console.log(`======================================================`);

  if (existsSync(LOCK_FILE_PATH)) {
    try {
      const lockData = JSON.parse(readFileSync(LOCK_FILE_PATH, 'utf-8'));
      const ageSec = ((Date.now() - (lockData.createdAt || 0)) / 1000).toFixed(1);
      console.log(`🔒 Active Lock: PID ${lockData.pid} [${lockData.label}] (${ageSec}s ago)`);
    } catch {
      console.log(`🔒 Active Lock: Corrupted lockfile detected`);
    }
  } else {
    console.log(`🔓 Lock Status: Free (No active evaluation lock)`);
  }

  const spaces = listEgoSpaces();
  console.log(`\n📊 Total Spaces: ${spaces.length}`);

  if (spaces.length === 0) {
    console.log(`✅ Clean: Zero TaskSpaces currently open in browser.\n`);
    return;
  }

  console.log(`\nActive Spaces:`);
  for (const s of spaces) {
    const tabsDesc = s.recentTabTitles?.length ? `Tabs: "${s.recentTabTitles.join('", "')}"` : 'Tabs: 1';
    console.log(`  • ID: ${s.id.toString().padEnd(4)} | Name: ${s.name.padEnd(35)} | Owner: ${s.ownership.padEnd(6)} | ${tabsDesc}`);
  }

  if (isStatusOnly) {
    console.log(`\nℹ️ Run without '--status' to automatically clean nologin-* spaces.\n`);
    return;
  }

  const prefix = cleanAllAgent ? '' : 'nologin-';
  console.log(`\n🧹 Sweeping spaces with prefix '${prefix || '<all agent>'}'...`);
  const result = cleanOrphanTaskSpaces({ prefix, verbose: true });

  if (result.cleanedCount > 0) {
    console.log(`\n🎉 Successfully closed ${result.cleanedCount} TaskSpace(s) and freed associated browser memory.`);
  } else {
    console.log(`\n✅ No orphan spaces matched the target criteria.`);
  }
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Error running cleaner:', err);
  process.exit(1);
});
