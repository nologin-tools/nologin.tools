#!/usr/bin/env node
// @ts-check
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, unlinkSync } from 'node:fs';
import { parseGitHubRepoUrl } from '../src/lib/github-core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 35;

  console.log('=== NoLogin Tools: GitHub Metadata Refresh ===\n');

  // Obtain auth token if available
  let token = '';
  try {
    token = execSync('gh auth token', { encoding: 'utf8' }).trim();
    if (token) console.log('✓ Using authenticated GitHub token (5,000 req/hr).');
  } catch (e) {
    console.warn('Notice: `gh auth token` not found, using unauthenticated requests (60 req/hr).');
  }

  // Query stale or oldest tools from D1
  console.log(`\nQuerying up to ${limit} approved tools with oldest GitHub fetch dates from remote D1...`);
  const raw = execSync(
    `npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT id, slug, name, repo_url, github_stars, github_forks, github_license, github_language, github_fetched_at FROM tools WHERE status = 'approved' AND repo_url IS NOT NULL AND repo_url != '' ORDER BY github_fetched_at ASC NULLS FIRST LIMIT ${limit};"`,
    { cwd: ROOT_DIR, encoding: 'utf-8' }
  );

  const tools = JSON.parse(raw)[0].results || [];
  console.log(`Found ${tools.length} repositories to check.\n`);

  if (tools.length === 0) {
    console.log('No tools found for refresh.');
    return;
  }

  const updates = [];
  const errors = [];

  for (let i = 0; i < tools.length; i++) {
    const t = tools[i];
    const parsed = parseGitHubRepoUrl(t.repo_url);
    if (!parsed) {
      console.warn(`[${i + 1}/${tools.length}] Invalid repo URL for ${t.name}: ${t.repo_url}`);
      errors.push({ name: t.name, error: 'Invalid URL' });
      continue;
    }

    process.stdout.write(`[${i + 1}/${tools.length}] Fetching ${parsed.owner}/${parsed.repo} (${t.name})... `);

    try {
      const headers = {
        'User-Agent': 'NoLoginTools-GitHubFetcher/1.0',
        Accept: 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
      if (!res.ok) {
        console.log(`❌ HTTP ${res.status}`);
        errors.push({ name: t.name, repo: `${parsed.owner}/${parsed.repo}`, error: `HTTP ${res.status}` });
        continue;
      }

      const data = await res.json();
      const stars = data.stargazers_count ?? 0;
      const forks = data.forks_count ?? 0;
      const license = data.license?.spdx_id || null;
      const language = data.language || null;
      const updatedAtSec = data.updated_at ? Math.floor(new Date(data.updated_at).getTime() / 1000) : null;

      const starDelta = stars - (t.github_stars ?? 0);
      const deltaStr = starDelta > 0 ? `(+${starDelta})` : starDelta < 0 ? `(${starDelta})` : '(=)';

      console.log(`✅ ⭐${stars} ${deltaStr} | 🍴${forks} | ${language || 'N/A'}`);

      updates.push({
        id: t.id,
        name: t.name,
        slug: t.slug,
        stars,
        forks,
        license,
        language,
        updatedAtSec,
      });

      // Small delay between requests to be gentle
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      errors.push({ name: t.name, error: err.message });
    }
  }

  console.log(`\nSuccessfully fetched metadata for ${updates.length}/${tools.length} repositories.`);

  if (updates.length === 0) {
    console.log('No updates to apply.');
    return;
  }

  if (isDryRun) {
    console.log('[DRY-RUN] Skipping D1 database update.');
    return;
  }

  // Generate SQL batch update
  const sqlStatements = updates.map((u) => {
    const licenseVal = u.license ? `'${u.license.replace(/'/g, "''")}'` : 'NULL';
    const langVal = u.language ? `'${u.language.replace(/'/g, "''")}'` : 'NULL';
    const updatedVal = u.updatedAtSec !== null ? u.updatedAtSec : 'NULL';
    return `UPDATE tools SET github_stars = ${u.stars}, github_forks = ${u.forks}, github_license = ${licenseVal}, github_language = ${langVal}, github_updated_at = ${updatedVal}, github_fetched_at = unixepoch() WHERE id = ${u.id};`;
  });

  const sqlPath = resolve(ROOT_DIR, 'scripts/.patrol-github.sql');
  writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');

  console.log(`\nWriting ${sqlStatements.length} updates to remote D1...`);
  try {
    execSync(`npx wrangler d1 execute nologin-tools-db --remote --file=${sqlPath} --yes`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    console.log('✓ D1 database successfully updated.');
  } finally {
    try {
      unlinkSync(sqlPath);
    } catch {}
  }

  console.log('\n=== GitHub Metadata Refresh Completed ===');
}

main().catch(console.error);
