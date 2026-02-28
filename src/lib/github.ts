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
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'NoLoginTools-GitHubFetcher/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json() as {
      stargazers_count: number;
      forks_count: number;
      license: { spdx_id: string } | null;
      language: string | null;
      updated_at: string;
    };

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      license: data.license?.spdx_id || null,
      language: data.language,
      updatedAt: new Date(data.updated_at),
    };
  } catch {
    return null;
  }
}
