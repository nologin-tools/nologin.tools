// @ts-check
/**
 * Minimal local environment loader for operations scripts.
 *
 * Resolution order (first wins, existing process.env is never overwritten):
 *   1. process.env (CI secrets, shell exports)
 *   2. .env.local   (gitignored, operator credentials)
 *   3. .dev.vars    (gitignored, wrangler local vars)
 *   4. .env         (gitignored)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = resolve(__dirname, '..', '..');

const ENV_FILES = ['.env.local', '.dev.vars', '.env'];

/**
 * Parse a dotenv-style file body.
 * @param {string} content
 * @returns {Record<string, string>}
 */
export function parseEnvFile(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }
    out[match[1]] = value;
  }
  return out;
}

let loaded = false;

/** Load env files once into process.env without overriding existing values. */
export function loadEnv() {
  if (loaded) return;
  loaded = true;
  for (const file of ENV_FILES) {
    const path = resolve(ROOT_DIR, file);
    if (!existsSync(path)) continue;
    const vars = parseEnvFile(readFileSync(path, 'utf-8'));
    for (const [key, value] of Object.entries(vars)) {
      if (process.env[key] === undefined || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  }
}

/**
 * Read a required variable or exit with an actionable message.
 * @param {string} name
 * @returns {string}
 */
export function requireEnv(name) {
  loadEnv();
  const value = process.env[name];
  if (!value) {
    console.error(
      `❌ Missing ${name}. Add it to .env.local (gitignored) or export it in the shell. ` +
        'Operations scripts must not fall back to direct SQL writes.'
    );
    process.exit(2);
  }
  return value;
}
