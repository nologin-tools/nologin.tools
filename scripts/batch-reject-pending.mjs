// @ts-check
/**
 * Batch reject non-compliant pending tools from Cloudflare D1.
 *
 * Usage:
 *   node scripts/batch-reject-pending.mjs --dry-run
 *   node scripts/batch-reject-pending.mjs --execute
 *   node scripts/batch-reject-pending.mjs --execute --tier1-only
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
const tier1Only = process.argv.includes('--tier1-only');

console.log(`[batch-reject] Mode: ${isDryRun ? 'DRY-RUN (no database changes)' : 'EXECUTE'}`);
console.log(`[batch-reject] Target: ${tier1Only ? 'Tier 1 Only' : 'Tier 1 + Tier 2'}`);

// 1. Fetch current pending tools & health checks
console.log('[batch-reject] Fetching pending tools from remote D1...');
const toolsOutput = execSync(
  `npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT id, slug, name, url, description, core_task, submitter_ip_hash, submitter_email, repo_url, datetime(submitted_at, 'unixepoch') as submitted_at FROM tools WHERE status = 'pending' ORDER BY id ASC;"`,
  { cwd: ROOT_DIR, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
);
const tools = JSON.parse(toolsOutput)[0].results;
console.log(`[batch-reject] Total pending tools: ${tools.length}`);

console.log('[batch-reject] Fetching health checks...');
const checksOutput = execSync(
  `npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT tool_id, is_online, http_status FROM health_checks WHERE tool_id IN (SELECT id FROM tools WHERE status = 'pending');"`,
  { cwd: ROOT_DIR, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
);
const checks = JSON.parse(checksOutput)[0].results;
const healthMap = new Map();
for (const c of checks) {
  healthMap.set(c.tool_id, c);
}

// 2. Classify candidates
const tier1 = [];
const tier2 = [];
const kept = [];

const hostMap = new Map();
for (const t of tools) {
  let host = '';
  try { host = new URL(t.url).hostname; } catch (e) { host = t.url; }
  if (!hostMap.has(host)) hostMap.set(host, []);
  hostMap.get(host).push(t);
}

for (const t of tools) {
  const check = healthMap.get(t.id);
  const email = (t.submitter_email || '').toLowerCase();
  const coreTask = (t.core_task || '').trim();
  const name = (t.name || '').trim();
  const url = (t.url || '').toLowerCase();
  const desc = (t.description || '').toLowerCase();
  let host = '';
  try { host = new URL(t.url).hostname; } catch (e) { host = t.url; }

  // 1. Dead links
  if (check && check.is_online === 0) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: `站点无法访问/已失效 (HTTP ${check.http_status || 'error'})` });
    continue;
  }

  // 2. Directory spam / doorway pages
  if (url.includes('vccbusiness.com') || url.includes('ramerlabs.com') || desc.includes('directory submission') || coreTask.includes('directory hosts') || desc.includes('seo bookmark')) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: '外链代提交/目录刷量服务自身或门面单页' });
    continue;
  }

  // 3. Bot / Agent emails
  if (email.endsWith('@agent.qq.com') || email.includes('foundagent.net')) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: `自动化 AI Agent/机器脚本批量提交 (${email})` });
    continue;
  }

  // 4. Dummy / placeholder core_task
  const dummyTasks = [
    'use the tool in the browser without creating an account.',
    '所有事情',
    'check',
    'use tool',
    '好像做不了',
    'browse the web',
    'email writing',
    'verity mod guide'
  ];
  if (dummyTasks.includes(coreTask.toLowerCase()) || coreTask.length < 10) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: `无意义/敷衍/占位符核心描述 ("${coreTask}")` });
    continue;
  }

  // 5. Commercial shop / paid download
  if (url.includes('/shop/') || coreTask.includes('stripe checkout') || url.includes('thaliabloom.com') || coreTask.includes('paid download') || desc.includes('paid software')) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: '纯商业收费商店/付费软件下载销售页' });
    continue;
  }

  // 6. Pure content / wikis / guides / affiliate blogs (not software tools)
  const isWikiOrGuide = (
    url.includes('wiki') || name.toLowerCase().includes('wiki') || 
    name.toLowerCase().includes('walkthrough') || 
    (name.toLowerCase().includes('guide') && !name.toLowerCase().includes('generator')) ||
    url.includes('smallhandmouse.com') ||
    name.includes('Bible Verse of the Day') ||
    name.includes('VI Atlas')
  );
  if (isWikiOrGuide) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: '纯资讯/游戏攻略/维基百科/博客硬件评测（非软件工具）' });
    continue;
  }

  // 7. Fake repo URL
  if (t.repo_url && t.url.includes('writecream.com') && t.repo_url.includes('toolflow')) {
    tier1.push({ id: t.id, name: t.name, url: t.url, reason: '冒用无关开源仓库骗取开源标识' });
    continue;
  }

  // Tier 2: Explicit backlink batch UTM campaigns
  if (url.includes('utm_campaign=backlink') || url.includes('utm_campaign=revenue_experiment') || url.includes('utm_campaign=portfolio_growth') || url.includes('backlink_batch') || url.includes('directory_growth')) {
    tier2.push({ id: t.id, name: t.name, url: t.url, reason: `明确的 SEO 批量外链活动单页 (${url.match(/utm_campaign=[^&#]+/)?.[0] || 'UTM'})` });
    continue;
  }

  // Tier 2: Excessive matrix slice submissions (keep the earliest/primary one per host)
  // Exclude multi-tenant open-source platforms (e.g. xueboyang1985.github.io where each subpath is a distinct repo)
  const isMultiTenant = host.endsWith('github.io') && !url.includes('forge');
  if (!isMultiTenant) {
    const hostTools = hostMap.get(host);
    if (hostTools && hostTools.length >= 4) {
      const idx = hostTools.findIndex(x => x.id === t.id);
      if (idx > 0) {
        tier2.push({ id: t.id, name: t.name, url: t.url, reason: `同一主站批量切片提交 (${host} 共提 ${hostTools.length} 个，仅保留首个主条目)` });
        continue;
      }
    }
  }

  kept.push(t);
}

console.log('\n=== Classification Results ===');
console.log(`Tier 1 (Hard reject): ${tier1.length}`);
console.log(`Tier 2 (SEO Matrix / Campaign reject): ${tier2.length}`);
console.log(`Remaining kept: ${kept.length}`);

const toReject = tier1Only ? tier1 : [...tier1, ...tier2];
console.log(`\nTotal items to reject in this run: ${toReject.length}`);

if (isDryRun) {
  console.log('\n[DRY RUN] To execute changes, run:');
  console.log('  node scripts/batch-reject-pending.mjs --execute');
  process.exit(0);
}

// 3. Generate SQL batch file
console.log('\n[batch-reject] Generating SQL statements...');
const sqlStatements = toReject.map(item => {
  const reasonEscaped = item.reason.replace(/'/g, "''");
  return `UPDATE tools SET status = 'rejected', rejection_reason = '${reasonEscaped}', is_featured = 0, featured_at = NULL WHERE id = ${item.id} AND status = 'pending';`;
});

const sqlFilePath = resolve(ROOT_DIR, 'scripts/.batch-reject.sql');
writeFileSync(sqlFilePath, sqlStatements.join('\n'), 'utf-8');
console.log(`[batch-reject] Wrote ${sqlStatements.length} statements to ${sqlFilePath}`);

// 4. Execute via wrangler d1 execute
console.log('[batch-reject] Executing SQL on remote D1...');
try {
  execSync(
    `npx wrangler d1 execute nologin-tools-db --remote --file=${sqlFilePath} --yes`,
    { cwd: ROOT_DIR, stdio: 'inherit' }
  );
  console.log('\n[batch-reject] Execution completed successfully!');
} catch (error) {
  console.error('[batch-reject] Execution failed:', error);
  process.exit(1);
}
