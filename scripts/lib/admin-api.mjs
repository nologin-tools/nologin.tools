// @ts-check
/**
 * Canonical write path for operations scripts and agents.
 *
 * Every mutation of `tools` status/metadata goes through the deployed review/admin APIs,
 * so validation, atomic batching, and side effects stay in one place.
 * There is intentionally no SQL fallback.
 *
 * CLI:
 *   node scripts/lib/admin-api.mjs reject <toolId> "<reason>"
 *   node scripts/lib/admin-api.mjs approve-evaluated <payload.json>
 *   node scripts/lib/admin-api.mjs health-check <toolId>
 *   node scripts/lib/admin-api.mjs ping
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireEnv } from './env.mjs';

const USER_AGENT = 'NoLoginTools-Operations/1.0';

function baseUrl() {
  loadEnv();
  return (process.env.NOLOGIN_API_BASE || 'https://nologin.tools').replace(/\/+$/, '');
}

/**
 * POST JSON to an admin endpoint with the admin secret injected.
 * @param {string} path
 * @param {Record<string, unknown>} body
 * @returns {Promise<any>}
 */
export async function adminPost(path, body) {
  const secret = requireEnv('ADMIN_SECRET');
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
    body: JSON.stringify({ secret, ...body }),
  });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`${path} returned non-JSON (HTTP ${res.status})`);
  }
  if (!res.ok || !json?.ok) {
    const err = new Error(`${path} failed (HTTP ${res.status}): ${json?.error || 'unknown error'}`);
    // @ts-ignore
    err.details = json?.details;
    throw err;
  }
  return json.data;
}

/**
 * @param {number} toolId
 * @param {string} reason specific, evidence-backed reason
 */
export function rejectTool(toolId, reason) {
  if (!Number.isInteger(toolId)) throw new Error('toolId must be an integer');
  if (!reason || reason.trim().length < 8) throw new Error('A specific rejection reason is required');
  return adminPost('/api/review', { action: 'reject', toolId, reason: reason.trim() });
}

/**
 * @param {{ toolId: number, metadata: Record<string, unknown>, tags: {key: string, value: string}[] }} payload
 */
export function approveEvaluated(payload) {
  return adminPost('/api/review', { action: 'approve_evaluated', ...payload });
}

/** @param {number} editId */
export function approveEdit(editId) {
  return adminPost('/api/review', { action: 'approve_edit', editId });
}

/** @param {number} editId @param {string} [reason] */
export function rejectEdit(editId, reason) {
  return adminPost('/api/review', { action: 'reject_edit', editId, reason });
}

/** @param {number} toolId */
export function runHealthCheck(toolId) {
  return adminPost('/api/admin/health-check', { toolId });
}

/** @param {Record<string, unknown>} fields must include toolId */
export function updateTool(fields) {
  return adminPost('/api/admin/tool-update', fields);
}

/** Verify credentials without mutating anything. */
export function ping() {
  return adminPost('/api/admin/export-history', {});
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, ...args] = process.argv.slice(2);
  const run = async () => {
    switch (cmd) {
      case 'reject':
        return rejectTool(Number(args[0]), args.slice(1).join(' '));
      case 'approve-evaluated':
        return approveEvaluated(JSON.parse(readFileSync(args[0], 'utf-8')));
      case 'approve-edit':
        return approveEdit(Number(args[0]));
      case 'reject-edit':
        return rejectEdit(Number(args[0]), args.slice(1).join(' '));
      case 'health-check':
        return runHealthCheck(Number(args[0]));
      case 'ping':
        await ping();
        return { ok: true, base: baseUrl() };
      default:
        console.error('Usage: admin-api.mjs <reject|approve-evaluated|approve-edit|reject-edit|health-check|ping> ...');
        process.exit(1);
    }
  };
  run()
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((err) => {
      console.error(`❌ ${err.message}`);
      if (err.details) console.error(JSON.stringify(err.details, null, 2));
      process.exit(1);
    });
}
