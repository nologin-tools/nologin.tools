// @ts-check
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

const HEALTH_CHECK_HEADERS = {
  'User-Agent': 'NoLoginTools-HealthChecker/1.0',
};

const GONE_STATUS_CODES = new Set([404, 410]);
function isReachable(status) {
  return !GONE_STATUS_CODES.has(status);
}

async function checkHealth(url) {
  const start = Date.now();
  try {
    let response;
    try {
      const headController = new AbortController();
      const headTimeout = setTimeout(() => headController.abort(), 8000);
      response = await fetch(url, {
        method: 'HEAD',
        headers: HEALTH_CHECK_HEADERS,
        signal: headController.signal,
        redirect: 'follow',
      });
      clearTimeout(headTimeout);
    } catch {}

    if (!response || !response.ok) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 8000);
      response = await fetch(url, {
        method: 'GET',
        headers: HEALTH_CHECK_HEADERS,
        signal: getController.signal,
        redirect: 'follow',
      });
      clearTimeout(getTimeout);
    }

    const responseTimeMs = Date.now() - start;
    return {
      isOnline: isReachable(response.status),
      httpStatus: response.status,
      responseTimeMs,
    };
  } catch (err) {
    return {
      isOnline: false,
      httpStatus: null,
      responseTimeMs: null,
    };
  }
}

async function main() {
  const limit = parseInt(process.argv[2] || '30', 10);
  console.log(`[health-patrol] Querying ${limit} approved tools with oldest or missing health checks...`);

  const raw = execSync(
    `npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT t.id, t.slug, t.url, max(hc.checked_at) as last_check FROM tools t LEFT JOIN health_checks hc ON t.id = hc.tool_id WHERE t.status = 'approved' GROUP BY t.id ORDER BY last_check ASC NULLS FIRST LIMIT ${limit};"`,
    { cwd: ROOT_DIR, encoding: 'utf-8' }
  );
  const tools = JSON.parse(raw)[0].results;
  console.log(`[health-patrol] Found ${tools.length} tools to check.`);

  const results = [];
  for (let i = 0; i < tools.length; i++) {
    const t = tools[i];
    process.stdout.write(`[${i + 1}/${tools.length}] Checking ${t.slug} (${t.url})... `);
    const res = await checkHealth(t.url);
    console.log(res.isOnline ? `✅ Online (HTTP ${res.httpStatus}, ${res.responseTimeMs}ms)` : `❌ Offline (HTTP ${res.httpStatus || 'error'})`);
    results.push({ ...t, ...res });
  }

  // Generate D1 insert statements
  const sql = results.map(r => {
    return `INSERT INTO health_checks (tool_id, is_online, http_status, response_time_ms, checked_at) VALUES (${r.id}, ${r.isOnline ? 1 : 0}, ${r.httpStatus !== null ? r.httpStatus : 'NULL'}, ${r.responseTimeMs !== null ? r.responseTimeMs : 'NULL'}, unixepoch());`;
  });

  const sqlPath = resolve(ROOT_DIR, 'scripts/.patrol-health.sql');
  writeFileSync(sqlPath, sql.join('\n'), 'utf-8');

  console.log(`\n[health-patrol] Committing ${sql.length} health check records to D1...`);
  execSync(`npx wrangler d1 execute nologin-tools-db --remote --file=${sqlPath} --yes`, {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });

  const onlineCount = results.filter(r => r.isOnline).length;
  const offlineCount = results.filter(r => !r.isOnline).length;

  console.log('\n======================================================');
  console.log(`📊 Health Patrol Summary: ${results.length} checks recorded`);
  console.log(`   - Online:  ${onlineCount}`);
  console.log(`   - Offline: ${offlineCount}`);
  console.log('======================================================');
}

main().catch(console.error);
