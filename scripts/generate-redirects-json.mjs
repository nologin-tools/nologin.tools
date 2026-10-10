#!/usr/bin/env node
// @ts-check
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REDIRECTS_FILE = resolve(ROOT, 'public/_redirects');
const JSON_FILE = resolve(ROOT, 'src/data/redirects.json');

export function generateRedirectsJson() {
  const content = readFileSync(REDIRECTS_FILE, 'utf-8');
  const redirects = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [from, to] = line.split(/\s+/);
    if (!from || !to || from.includes('*')) continue;

    redirects[from] = to;
    const cleanFrom = from === '/' ? '/' : from.replace(/\/+$/, '');
    redirects[cleanFrom] = to;
  }

  writeFileSync(JSON_FILE, JSON.stringify(redirects, null, 2) + '\n', 'utf-8');
  return Object.keys(redirects).length;
}

const isMain = process.argv[1] && process.argv[1].endsWith('generate-redirects-json.mjs');
if (isMain) {
  const count = generateRedirectsJson();
  console.log(`Generated src/data/redirects.json with ${count} static redirect rules.`);
}
