// @ts-check

/**
 * Parse a GitHub repository URL and extract owner/repo.
 * Supports formats like:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/tree/main/...
 * @param {string} url
 * @returns {{ owner: string; repo: string } | null}
 */
export function parseGitHubRepoUrl(url) {
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
export function validateTwitterUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'twitter.com' || parsed.hostname === 'www.twitter.com'
      || parsed.hostname === 'x.com' || parsed.hostname === 'www.x.com';
  } catch {
    return false;
  }
}

/** Validate a GitHub profile URL (github.com/{username}). */
export function validateGitHubProfileUrl(url) {
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
export function validateDiscordUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'discord.gg' || parsed.hostname === 'discord.com'
      || parsed.hostname === 'www.discord.com' || parsed.hostname === 'www.discord.gg';
  } catch {
    return false;
  }
}

export class GitHubApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {string} [ghMessage]
   */
  constructor(message, status, ghMessage) {
    super(message);
    this.status = status;
    this.ghMessage = ghMessage;
  }
}

/**
 * Create a GitHub Issue notifying a repo that their tool has been verified.
 * Returns issue URL and number on success, or null on failure.
 * Throws on 410 Gone (issues disabled).
 * @param {string} owner
 * @param {string} repo
 * @param {string} toolName
 * @param {string} toolUrl
 * @param {string} toolSlug
 * @param {string} siteUrl
 * @param {string} githubToken
 * @returns {Promise<{ issueUrl: string; issueNumber: number } | null>}
 */
export async function createGitHubNotificationIssue(
  owner,
  repo,
  toolName,
  toolUrl,
  toolSlug,
  siteUrl,
  githubToken
) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const badgeUrl = `${siteUrl}/badges/flat.svg`;
  const badgePageUrl = `${siteUrl}/badge/${toolSlug}`;
  const toolPageUrl = `${siteUrl}/tool/${toolSlug}`;

  const title = `[NoLogin Verified] ${toolName} has been verified by nologin.tools`;
  const body = `## 🎉 Congratulations!

**${toolName}** has been officially certified under the [NLW-STD-001 Verification Standard](https://nologintools.org/standards) by [NoLoginTools.org](https://nologintools.org) and listed on [nologin.tools](${siteUrl}).

### What is NoLogin Verified?

[NoLogin Verified](${siteUrl}/badge) confirms that your tool delivers immediate, zero-barrier utility:
- ✅ Full access to core features without requiring sign-up or account creation
- ✅ Zero unnecessary personal data collection or tracking walls
- ✅ Continuous 6-hour automated uptime and reachability monitoring

### Unlock Level 3 Active Privileges (+4 Ranking Boost & 🛡️ Shield)

Displaying the verified badge unlocks **Level 3 Active Exhibitor** status:
- 🚀 **+4 Algorithm Ranking Boost** for priority placement in category and directory searches
- 🛡️ **Green Shield Badge** displayed prominently next to your tool name across nologin.tools
- ⚡ **Instant Self-Service Verification**: Once merged, visit your certificate page to verify instantly!

#### 🚀 1-Click README Integration

👉 **[Click here to edit your README directly in GitHub's web editor](https://github.com/${owner}/${repo}/edit/HEAD/README.md)**

Add this markdown snippet to your \`README.md\`:

[![Verified by NoLoginTools.org](${badgeUrl})](${badgePageUrl})

\`\`\`markdown
[![Verified by NoLoginTools.org](${badgeUrl})](${badgePageUrl})
\`\`\`

#### For your Website Footer or Landing Page

\`\`\`html
<a href="${badgePageUrl}" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="Verified by NoLoginTools.org" title="Verified by NoLoginTools.org" />
</a>
\`\`\`

### Digital Trust Certificate & 13 Badge Styles

- **Instant Badge Verification & 13 Styles**: [${badgePageUrl}#embed](${badgePageUrl}#embed)
- **Live Trust Certificate**: [${badgePageUrl}](${badgePageUrl})
- **Directory Listing**: [${toolPageUrl}](${toolPageUrl})
- **Official Specification**: [NLW-STD-001 Standard](https://nologintools.org/standards)

---

*This is a one-time notification from [NoLoginTools.org](https://nologintools.org) & [nologin.tools](${siteUrl}). Feel free to close this issue if you are not interested.*`;

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

    if (res.status === 410) {
      console.warn(`[GitHub] Issues disabled on ${owner}/${repo} (410 Gone)`);
      throw new GitHubApiError(`Issues disabled on ${owner}/${repo}`, 410);
    }

    if (!res.ok) {
      if (res.status === 422 || res.status === 403) {
        // Retry without labels if repository doesn't allow external label assignment
        console.log(`[GitHub] Retrying issue creation on ${owner}/${repo} without labels...`);
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
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          return {
            issueUrl: retryData.html_url,
            issueNumber: retryData.number,
          };
        }
      }
      const errData = await res.json().catch(() => ({}));
      console.warn(`[GitHub] Failed to create issue on ${owner}/${repo}: ${res.status}`, errData);
      return null;
    }

    const data = await res.json();
    return {
      issueUrl: data.html_url,
      issueNumber: data.number,
    };
  } catch (err) {
    if (err instanceof GitHubApiError) throw err;
    console.error(`[GitHub] Exception creating issue on ${owner}/${repo}:`, err);
    return null;
  }
}
