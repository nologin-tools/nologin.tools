// @ts-check
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { parseGitHubRepoUrl, createGitHubNotificationIssue } from '../src/lib/github-core.mjs';

/**
 * @typedef {Object} BadgeDetectionResult
 * @property {'explicit' | 'none'} displayType
 * @property {'website' | 'readme' | 'both' | 'none'} location
 * @property {string | null} matchedSnippet
 */

/**
 * Checks if raw content contains valid NoLogin Verified badge embeds or links.
 * @param {string} content
 * @returns {boolean}
 */
export function containsBadgeEmbed(content) {
  if (!content || typeof content !== 'string') return false;
  return (
    content.includes('nologin.tools/badge') ||
    content.includes('nologin.tools/badges') ||
    content.includes('nologintools.org/badge') ||
    content.includes('nologintools.org/badges') ||
    /nologin(?:\.tools|tools\.org)\/.*badge/i.test(content) ||
    /Verified by NoLoginTools(?:\.org)?/i.test(content) ||
    /Verified by nologin\.tools/i.test(content)
  );
}

/**
 * Categorizes open-source tools into targeted outreach cohorts.
 * @param {Array<{ id: number; name: string; slug: string; repoUrl: string; githubStars?: number | null }>} tools
 * @param {Map<number, { status: string; issueUrl?: string }>} notificationMap
 * @param {Set<number>} activeExhibitorIds
 */
export function stratifyOutreachCohorts(tools, notificationMap, activeExhibitorIds) {
  const exhibiting = [];
  const alreadyNotified = [];
  const indieCandidates = [];
  const flagshipCandidates = [];
  const unclassified = [];

  for (const tool of tools) {
    if (activeExhibitorIds.has(tool.id)) {
      exhibiting.push(tool);
      continue;
    }

    const notif = notificationMap.get(tool.id);
    if (notif && (notif.status === 'created' || notif.status === 'disabled')) {
      alreadyNotified.push({ ...tool, issueUrl: notif.issueUrl });
      continue;
    }

    const stars = tool.githubStars ?? 0;
    if (stars >= 5000) {
      flagshipCandidates.push(tool);
    } else if (stars >= 30) {
      indieCandidates.push(tool);
    } else {
      unclassified.push(tool);
    }
  }

  // Sort candidates by stars descending
  indieCandidates.sort((a, b) => (b.githubStars || 0) - (a.githubStars || 0));
  flagshipCandidates.sort((a, b) => (b.githubStars || 0) - (a.githubStars || 0));

  return {
    exhibiting,
    alreadyNotified,
    indieCandidates,
    flagshipCandidates,
    unclassified,
  };
}

/**
 * Scans a single tool's website and GitHub README for badge embeds.
 * @param {{ id: number; name: string; url: string; repoUrl?: string | null }} tool
 * @returns {Promise<BadgeDetectionResult>}
 */
export async function detectToolBadge(tool) {
  let onSite = false;
  let onReadme = false;
  let matchedSnippet = null;

  // 1. Check primary website
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(tool.url, {
      headers: { 'User-Agent': 'NoLoginTools-BadgeChecker/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const html = await res.text();
      if (containsBadgeEmbed(html)) {
        onSite = true;
        matchedSnippet = 'Website HTML';
      }
    }
  } catch (e) {
    // Non-fatal website error
  }

  // 2. Check GitHub README
  if (tool.repoUrl) {
    const parsed = parseGitHubRepoUrl(tool.repoUrl);
    if (parsed) {
      for (const branch of ['main', 'master', 'dev', 'HEAD']) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/README.md`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(rawUrl, {
            headers: { 'User-Agent': 'NoLoginTools-BadgeChecker/1.0' },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (res.ok) {
            const readme = await res.text();
            if (containsBadgeEmbed(readme)) {
              onReadme = true;
              matchedSnippet = `README.md (${branch})`;
              break;
            }
          }
        } catch (e) {
          // Try next branch
        }
      }
    }
  }

  if (onSite && onReadme) return { displayType: 'explicit', location: 'both', matchedSnippet };
  if (onSite) return { displayType: 'explicit', location: 'website', matchedSnippet };
  if (onReadme) return { displayType: 'explicit', location: 'readme', matchedSnippet };
  return { displayType: 'none', location: 'none', matchedSnippet: null };
}

// CLI Execution entrypoint
async function runCli() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const skipScan = args.includes('--skip-scan');
  const notifyIndex = args.indexOf('--notify-batch');
  const notifyLimit = notifyIndex !== -1 ? parseInt(args[notifyIndex + 1], 10) || 3 : 0;

  console.log('=== NoLogin Tools Open-Source Ecosystem & Badge Patrol ===\n');

  // Load build data snapshot
  let tools = [];
  try {
    const raw = fs.readFileSync('src/data/build-data.json', 'utf8');
    tools = JSON.parse(raw).tools || [];
  } catch (e) {
    console.error('Failed to load build-data.json:', e.message);
    process.exit(1);
  }

  const openSourceTools = tools.filter(
    (t) => t.status === 'approved' && t.repoUrl && t.repoUrl.includes('github.com')
  );
  console.log(`Auditing ${openSourceTools.length} approved open-source tools with GitHub repositories...\n`);

  // Query remote D1 for notification history
  const notificationMap = new Map();
  try {
    const rawNotifs = execSync(
      `npx wrangler d1 execute nologin-tools-db --remote --command="SELECT tool_id, status, issue_url FROM github_notifications;" --json`,
      { encoding: 'utf8' }
    );
    const parsedJson = JSON.parse(rawNotifs);
    const rows = parsedJson[0]?.results || [];
    for (const r of rows) {
      notificationMap.set(r.tool_id, { status: r.status, issueUrl: r.issue_url });
    }
  } catch (e) {
    console.warn('Notice: Could not query remote D1 github_notifications, continuing with local data.');
  }

  // 1. Scan for active badge exhibitors
  const activeExhibitors = new Set();
  const newlyDetected = [];

  // Initialize with known exhibitors from remote D1
  try {
    const rawBadges = execSync(
      `npx wrangler d1 execute nologin-tools-db --remote --command="SELECT tool_id FROM badge_displays WHERE display_type = 'explicit';" --json`,
      { encoding: 'utf8' }
    );
    const parsedJson = JSON.parse(rawBadges);
    const rows = parsedJson[0]?.results || [];
    for (const r of rows) {
      activeExhibitors.add(r.tool_id);
    }
  } catch (e) {
    // Non-fatal
  }

  if (skipScan) {
    console.log('Phase 1: Skipping repository scan (--skip-scan enabled).');
  } else {
    console.log('Phase 1: Scanning repositories for active badge embeddings...');
    for (const tool of openSourceTools) {
      process.stdout.write(`  Checking ${tool.name.padEnd(28)}... `);
      const result = await detectToolBadge(tool);
      if (result.displayType === 'explicit') {
        console.log(`🛡️ VERIFIED on ${result.location} (${result.matchedSnippet})`);
        activeExhibitors.add(tool.id);
        newlyDetected.push({ tool, result });
      } else {
        console.log('none');
      }
    }

    console.log(`\nActive Badge Exhibitors: ${activeExhibitors.size} / ${openSourceTools.length}`);

    // Sync newly detected exhibitors to D1
    if (newlyDetected.length > 0) {
      if (isDryRun) {
        console.log(`\n[DRY-RUN] Would sync ${newlyDetected.length} verified badges to D1 badge_displays table.`);
      } else {
        console.log(`\nSyncing ${newlyDetected.length} verified badges to D1 badge_displays table...`);
        const nowSec = Math.floor(Date.now() / 1000);
        for (const { tool } of newlyDetected) {
          try {
            execSync(
              `npx wrangler d1 execute nologin-tools-db --remote --command="INSERT INTO badge_displays (tool_id, display_type, last_checked_at) VALUES (${tool.id}, 'explicit', ${nowSec}) ON CONFLICT(tool_id) DO UPDATE SET display_type = 'explicit', last_checked_at = ${nowSec};" --yes`,
              { stdio: 'inherit' }
            );
            console.log(`  ✓ Synced badge status 'explicit' to D1 for ${tool.name} (id: ${tool.id})`);
          } catch (e) {
            console.error(`  ✗ Failed to sync badge for ${tool.name}:`, e.message);
          }
        }
      }
    }
  }

  // 2. Stratify outreach cohorts
  const cohorts = stratifyOutreachCohorts(openSourceTools, notificationMap, activeExhibitors);

  console.log('\n=== Outreach Cohort Stratification ===');
  console.log(`- 🛡️ Active Exhibitors (verified badge): ${cohorts.exhibiting.length}`);
  console.log(`- 📬 Previously Notified (waiting merge): ${cohorts.alreadyNotified.length}`);
  console.log(`- 🎯 High-Affinity Indie Candidates (⭐30 - 5k): ${cohorts.indieCandidates.length}`);
  console.log(`- 👑 Flagship Masterpieces (⭐> 5k): ${cohorts.flagshipCandidates.length}`);
  console.log(`- 📦 Unclassified / Micro Repos (⭐< 30): ${cohorts.unclassified.length}`);

  console.log('\nTop 5 High-Affinity Indie Candidates for Outreach:');
  cohorts.indieCandidates.slice(0, 5).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (⭐${t.githubStars || 0}) — ${t.repoUrl}`);
  });

  // 3. Optional batch notification
  if (notifyLimit > 0) {
    console.log(`\nPhase 2: Sending batch notifications to top ${notifyLimit} indie candidates...`);
    const candidates = cohorts.indieCandidates.slice(0, notifyLimit);

    let token = '';
    try {
      token = execSync('gh auth token', { encoding: 'utf8' }).trim();
    } catch (e) {
      console.error('GitHub token unavailable via `gh auth token`. Cannot send issues.');
      return;
    }

    for (let i = 0; i < candidates.length; i++) {
      const tool = candidates[i];
      const parsed = parseGitHubRepoUrl(tool.repoUrl);
      if (!parsed) continue;

      console.log(`\n[${i + 1}/${candidates.length}] Preparing issue for ${tool.name} on ${parsed.owner}/${parsed.repo}...`);
      if (isDryRun) {
        console.log(`  [DRY-RUN] Would create Issue: "[NoLogin Verified] ${tool.name} has been verified by nologin.tools"`);
        continue;
      }

      try {
        const issueRes = await createGitHubNotificationIssue(
          parsed.owner,
          parsed.repo,
          tool.name,
          tool.url,
          tool.slug,
          'https://nologin.tools',
          token
        );

        if (issueRes?.issueUrl) {
          console.log(`  ✓ Issue created successfully: ${issueRes.issueUrl} (#${issueRes.issueNumber})`);
          // Record in remote D1
          const nowSec = Math.floor(Date.now() / 1000);
          execSync(
            `npx wrangler d1 execute nologin-tools-db --remote --command="INSERT INTO github_notifications (tool_id, issue_url, issue_number, created_at, status) VALUES (${tool.id}, '${issueRes.issueUrl}', ${issueRes.issueNumber}, ${nowSec}, 'created');" --yes`,
            { stdio: 'inherit' }
          );
        } else {
          console.warn(`  ✗ Failed to create issue for ${tool.name}`);
        }
      } catch (err) {
        if (err?.status === 410 || err?.message?.includes('410') || err?.message?.includes('Issues disabled')) {
          console.warn(`  ℹ Issues are disabled on ${parsed.owner}/${parsed.repo}. Recording to D1...`);
          const nowSec = Math.floor(Date.now() / 1000);
          try {
            execSync(
              `npx wrangler d1 execute nologin-tools-db --remote --command="INSERT INTO github_notifications (tool_id, status, error_message, created_at) VALUES (${tool.id}, 'disabled', 'Issues disabled', ${nowSec});" --yes`,
              { stdio: 'inherit' }
            );
          } catch (e) {}
        } else {
          console.error(`  ✗ Error creating issue: ${err.message}`);
        }
      }

      // 2.5s delay between issues to prevent secondary rate limits
      if (i < candidates.length - 1 && !isDryRun) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }
  }

  console.log('\n=== Badge Patrol Run Completed ===');
}

// Run when executed directly
if (process.argv[1]?.endsWith('badge-patrol.mjs')) {
  runCli().catch((err) => {
    console.error('Fatal Badge Patrol Error:', err);
    process.exit(1);
  });
}
