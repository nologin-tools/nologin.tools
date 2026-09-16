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

// 1. Fetch current pending tools
console.log('[batch-reject] Fetching pending tools from remote D1...');
const toolsOutput = execSync(
  `npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT id, slug, name, url, description, core_task, submitter_ip_hash, submitter_email, repo_url, datetime(submitted_at, 'unixepoch') as submitted_at FROM tools WHERE status = 'pending' ORDER BY id ASC;"`,
  { cwd: ROOT_DIR, encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 }
);
const tools = JSON.parse(toolsOutput)[0].results;
console.log(`[batch-reject] Total pending tools: ${tools.length}`);

// 2. Health check function for candidates
async function checkUrl(url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 6000);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: c.signal,
      headers: { 'User-Agent': 'NoLoginTools-HealthChecker/1.0' },
      redirect: 'follow'
    });
    clearTimeout(t);
    if (res.status === 404 || res.status === 410) return { ok: false, status: res.status };
    return { ok: true, status: res.status };
  } catch (e) {
    clearTimeout(t);
    const c2 = new AbortController();
    const t2 = setTimeout(() => c2.abort(), 6000);
    try {
      const res2 = await fetch(url, {
        method: 'GET',
        signal: c2.signal,
        headers: { 'User-Agent': 'NoLoginTools-HealthChecker/1.0' },
        redirect: 'follow'
      });
      clearTimeout(t2);
      if (res2.status === 404 || res2.status === 410) return { ok: false, status: res2.status };
      return { ok: true, status: res2.status };
    } catch (e2) {
      clearTimeout(t2);
      return { ok: false, status: 0, error: e2.message };
    }
  }
}

// 3. Classify candidates
async function classifyTools() {
  const tier1 = [];
  const tier2 = [];
  const candidatePool = [];

  const hostMap = new Map();
  for (const t of tools) {
    let host = '';
    try { host = new URL(t.url).hostname.toLowerCase(); } catch (e) { host = t.url; }
    if (!hostMap.has(host)) hostMap.set(host, []);
    hostMap.get(host).push(t);
  }

  for (const t of tools) {
    const url = (t.url || '').toLowerCase();
    const name = (t.name || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const task = (t.core_task || '').toLowerCase();
    const email = (t.submitter_email || '').toLowerCase();
    const repo = (t.repo_url || '').toLowerCase();
    let host = '';
    try { host = new URL(t.url).hostname.toLowerCase(); } catch (e) { host = t.url; }

    // Tier 1: Ephemeral tunnels & temporary storage links
    if (
      host.includes('trycloudflare.com') || host.includes('ngrok') ||
      host.includes('localtunnel') || host.includes('catbox.moe') ||
      host.includes('drive.google.com') || host.includes('dropbox.com') ||
      host.endsWith('.chatgpt.site')
    ) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '临时穿透隧道/临时网盘直链/chatgpt.site临时子域' });
      continue;
    }

    // Tier 1: Digital stores / Gumroad / paid software
    if (
      host.includes('gumroad.com') || host.includes('lemonsqueezy.com') ||
      url.includes('/shop/') || task.includes('stripe checkout') ||
      task.includes('paid download') || desc.includes('paid software')
    ) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '数字商品销售页/付费软件下载/Shopify商店' });
      continue;
    }

    // Tier 1: Desktop client / Chrome extension only
    if (
      ((task.includes('download and run') || desc.includes('download and run the macos app') || desc.includes('download and install') || desc.includes('desktop app for mac') || desc.includes('desktop app for windows')) && !desc.includes('in the browser')) ||
      (desc.includes('chrome extension') && (task.includes('extension') || !desc.includes('web app'))) ||
      (task.includes('chrome extension') && !task.includes('web'))
    ) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '本地客户端软件下载/Chrome扩展插件 (非免登录网页工具)' });
      continue;
    }

    // Tier 1: Direct GitHub repo URL as tool URL
    if (url.startsWith('https://github.com/')) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '直接提交 GitHub 仓库链接 (未部署为在线 Web 工具)' });
      continue;
    }

    // Tier 1: Fake / impersonated repo URL
    if (
      (repo.includes('anthropics/claude-code') && !url.includes('anthropic.com')) ||
      (repo.includes('writecream.com') && repo.includes('toolflow'))
    ) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '冒用知名第三方开源仓库骗取开源标识' });
      continue;
    }

    // Tier 1: API gateways / B2B SaaS docs browsing
    if (
      task.includes('browse model catalog and docs') || task.includes('browse api docs') ||
      desc.includes('api for 500+ models') || (desc.includes('api platform') && task.includes('browse'))
    ) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '商业 API 服务商/仅能免登录查阅文档 (非免登录交互工具)' });
      continue;
    }

    // Tier 1: Directories / Aggregators / Link hubs
    if (
      url.includes('openaitoolshub.org') || url.includes('doforai.tools') || url.includes('aidogebox.com') ||
      (name.includes('directory') && !name.includes('active directory')) ||
      (desc.includes('independent ai directory') || desc.includes('curated directory of ai') || desc.includes('directory for discovering and searching') || desc.includes('browse ai tool reviews'))
    ) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: '网址导航/AI目录聚合站/资讯站 (非独立计算工具)' });
      continue;
    }

    // Tier 1: Dummy or placeholder core tasks
    if (task.length < 12 || task === 'use tool' || task === 'check' || task === '所有事情' || task === 'browse the web') {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: `无意义或过于敷衍的核心任务描述 ("${t.core_task}")` });
      continue;
    }

    // Tier 1: Bot emails
    if (email.endsWith('@agent.qq.com') || email.includes('foundagent.net')) {
      tier1.push({ id: t.id, name: t.name, url: t.url, reason: `自动化 AI Agent/机器脚本批量提交 (${email})` });
      continue;
    }

    // Tier 2: SEO UTM campaign URLs
    if (url.includes('utm_campaign=') || url.includes('utm_source=nologin') || url.includes('utm_medium=directory')) {
      tier2.push({ id: t.id, name: t.name, url: t.url, reason: `携带批量外链推广跟踪参数 (${url.match(/utm_[^&#]+/)?.[0] || 'UTM'})` });
      continue;
    }

    // Tier 2: Static blog posts / articles
    if (
      url.includes('/blog/') || url.includes('/article/') || url.includes('/articles/') ||
      url.includes('spywizards.com/blog/') || url.includes('alphagaindaily.com')
    ) {
      tier2.push({ id: t.id, name: t.name, url: t.url, reason: '静态博客文章/操作指南/资讯专栏 (非在线交互工具)' });
      continue;
    }

    // Tier 2: Entertainment games / horoscope / tarot / quizzes
    if (
      name.includes('puzzle game') || name.includes('blood money') || name.includes('imposter word') ||
      name.includes('love type test') || name.includes('tarot') || name.includes('astrology') ||
      name.includes('natal chart') || name.includes('chiikawa') || name.includes('word cookies') ||
      name.includes('bible verse') || name.includes('doodlecat') || name.includes('sbti') ||
      name.includes('levelwalks') || url.includes('tarot') || url.includes('natalchart') ||
      url.includes('chiikawa') || url.includes('astrologycalculator') || url.includes('yaytap.com') ||
      desc.includes('play geography games and quizzes') || desc.includes('word puzzle games platform')
    ) {
      tier2.push({ id: t.id, name: t.name, url: t.url, reason: '游戏试玩/星座占卜/心理测试/娱乐休闲内容 (不符合生产力/隐私免登录工具定位)' });
      continue;
    }

    // Tier 2: Low-quota paywall bait
    if (desc.includes('3 free tasks per day') || desc.includes('1 free query') || task.includes('1 free query')) {
      tier2.push({ id: t.id, name: t.name, url: t.url, reason: '极低单日免费额度诱饵/本质为付费漏斗' });
      continue;
    }

    // Tier 2: Multi-submission per domain (keep the first/cleanest)
    const hostTools = hostMap.get(host);
    if (hostTools && hostTools.length > 1) {
      const firstId = hostTools[0].id;
      if (t.id !== firstId) {
        tier2.push({ id: t.id, name: t.name, url: t.url, reason: `同一主域名重复切片/重复提交 (${host} 已存在首选条目 ID ${firstId})` });
        continue;
      }
    }

    // Tier 2: Known multi-site spammers
    if (email === 'dyjae93@gmail.com' || email === 'samir.asadov.28@gmail.com') {
      tier2.push({ id: t.id, name: t.name, url: t.url, reason: `批量刷量提交者矩阵站点 (${email})` });
      continue;
    }

    candidatePool.push(t);
  }

  // Health check the candidate pool
  console.log(`[batch-reject] Health checking ${candidatePool.length} surviving candidates...`);
  const kept = [];
  const batchSize = 20;
  for (let i = 0; i < candidatePool.length; i += batchSize) {
    const batch = candidatePool.slice(i, i + batchSize);
    await Promise.all(batch.map(async (t) => {
      const res = await checkUrl(t.url);
      if (!res.ok) {
        tier1.push({ id: t.id, name: t.name, url: t.url, reason: `站点无法访问/已失效 (HTTP ${res.status || 'error'})` });
      } else {
        kept.push(t);
      }
    }));
    process.stdout.write(`\r[batch-reject] Checked: ${Math.min(i + batchSize, candidatePool.length)}/${candidatePool.length}...`);
  }
  console.log('\n[batch-reject] Health checks completed.');

  return { tier1, tier2, kept };
}

async function main() {
  const { tier1, tier2, kept } = await classifyTools();

  console.log('\n=== Classification Results ===');
  console.log(`Tier 1 (Hard reject - Dead / Fake / Paywall / Ephemeral / Directory): ${tier1.length}`);
  console.log(`Tier 2 (Matrix / SEO Campaign / Entertainment / Duplicate): ${tier2.length}`);
  console.log(`Remaining kept for browser investigation: ${kept.length}`);

  const toReject = tier1Only ? tier1 : [...tier1, ...tier2];
  console.log(`\nTotal items to reject in this run: ${toReject.length}`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Sample 10 items to reject:');
    toReject.slice(0, 10).forEach(x => console.log(`  [${x.id}] ${x.name}: ${x.reason}`));
    console.log('\n[DRY RUN] To execute changes, run:');
    console.log('  node scripts/batch-reject-pending.mjs --execute');
    process.exit(0);
  }

  // Generate SQL batch file
  console.log('\n[batch-reject] Generating SQL statements...');
  const sqlStatements = toReject.map(item => {
    const reasonEscaped = item.reason.replace(/'/g, "''");
    return `UPDATE tools SET status = 'rejected', rejection_reason = '${reasonEscaped}', is_featured = 0, featured_at = NULL WHERE id = ${item.id} AND status = 'pending';`;
  });

  const sqlFilePath = resolve(ROOT_DIR, 'scripts/.batch-reject.sql');
  writeFileSync(sqlFilePath, sqlStatements.join('\n'), 'utf-8');
  console.log(`[batch-reject] Wrote ${sqlStatements.length} statements to ${sqlFilePath}`);

  // Execute via wrangler d1 execute
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
}

main().catch(err => {
  console.error('[batch-reject] Error:', err);
  process.exit(1);
});

