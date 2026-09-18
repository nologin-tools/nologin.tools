#!/usr/bin/env node
/**
 * scripts/lab/benchmark.mjs
 * 
 * Unified CADES Benchmark Bridge for NoLogin Lab.
 * Supports single-tool evaluation and daily rolling benchmark runs.
 * 
 * Usage:
 *   node scripts/lab/benchmark.mjs --url "https://squoosh.app" --slug squoosh-app --sync
 *   node scripts/lab/benchmark.mjs --rolling 15 --sync
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const DOGFOOD_SCRIPT = resolve(ROOT, 'scripts/inspect-tool-dogfood.mjs');
const BUILD_DATA_PATH = resolve(ROOT, 'src/data/build-data.json');

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
NoLogin Lab Benchmark Bridge (CADES Unified)

Usage:
  node scripts/lab/benchmark.mjs [options]

Options:
  --url <URL>        Benchmark a single tool by live URL
  --slug <slug>      Benchmark an existing tool by slug
  --rolling [num]    Daily rolling maintenance: benchmarks [num] tools via CADES (default: 15)
  --sync             Synchronize scores, lab notes & testedAt to tool-editorial.json
  --timeout <sec>    Timeout in seconds for page evaluation
  --verbose          Print detailed chromium and evaluation trace
  --help             Show this help message
`);
}

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(0);
}

const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
};

const hasFlag = (flag) => args.includes(flag);

const urlArg = getArg('--url');
const slugArg = getArg('--slug');
const categoryArg = getArg('--category');
const hasRolling = hasFlag('--rolling');
const rollingArg = getArg('--rolling');
const shouldSync = hasFlag('--sync');
const isVerbose = hasFlag('--verbose');
const timeoutArg = getArg('--timeout');

let targetUrl = urlArg;
let targetSlug = slugArg;

if (!targetUrl && targetSlug && existsSync(BUILD_DATA_PATH)) {
  try {
    const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
    const tool = buildData.tools.find(t => t.slug === targetSlug);
    if (tool) {
      targetUrl = tool.url;
    }
  } catch {}
}

const childArgs = [DOGFOOD_SCRIPT];

if (hasRolling) {
  childArgs.push('--rolling');
  if (rollingArg && !rollingArg.startsWith('--') && !isNaN(parseInt(rollingArg, 10))) {
    childArgs.push(rollingArg);
  } else {
    childArgs.push('15');
  }
} else if (targetUrl) {
  childArgs.push(targetUrl);
  if (targetSlug) {
    childArgs.push('--slug', targetSlug);
  }
} else if (categoryArg) {
  if (existsSync(BUILD_DATA_PATH)) {
    const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
    const catTools = buildData.tools.filter(t =>
      t.status === 'approved' &&
      t.tags.some(tag => tag.tagKey === 'category' && tag.tagValue.toLowerCase() === categoryArg.toLowerCase())
    ).slice(0, parseInt(getArg('--limit') || '3', 10));

    if (catTools.length > 0) {
      console.log(`[CADES Bridge] Benchmarking ${catTools.length} tools in category '${categoryArg}'...`);
      for (const t of catTools) {
        const subArgs = [DOGFOOD_SCRIPT, t.url, '--slug', t.slug];
        if (shouldSync) subArgs.push('--sync');
        if (isVerbose) subArgs.push('--verbose');
        if (timeoutArg) subArgs.push('--timeout', timeoutArg);
        const child = spawn(process.execPath, subArgs, { stdio: 'inherit' });
        await new Promise(r => child.on('close', r));
      }
      process.exit(0);
    }
  }
}

if (shouldSync) childArgs.push('--sync');
if (isVerbose) childArgs.push('--verbose');
if (timeoutArg) childArgs.push('--timeout', timeoutArg);

console.log(`[NoLogin Lab] Delegating to CADES Engine: ${childArgs.slice(1).join(' ')}`);

const child = spawn(process.execPath, childArgs, { stdio: 'inherit' });
child.on('close', (code) => {
  process.exit(code ?? 0);
});
