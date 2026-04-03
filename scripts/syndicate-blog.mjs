// @ts-check
/**
 * Syndicate a new blog post to Dev.to, Mastodon, and Bluesky.
 *
 * Usage:
 *   node scripts/syndicate-blog.mjs                        # auto-detect new post via git diff
 *   node scripts/syndicate-blog.mjs --file path/to/post.md # specify post file directly
 *
 * Environment variables:
 *   DEV_TO_API_KEY          — Dev.to API key
 *   MASTODON_INSTANCE_URL   — Mastodon instance (e.g. https://fosstodon.org)
 *   MASTODON_ACCESS_TOKEN   — Mastodon OAuth token (scope: write:statuses, write:media)
 *   BLUESKY_HANDLE          — Bluesky handle (e.g. nologintools.bsky.social)
 *   BLUESKY_APP_PASSWORD    — Bluesky app password
 *   GITHUB_STEP_SUMMARY     — GitHub Actions step summary file (auto-set in CI)
 *
 * Exit code:
 *   0 — success or no new post found
 *   1 — all platforms failed
 */

import { readFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_URL = 'https://nologin.tools';

// ---------------------------------------------------------------------------
// Frontmatter parser
// ---------------------------------------------------------------------------

/**
 * Parse YAML frontmatter from markdown content.
 * @param {string} content
 * @returns {{ frontmatter: Record<string, any> | null, body: string }}
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of raw.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;

    const [, key, val] = kv;
    let value = val.trim();

    // Parse arrays: ["a", "b"]
    if (value.startsWith('[')) {
      try {
        value = JSON.parse(value);
      } catch {
        value = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    }
    // Strip quotes
    else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Booleans
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

// ---------------------------------------------------------------------------
// Dev.to helpers
// ---------------------------------------------------------------------------

/** @type {Record<string, string>} */
const DEVTO_TAG_MAP = {
  'tools': 'webdev',
  'review': 'review',
  'browser': 'browser',
  'privacy': 'privacy',
  'comparison': 'comparison',
  'open-source': 'opensource',
  'tutorial': 'tutorial',
  'guide': 'tutorial',
  'analysis': 'webdev',
  'alternatives': 'productivity',
  'ai': 'ai',
  'development': 'programming',
  'design': 'design',
  'security': 'security',
  'encryption': 'security',
  'media': 'webdev',
  'audio': 'webdev',
  'finance': 'productivity',
  'education': 'learning',
  'writing': 'writing',
  'roundup': 'webdev',
  'announcement': 'news',
  'productivity': 'productivity',
};

/**
 * Map blog tags to Dev.to tags (max 4, always includes "nologin").
 * @param {string[]} blogTags
 * @returns {string[]}
 */
export function mapTagsForDevto(blogTags) {
  const mapped = blogTags
    .map((t) => DEVTO_TAG_MAP[t.toLowerCase()] || null)
    .filter(Boolean);
  const unique = [...new Set(['nologin', ...mapped])];
  return unique.slice(0, 4);
}

/**
 * Convert relative markdown URLs to absolute.
 * @param {string} body
 * @returns {string}
 */
export function prepareDevtoBody(body) {
  return body
    .replace(/\]\(\s*\//g, `](${SITE_URL}/`)
    .trim();
}

// ---------------------------------------------------------------------------
// Mastodon helpers
// ---------------------------------------------------------------------------

/**
 * Format a Mastodon status post.
 * @param {{ title: string, description: string, url: string, tags: string[] }} params
 * @returns {string}
 */
export function formatMastodonPost({ title, description, url, tags }) {
  const hashtags = tags
    .slice(0, 5)
    .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`)
    .join(' ');

  return `${title}\n\n${description}\n\n${url}\n\n${hashtags}`;
}

// ---------------------------------------------------------------------------
// Bluesky helpers
// ---------------------------------------------------------------------------

/**
 * Format a Bluesky post (max 300 graphemes).
 * @param {{ title: string, description: string, url: string }} params
 * @returns {string}
 */
export function formatBlueskyPost({ title, description, url }) {
  const base = `${title}\n\n${url}`;
  if (base.length >= 300) {
    // Title + URL already at limit, truncate title
    const maxTitle = 300 - url.length - 4; // 4 = \n\n×2 not needed, just \n\n
    return `${title.slice(0, maxTitle - 1)}\u2026\n\n${url}`;
  }

  const maxDescLength = 300 - title.length - url.length - 6; // \n\n × 3
  if (maxDescLength <= 0) return base;

  let desc = description;
  if (desc.length > maxDescLength) {
    desc = desc.slice(0, maxDescLength - 1) + '\u2026';
  }

  return `${title}\n\n${desc}\n\n${url}`;
}

/**
 * Build Bluesky rich text facets for a URL in the post text.
 * @param {string} text
 * @param {string} url
 * @returns {Array<{ index: { byteStart: number, byteEnd: number }, features: Array<{ $type: string, uri: string }> }>}
 */
export function buildBlueskyFacets(text, url) {
  const urlStart = text.indexOf(url);
  if (urlStart === -1) return [];

  const encoder = new TextEncoder();
  const byteStart = encoder.encode(text.slice(0, urlStart)).length;
  const byteEnd = byteStart + encoder.encode(url).length;

  return [{
    index: { byteStart, byteEnd },
    features: [{
      $type: 'app.bsky.richtext.facet#link',
      uri: url,
    }],
  }];
}

// ---------------------------------------------------------------------------
// Blog post detection
// ---------------------------------------------------------------------------

/**
 * Detect newly added blog post via git diff.
 * @returns {string | null} — file path relative to repo root, or null
 */
export function detectNewBlogPost() {
  try {
    const diff = execSync(
      'git diff HEAD~1 --name-only --diff-filter=A -- src/content/blog/*.md',
      { encoding: 'utf-8', cwd: ROOT }
    ).trim();

    if (!diff) return null;

    const files = diff.split('\n').filter(Boolean);
    if (files.length > 1) {
      console.error(`[syndicate] Multiple new blog posts detected, using first: ${files[0]}`);
    }

    return files[0] || null;
  } catch {
    return null;
  }
}

/**
 * Extract slug from a blog file path.
 * @param {string} filePath — e.g. "src/content/blog/my-post.md"
 * @returns {string}
 */
export function extractSlug(filePath) {
  return basename(filePath, '.md');
}

// ---------------------------------------------------------------------------
// Platform syndication functions
// ---------------------------------------------------------------------------

/**
 * @typedef {{ platform: string, status: 'success' | 'skipped' | 'error', url?: string, reason?: string }} SyndicationResult
 */

/**
 * Syndicate to Dev.to (full article with canonical_url).
 * @param {{ title: string, description: string, body: string, tags: string[], slug: string }} params
 * @returns {Promise<SyndicationResult>}
 */
async function syndicateToDevto({ title, description, body, tags, slug }) {
  const apiKey = process.env.DEV_TO_API_KEY;
  if (!apiKey) {
    return { platform: 'devto', status: 'skipped', reason: 'DEV_TO_API_KEY not set' };
  }

  const canonicalUrl = `${SITE_URL}/blog/${slug}`;

  // Idempotency: check if article already exists
  try {
    const searchRes = await fetch('https://dev.to/api/articles/me/published?per_page=1000', {
      headers: { 'api-key': apiKey },
    });
    if (searchRes.ok) {
      const existing = await searchRes.json();
      if (existing.some((/** @type {any} */ a) => a.canonical_url === canonicalUrl)) {
        return { platform: 'devto', status: 'skipped', reason: 'Already published' };
      }
    }
  } catch {
    // Non-blocking: proceed with posting
    console.error('[syndicate] Dev.to idempotency check failed, proceeding');
  }

  const devtoTags = mapTagsForDevto(tags);
  const devtoBody = prepareDevtoBody(body);

  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: devtoBody,
        published: true,
        canonical_url: canonicalUrl,
        description,
        tags: devtoTags,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { platform: 'devto', status: 'error', reason: `${res.status}: ${errText}` };
  }

  const data = await res.json();
  return { platform: 'devto', status: 'success', url: data.url };
}

/**
 * Download hero image as Buffer from the deployed site.
 * @param {string} slug
 * @returns {Promise<Buffer | null>}
 */
async function fetchHeroImage(slug) {
  const heroUrl = `${SITE_URL}/blog/images/${slug}/hero.jpg`;
  try {
    const res = await fetch(heroUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Syndicate to Mastodon (social post with hero image).
 * @param {{ title: string, description: string, slug: string, tags: string[] }} params
 * @returns {Promise<SyndicationResult>}
 */
async function syndicateToMastodon({ title, description, slug, tags }) {
  const instanceUrl = process.env.MASTODON_INSTANCE_URL;
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  if (!instanceUrl || !accessToken) {
    return { platform: 'mastodon', status: 'skipped', reason: 'MASTODON credentials not set' };
  }

  const baseUrl = instanceUrl.replace(/\/$/, '');
  const blogUrl = `${SITE_URL}/blog/${slug}`;
  const statusText = formatMastodonPost({ title, description, url: blogUrl, tags });

  // Try to upload hero image
  let mediaId = null;
  const heroImage = await fetchHeroImage(slug);
  if (heroImage) {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([heroImage], { type: 'image/jpeg' }), 'hero.jpg');
      formData.append('description', title);

      const mediaRes = await fetch(`${baseUrl}/api/v2/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        mediaId = mediaData.id;
        console.error(`[syndicate] Mastodon image uploaded: ${mediaId}`);
      } else {
        console.error(`[syndicate] Mastodon image upload failed: ${mediaRes.status}`);
      }
    } catch (err) {
      console.error(`[syndicate] Mastodon image upload error: ${err.message}`);
    }
  }

  // Post status
  const statusBody = { status: statusText, visibility: 'public' };
  if (mediaId) statusBody.media_ids = [mediaId];

  const res = await fetch(`${baseUrl}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { platform: 'mastodon', status: 'error', reason: `${res.status}: ${errText}` };
  }

  const data = await res.json();
  return { platform: 'mastodon', status: 'success', url: data.url };
}

/**
 * Syndicate to Bluesky (social post with link card).
 * @param {{ title: string, description: string, slug: string }} params
 * @returns {Promise<SyndicationResult>}
 */
async function syndicateToBluesky({ title, description, slug }) {
  const handle = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  if (!handle || !appPassword) {
    return { platform: 'bluesky', status: 'skipped', reason: 'BLUESKY credentials not set' };
  }

  const blogUrl = `${SITE_URL}/blog/${slug}`;

  // Step 1: Authenticate
  const authRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  });

  if (!authRes.ok) {
    const errText = await authRes.text();
    return { platform: 'bluesky', status: 'error', reason: `Auth failed: ${authRes.status}: ${errText}` };
  }

  const session = await authRes.json();
  const pdsUrl = session.didDoc?.service?.[0]?.serviceEndpoint || 'https://bsky.social';

  // Step 2: Build post text and facets
  const postText = formatBlueskyPost({ title, description, url: blogUrl });
  const facets = buildBlueskyFacets(postText, blogUrl);

  // Step 3: Build external embed (link card)
  const embed = {
    $type: 'app.bsky.embed.external',
    external: {
      uri: blogUrl,
      title,
      description,
    },
  };

  // Try to upload hero image as thumbnail
  const heroImage = await fetchHeroImage(slug);
  if (heroImage) {
    try {
      const uploadRes = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.uploadBlob`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'Content-Type': 'image/jpeg',
        },
        body: heroImage,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        embed.external.thumb = uploadData.blob;
        console.error('[syndicate] Bluesky thumbnail uploaded');
      }
    } catch {
      console.error('[syndicate] Bluesky thumbnail upload failed (non-blocking)');
    }
  }

  // Step 4: Create post
  const postRes = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: postText,
        facets,
        embed,
        createdAt: new Date().toISOString(),
      },
    }),
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    return { platform: 'bluesky', status: 'error', reason: `Post failed: ${postRes.status}: ${errText}` };
  }

  const postData = await postRes.json();
  const rkey = postData.uri?.split('/')?.pop();
  const webUrl = rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : postData.uri;

  return { platform: 'bluesky', status: 'success', url: webUrl };
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse CLI arguments.
 * @param {string[]} argv
 * @returns {{ file: string }}
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  let file = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      file = args[i + 1];
      i++;
    }
  }

  return { file };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { file: manualFile } = parseArgs(process.argv);

  // Determine which blog post to syndicate
  let blogFilePath;
  if (manualFile) {
    blogFilePath = manualFile;
    console.error(`[syndicate] Manual mode: ${blogFilePath}`);
  } else {
    const detected = detectNewBlogPost();
    if (!detected) {
      console.log('[syndicate] No new blog post detected, exiting');
      process.exit(0);
    }
    blogFilePath = detected;
    console.error(`[syndicate] Auto-detected: ${blogFilePath}`);
  }

  // Read and parse the blog post
  const fullPath = resolve(ROOT, blogFilePath);
  let content;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch {
    console.error(`[syndicate] Cannot read file: ${fullPath}`);
    process.exit(1);
  }

  const { frontmatter, body } = parseFrontmatter(content);
  if (!frontmatter || !frontmatter.title) {
    console.error('[syndicate] Invalid frontmatter or missing title');
    process.exit(1);
  }

  const slug = extractSlug(blogFilePath);
  const title = String(frontmatter.title);
  const description = String(frontmatter.description || '');
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];

  console.error(`[syndicate] Syndicating: "${title}" (${slug})`);

  // Run all three platforms in parallel
  const results = await Promise.allSettled([
    syndicateToDevto({ title, description, body, tags, slug }),
    syndicateToMastodon({ title, description, slug, tags }),
    syndicateToBluesky({ title, description, slug }),
  ]);

  // Collect outcomes
  const platformNames = ['devto', 'mastodon', 'bluesky'];
  const outcomes = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { platform: platformNames[i], status: /** @type {const} */ ('error'), reason: r.reason?.message || 'Unknown error' };
  });

  // Report results
  let hasErrors = false;
  for (const outcome of outcomes) {
    const icon = outcome.status === 'success' ? '[OK]' :
                 outcome.status === 'skipped' ? '[SKIP]' : '[FAIL]';
    console.log(`${icon} ${outcome.platform}: ${outcome.url || outcome.reason || ''}`);
    if (outcome.status === 'error') hasErrors = true;
  }

  // GitHub Actions step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const rows = outcomes.map((o) => {
      const emoji = o.status === 'success' ? ':white_check_mark:' :
                    o.status === 'skipped' ? ':next_track_button:' : ':x:';
      const detail = o.url ? `[Link](${o.url})` : (o.reason || '-');
      return `| ${emoji} | ${o.platform} | ${o.status} | ${detail} |`;
    });
    const summary = [
      '## Blog Syndication Results',
      '',
      `**Post:** ${title}`,
      '',
      '| | Platform | Status | Details |',
      '|---|---|---|---|',
      ...rows,
      '',
    ].join('\n');

    try {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    } catch {
      // Non-blocking
    }
  }

  // Exit with error only if ALL platforms failed
  const allFailed = outcomes.every((o) => o.status === 'error');
  if (allFailed) process.exit(1);
}

// Only run main when executed directly
const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/syndicate-blog.mjs'));

if (isMainModule) {
  main();
}
