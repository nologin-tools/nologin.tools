/**
 * GitHub repo URL parsing, social URL validation, and GitHub API data fetching.
 */

/**
 * Parse a GitHub repository URL and extract owner/repo.
 * Supports formats like:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/tree/main/...
 */
export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

/** Validate a Twitter/X URL (twitter.com or x.com). */
export function validateTwitterUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'twitter.com' || parsed.hostname === 'www.twitter.com'
      || parsed.hostname === 'x.com' || parsed.hostname === 'www.x.com';
  } catch {
    return false;
  }
}

/** Validate a GitHub profile URL (github.com/{username}). */
export function validateGitHubProfileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') return false;
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length >= 1;
  } catch {
    return false;
  }
}

/** Validate a Discord URL (discord.gg or discord.com). */
export function validateDiscordUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'discord.gg' || parsed.hostname === 'discord.com'
      || parsed.hostname === 'www.discord.com' || parsed.hostname === 'www.discord.gg';
  } catch {
    return false;
  }
}

/** Validate a repo URL (currently only GitHub repos are supported). */
export function validateRepoUrl(url: string): boolean {
  return parseGitHubRepoUrl(url) !== null;
}

export interface GitHubRepoData {
  stars: number;
  forks: number;
  license: string | null;
  language: string | null;
  updatedAt: Date;
}

/**
 * Fetch public repository data from GitHub REST API.
 * No authentication needed for public repos (60 requests/hour rate limit).
 */
export async function fetchGitHubRepoData(owner: string, repo: string): Promise<GitHubRepoData | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  console.log(`[GitHub] Fetching repo data: ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NoLoginTools-GitHubFetcher/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[GitHub] API returned ${res.status} for ${owner}/${repo}`);
      return null;
    }

    const data = await res.json() as {
      stargazers_count: number;
      forks_count: number;
      license: { spdx_id: string } | null;
      language: string | null;
      updated_at: string;
    };

    console.log(`[GitHub] Fetched ${owner}/${repo}: ⭐${data.stargazers_count} 🍴${data.forks_count} ${data.language || 'N/A'}`);

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      license: data.license?.spdx_id || null,
      language: data.language,
      updatedAt: new Date(data.updated_at),
    };
  } catch (err) {
    console.error(`[GitHub] Failed to fetch ${owner}/${repo}:`, err);
    return null;
  }
}

/**
 * Fetch repository data with optional authentication.
 * With token: 5000 req/hr. Without token: 60 req/hr.
 */
export async function fetchGitHubRepoDataAuth(
  owner: string,
  repo: string,
  githubToken?: string,
): Promise<GitHubRepoData | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  console.log(`[GitHub] Fetching repo data (auth=${!!githubToken}): ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'User-Agent': 'NoLoginTools-GitHubFetcher/1.0',
      Accept: 'application/vnd.github.v3+json',
    };
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }

    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[GitHub] API returned ${res.status} for ${owner}/${repo}`);
      return null;
    }

    const data = await res.json() as {
      stargazers_count: number;
      forks_count: number;
      license: { spdx_id: string } | null;
      language: string | null;
      updated_at: string;
    };

    console.log(`[GitHub] Fetched ${owner}/${repo}: ⭐${data.stargazers_count} 🍴${data.forks_count} ${data.language || 'N/A'}`);

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      license: data.license?.spdx_id || null,
      language: data.language,
      updatedAt: new Date(data.updated_at),
    };
  } catch (err) {
    console.error(`[GitHub] Failed to fetch ${owner}/${repo}:`, err);
    return null;
  }
}

export interface GitHubIssueResult {
  issueUrl: string;
  issueNumber: number;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public ghMessage?: string,
  ) {
    super(message);
  }
}

/**
 * Create a GitHub Issue notifying a repo that their tool has been verified.
 * Returns issue URL and number on success, or null on failure.
 * Throws on 410 Gone (issues disabled).
 */
export async function createGitHubNotificationIssue(
  owner: string,
  repo: string,
  toolName: string,
  toolUrl: string,
  toolSlug: string,
  siteUrl: string,
  githubToken: string,
): Promise<GitHubIssueResult | null> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const badgeUrl = `${siteUrl}/badges/flat.svg`;
  const badgePageUrl = `${siteUrl}/badge/${toolSlug}`;
  const toolPageUrl = `${siteUrl}/tool/${toolSlug}`;

  const title = `[NoLogin Verified] ${toolName} has been verified by nologin.tools`;
  const body = `## 🎉 Congratulations!

**${toolName}** has been verified by [nologin.tools](${siteUrl}/about) as a privacy-friendly tool that works without requiring user login.

### What is NoLogin Verified?

[NoLogin Verified](${siteUrl}/badge/) is a trust badge for tools that respect user privacy. Your tool has been manually reviewed and confirmed to:
- ✅ Work without requiring user registration or login
- ✅ Respect user privacy
- ✅ Be continuously monitored for availability

Learn more: [${siteUrl}/badge/](${siteUrl}/badge/)

### Add the NoLogin Verified badge

#### In your README

[![NoLogin Verified](${badgeUrl})](${badgePageUrl})

\`\`\`markdown
[![NoLogin Verified](${badgeUrl})](${badgePageUrl})
\`\`\`

#### On your landing page or footer

\`\`\`html
<a href="${badgePageUrl}"><img src="${badgeUrl}" alt="NoLogin Verified" title="Verified by NoLoginTools.org" /></a>
\`\`\`

### More badge styles

We offer 13+ badge styles including dark, social, and color variants. Visit your [badge page](${badgePageUrl}#embed) to find the one that best fits your site.

### Your tool page

View your verified tool page: [${toolPageUrl}](${toolPageUrl})

---

*This is an automated notification from [nologin.tools](${siteUrl}). If you have questions, visit our [about page](${siteUrl}/about).*`;

  console.log(`[GitHub] Creating notification issue for ${owner}/${repo}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'NoLoginTools-Notifier/1.0',
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['nologin-verified'],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      let ghMessage = '';
      try { ghMessage = JSON.parse(errorBody)?.message || errorBody; } catch { ghMessage = errorBody; }
      console.warn(`[GitHub] Failed to create issue for ${owner}/${repo}: ${res.status} ${ghMessage}`);

      if (res.status === 410) {
        throw new GitHubApiError('Issues are disabled for this repository', 410, ghMessage);
      }

      if (res.status === 422) {
        // Label doesn't exist — retry without labels
        const retryRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'User-Agent': 'NoLoginTools-Notifier/1.0',
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body }),
        });
        if (!retryRes.ok) {
          const retryBody = await retryRes.text().catch(() => '');
          let retryMsg = '';
          try { retryMsg = JSON.parse(retryBody)?.message || retryBody; } catch { retryMsg = retryBody; }
          throw new GitHubApiError(`GitHub API ${retryRes.status}: ${retryMsg}`, retryRes.status, retryMsg);
        }
        const retryData = await retryRes.json() as { html_url: string; number: number };
        console.log(`[GitHub] Issue created (no labels): ${retryData.html_url}`);
        return { issueUrl: retryData.html_url, issueNumber: retryData.number };
      }

      throw new GitHubApiError(`GitHub API ${res.status}: ${ghMessage}`, res.status, ghMessage);
    }

    const data = await res.json() as { html_url: string; number: number };
    console.log(`[GitHub] Issue created: ${data.html_url}`);
    return { issueUrl: data.html_url, issueNumber: data.number };
  } catch (err) {
    console.error(`[GitHub] Failed to create issue for ${owner}/${repo}:`, err);
    throw err;
  }
}
