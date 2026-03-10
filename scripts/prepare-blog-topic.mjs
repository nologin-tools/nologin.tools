// @ts-check
/**
 * Prepare a blog topic and generate a GitHub Issue body for the auto-blog pipeline.
 *
 * Usage:
 *   node scripts/prepare-blog-topic.mjs
 *
 * Env vars:
 *   TOPIC_HINT (optional) — suggest a specific topic
 *
 * Output:
 *   - Writes Issue body to /tmp/blog-issue-body.md
 *   - Sets `title` via GITHUB_OUTPUT
 *   - Logs to stderr for debugging
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Read existing blog posts for deduplication
// ---------------------------------------------------------------------------

/** @returns {{ slug: string, title: string, tags: string[] }[]} */
function readExistingPosts() {
  const blogDir = resolve(ROOT, 'src/content/blog');
  if (!existsSync(blogDir)) return [];

  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  return files.map((f) => {
    const content = readFileSync(resolve(blogDir, f), 'utf-8');
    const slug = f.replace(/\.md$/, '');
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const tagsMatch = content.match(/^tags:\s*\[([^\]]*)\]/m);
    const title = titleMatch ? titleMatch[1] : slug;
    const tags = tagsMatch
      ? tagsMatch[1]
          .split(',')
          .map((t) => t.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean)
      : [];
    return { slug, title, tags };
  });
}

// ---------------------------------------------------------------------------
// 2. Select topic category
// ---------------------------------------------------------------------------

/**
 * Pick the least-covered category, considering time-based roundups.
 * @param {{ slug: string, title: string, tags: string[] }[]} existingPosts
 * @returns {{ id: string, name: string, description: string, examples: string[], topic: string }}
 */
function selectCategory(existingPosts) {
  const topicsData = JSON.parse(
    readFileSync(resolve(__dirname, 'blog-topics.json'), 'utf-8')
  );
  const categories = topicsData.categories;

  const now = new Date();
  const day = now.getUTCDate();
  const month = now.getUTCMonth() + 1; // 1-indexed

  // Time-based roundups: month start (1-3) or quarter start (1/4/7/10 month, days 1-5)
  const isMonthStart = day >= 1 && day <= 3;
  const isQuarterStart = [1, 4, 7, 10].includes(month) && day >= 1 && day <= 5;

  if (isQuarterStart || isMonthStart) {
    const roundupCat = categories.find((c) => c.id === 'time-roundups');
    if (roundupCat) {
      const period = isQuarterStart ? 'quarter' : 'month';
      const prevMonth = month === 1 ? 12 : month - 1;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const quarterNames = ['Q4', 'Q1', 'Q1', 'Q1', 'Q2', 'Q2', 'Q2', 'Q3', 'Q3', 'Q3', 'Q4', 'Q4'];
      const topic =
        period === 'quarter'
          ? `${quarterNames[prevMonth - 1]} ${prevMonth >= month ? now.getUTCFullYear() - 1 : now.getUTCFullYear()} roundup: best no-login tools of the quarter`
          : `${monthNames[prevMonth - 1]} ${prevMonth > month ? now.getUTCFullYear() - 1 : now.getUTCFullYear()} roundup: best new no-login tools`;
      return { ...roundupCat, topic };
    }
  }

  // Count coverage per category based on existing post tags
  const coverageCount = {};
  for (const cat of categories) {
    coverageCount[cat.id] = 0;
  }
  for (const post of existingPosts) {
    for (const tag of post.tags) {
      const normalized = tag.toLowerCase().replace(/\s+/g, '-');
      if (coverageCount[normalized] !== undefined) {
        coverageCount[normalized]++;
      }
    }
  }

  // Sort by least coverage, pick least covered
  const sorted = categories
    .filter((c) => c.id !== 'time-roundups')
    .sort((a, b) => (coverageCount[a.id] || 0) - (coverageCount[b.id] || 0));

  // Among equally least-covered, pick randomly
  const minCount = coverageCount[sorted[0].id] || 0;
  const leastCovered = sorted.filter((c) => (coverageCount[c.id] || 0) === minCount);
  const chosen = leastCovered[Math.floor(Math.random() * leastCovered.length)];

  // Pick a random example as starting topic
  const topic = chosen.examples[Math.floor(Math.random() * chosen.examples.length)];

  return { ...chosen, topic };
}

// ---------------------------------------------------------------------------
// 3. Fetch Hacker News trending topics (optional, best-effort)
// ---------------------------------------------------------------------------

/**
 * Simple HTTPS GET returning JSON.
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<any>}
 */
function fetchJson(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON from ${url}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

/**
 * Fetch relevant HN stories.
 * @returns {Promise<{ title: string, url: string }[]>}
 */
async function fetchHNTrending() {
  try {
    const topicsData = JSON.parse(
      readFileSync(resolve(__dirname, 'blog-topics.json'), 'utf-8')
    );
    const keywords = topicsData.hn_keywords.map((k) => k.toLowerCase());

    const storyIds = await fetchJson(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      5000
    );

    // Only check first 30 stories, fetch max 10
    const toCheck = storyIds.slice(0, 30);
    const results = [];

    for (const id of toCheck) {
      if (results.length >= 10) break;
      try {
        const story = await fetchJson(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          3000
        );
        if (!story || !story.title) continue;

        const titleLower = story.title.toLowerCase();
        const matches = keywords.some((kw) => titleLower.includes(kw));
        if (matches) {
          results.push({
            title: story.title,
            url: story.url || `https://news.ycombinator.com/item?id=${id}`,
          });
        }
      } catch {
        // Skip individual story fetch failures
      }
    }

    return results;
  } catch (err) {
    console.error(`[prepare-blog] HN fetch failed: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 4. Read build data for internal links
// ---------------------------------------------------------------------------

/** @returns {{ name: string, slug: string, description: string }[]} */
function readToolList() {
  const buildDataPath = resolve(ROOT, 'src/data/build-data.json');
  if (!existsSync(buildDataPath)) {
    console.error('[prepare-blog] build-data.json not found, skipping tool list');
    return [];
  }
  try {
    const data = JSON.parse(readFileSync(buildDataPath, 'utf-8'));
    return (data.tools || [])
      .filter((t) => t.status === 'approved')
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        description: t.description || '',
      }));
  } catch (err) {
    console.error(`[prepare-blog] Failed to read build-data.json: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 5. Assemble Issue content
// ---------------------------------------------------------------------------

/**
 * Build the Issue body with all context and instructions.
 */
function buildIssueBody({ category, existingPosts, hnTrending, toolList, topicHint }) {
  const topic = topicHint || category.topic;

  const existingSection = existingPosts.length
    ? existingPosts.map((p) => `- ${p.slug}: "${p.title}" [tags: ${p.tags.join(', ')}]`).join('\n')
    : '- (none yet)';

  const hnSection =
    hnTrending.length > 0
      ? hnTrending.map((s) => `- [${s.title}](${s.url})`).join('\n')
      : '- No relevant trending topics found today. Use the suggested topic above.';

  const toolSection =
    toolList.length > 0
      ? toolList
          .map((t) => `- /tool/${t.slug} — ${t.name}${t.description ? ` (${t.description.slice(0, 60)})` : ''}`)
          .join('\n')
      : '- (no tools data available — skip internal links)';

  const today = new Date().toISOString().split('T')[0];

  return `@claude Please write a blog post for nologin.tools based on the instructions below.

## Topic
${topic}

## Category
${category.id} (${category.name})

## Trending Context
${hnSection}

## Existing Posts (DO NOT duplicate)
${existingSection}

## Available Tools for Internal Links
${toolSection}

## Writing Instructions

### File location
Save the blog post to \`src/content/blog/{slug}.md\` where \`{slug}\` is a short, URL-friendly version of the title (lowercase, hyphens, no special chars).

### Frontmatter format
\`\`\`yaml
---
title: "Your Title Here"          # 50-70 characters
description: "A concise summary"  # 120-160 characters
publishedAt: ${today}
author: "nologin.tools"
tags: ["tag1", "tag2"]            # 2-5 tags from: privacy, tools, tutorial, comparison, review, open-source, browser, guide, analysis, roundup, alternatives
featured: false
---
\`\`\`

### Writing style (CRITICAL — zero AI feel)

**Banned phrases** — do NOT use any of these:
delve, landscape (as metaphor), "in this article we will", "it's worth noting", "in conclusion", "game-changer", "seamless", "leverage", "robust", "cutting-edge", "navigate" (as metaphor), "empower", "unlock", "comprehensive" (self-referential), "without further ado", "dive in", "in today's digital age", "harness", "revolutionize", "streamline", "elevate", "foster", "spearhead", "paradigm", "synergy"

**Do this instead:**
- Open with a hook: a surprising fact, a question, a short story, or a contradiction
- Mix sentence lengths — short punchy ones between longer ones
- Use active voice and address the reader as "you"; use "I" for opinions
- Name specific tools with URLs and concrete use cases
- Take a stance — "X is better than Y because..." is good
- Use parenthetical asides for personality (like this)
- Fragment sentences are fine. They add rhythm.
- 3-6 H2 headings, NEVER use "Introduction" or "Conclusion" as headings
- Paragraphs: 2-4 sentences max, minimize bullet lists
- Include at least one of: blockquote, code snippet, comparison table
- End with a forward-looking thought or call to action, not a summary

### Content requirements
- **Word count**: 1500-2500 words
- **Internal links**: Include at least 2 links to \`/tool/{slug}\` pages or \`/blog/{slug}\` posts from the lists above
- **External links**: Include at least 2 links to authoritative external sources
- **Keywords**: Naturally work in "no-login tools", "privacy-friendly", "without signup" throughout the post
- Research the topic using WebSearch to include accurate, current information

### Image
Use Unsplash API to download a relevant hero image:
\`\`\`bash
mkdir -p public/blog/images/{slug}/
curl -s "https://api.unsplash.com/photos/random?query={relevant+search+term}&orientation=landscape&w=1200" \\
  -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY" \\
  | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.urls.regular)" \\
  | xargs -I {} curl -sL -o public/blog/images/{slug}/hero.jpg "{}"
\`\`\`
Then add the image right after frontmatter:
\`\`\`markdown
![descriptive alt text](/blog/images/{slug}/hero.jpg)
\`\`\`
If Unsplash API is unavailable (no API key or error), skip the image — the post is still valid without one.

### Publish steps
1. Create branch: \`blog/${today}-{slug}\`
2. \`git add src/content/blog/{slug}.md public/blog/images/\` (if image exists)
3. \`git commit -m "feat(blog): add post — {title}"\`
4. \`git push origin blog/${today}-{slug}\`
5. \`gh pr create --title "Blog: {title}" --label "auto-blog" --base main\`
6. \`gh pr merge --auto --squash\`
7. Close this issue with a comment summarizing what was written
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.error('[prepare-blog] Starting topic preparation...');

  const existingPosts = readExistingPosts();
  console.error(`[prepare-blog] Found ${existingPosts.length} existing post(s)`);

  const category = selectCategory(existingPosts);
  console.error(`[prepare-blog] Selected category: ${category.id} (${category.name})`);

  const hnTrending = await fetchHNTrending();
  console.error(`[prepare-blog] Found ${hnTrending.length} relevant HN stories`);

  const toolList = readToolList();
  console.error(`[prepare-blog] Found ${toolList.length} approved tool(s) for internal links`);

  const topicHint = process.env.TOPIC_HINT || '';

  const body = buildIssueBody({
    category,
    existingPosts,
    hnTrending,
    toolList,
    topicHint: topicHint || '',
  });

  const title = `[Auto Blog] ${topicHint || category.topic}`;

  // Write body to temp file for gh issue create --body-file
  writeFileSync('/tmp/blog-issue-body.md', body);
  console.error('[prepare-blog] Issue body written to /tmp/blog-issue-body.md');

  // Set GitHub Actions output
  const ghOutput = process.env.GITHUB_OUTPUT;
  if (ghOutput) {
    appendFileSync(ghOutput, `title=${title}\n`);
    console.error(`[prepare-blog] Set GITHUB_OUTPUT title: ${title}`);
  } else {
    // Local testing: print to stdout
    console.log(JSON.stringify({ title, bodyFile: '/tmp/blog-issue-body.md' }, null, 2));
  }
}

main().catch((err) => {
  console.error(`[prepare-blog] Fatal error: ${err.message}`);
  process.exit(1);
});
