// @ts-check
/**
 * Prepare a tool discovery topic and generate a GitHub Issue body for the auto-tool pipeline.
 *
 * Usage:
 *   node scripts/prepare-tool-discovery.mjs
 *
 * Env vars:
 *   CATEGORY_HINT (optional) — suggest a specific category
 *
 * Output:
 *   - Writes Issue body to /tmp/tool-issue-body.md
 *   - Sets `title` via GITHUB_OUTPUT
 *   - Logs to stderr for debugging
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// TAG_DEFINITIONS categories (from shared tag-definitions.json)
// ---------------------------------------------------------------------------

const TAG_DEFINITIONS = JSON.parse(readFileSync(resolve(__dirname, 'tag-definitions.json'), 'utf-8'));
const CATEGORIES = TAG_DEFINITIONS.find((d) => d.key === 'category').values;

// ---------------------------------------------------------------------------
// 1. Read existing tools for deduplication
// ---------------------------------------------------------------------------

/**
 * @returns {{ name: string, url: string, slug: string }[]}
 */
export function readExistingTools() {
  const buildDataPath = resolve(ROOT, 'src/data/build-data.json');
  if (!existsSync(buildDataPath)) {
    console.error('[prepare-tool] build-data.json not found, existing tools list will be empty');
    return [];
  }
  try {
    const data = JSON.parse(readFileSync(buildDataPath, 'utf-8'));
    return (data.tools || []).map((t) => ({
      name: t.name,
      url: t.url,
      slug: t.slug,
    }));
  } catch (err) {
    console.error(`[prepare-tool] Failed to read build-data.json: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 2. Select category by day-of-year rotation
// ---------------------------------------------------------------------------

/**
 * Get the day of year (1-366) for a given date.
 * @param {Date} date
 * @returns {number}
 */
export function getDayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000) + 1;
}

/**
 * Select a category based on day rotation.
 * @param {Date} [date]
 * @param {string} [categoryHint]
 * @returns {string}
 */
export function selectCategory(date, categoryHint) {
  if (categoryHint && CATEGORIES.includes(categoryHint)) {
    return categoryHint;
  }

  const d = date || new Date();
  const dayOfYear = getDayOfYear(d);
  const index = dayOfYear % CATEGORIES.length;
  return CATEGORIES[index];
}

// ---------------------------------------------------------------------------
// 3. Read search queries from sources config
// ---------------------------------------------------------------------------

/**
 * @param {string} category
 * @returns {{ searchQueries: string[], sources: string[] }}
 */
export function getSearchConfig(category) {
  const sourcesPath = resolve(__dirname, 'tool-discovery-sources.json');
  try {
    const sources = JSON.parse(readFileSync(sourcesPath, 'utf-8'));
    const catConfig = sources.categories[category];
    if (catConfig) {
      return {
        searchQueries: catConfig.searchQueries || [],
        sources: catConfig.sources || [],
      };
    }
  } catch {
    // Fall through to defaults
  }
  return {
    searchQueries: [
      `free ${category.toLowerCase()} tools no login required`,
      `browser-based ${category.toLowerCase()} tools without signup`,
    ],
    sources: ['Product Hunt', 'GitHub trending', 'Hacker News'],
  };
}

// ---------------------------------------------------------------------------
// 4. Build Issue body
// ---------------------------------------------------------------------------

/**
 * Build the Issue body for Claude Code.
 * @param {object} params
 * @param {string} params.category
 * @param {{ searchQueries: string[], sources: string[] }} params.searchConfig
 * @param {{ name: string, url: string, slug: string }[]} params.existingTools
 * @returns {string}
 */
export function buildIssueBody({ category, searchConfig, existingTools }) {
  const today = new Date().toISOString().split('T')[0];

  const existingSection = existingTools.length > 0
    ? existingTools.map((t) => `- ${t.name} — ${t.url} (slug: ${t.slug})`).join('\n')
    : '- (none yet)';

  const searchSection = searchConfig.searchQueries
    .map((q) => `- "${q}"`)
    .join('\n');

  const sourcesSection = searchConfig.sources
    .map((s) => `- ${s}`)
    .join('\n');

  return `@claude Please discover and verify a new no-login tool.

## Today's Search Category
**${category}** — search for tools in this area

## Search Queries
${searchSection}

## Recommended Sources
${sourcesSection}

## Existing Tools (DO NOT submit duplicates)
${existingSection}

## Discovery Process

### Step 1: Search (WebSearch)
Use WebSearch to find 3-5 candidate tools in the **${category}** category. Prioritize:
- Tools from HN, ProductHunt, GitHub trending, "awesome" lists
- Active development, open source preferred
- Clear utility, not a clone of existing tools in our directory
- Tools that work directly in the browser without installation

### Step 2: Verify with Browser (Playwright MCP)
For EACH candidate, use the Playwright browser tools:
1. \`browser_navigate\` to the tool URL
2. \`browser_screenshot\` to see the page
3. \`browser_snapshot\` to check page structure
4. Try to use the core feature — click buttons, interact with the UI
5. Verify: can you use the tool WITHOUT logging in or signing up?

**Judgment criteria (use YOUR AI judgment, no hardcoded rules):**
- Does the page load and show functional content?
- Is there a login wall, signup modal, or auth redirect blocking you?
- Can you actually USE the core functionality without an account?
- Is this a quality tool worth recommending?
- Is it actively maintained (not abandoned)?
- Freemium is OK if core features work without login

If ALL candidates fail verification, skip to Step 4.

### Step 3: Create outputs
For the best verified tool, create TWO files:

**3a. Tool data JSON** → \`.github/auto-tools/{slug}.json\`:
\`\`\`json
{
  "name": "Tool Name",
  "url": "https://tool-url.com",
  "description": "A concise description of what the tool does (max 500 chars)",
  "coreTask": "The main thing this tool helps you do (max 200 chars)",
  "seoTitle": "Search result title for the tool page (max 80 chars)",
  "seoDescription": "Search result description that combines the tool and its no-login task (max 180 chars)",
  "seoFocusKeyword": "Primary keyword or query intent this tool page should target (max 120 chars)",
  "seoIntent": "task",
  "seoTaskPhrase": "A task-focused phrase that explicitly includes no-login intent, e.g. 'encrypt files in the browser without signup' (max 120 chars)",
  "tags": [
    { "key": "category", "value": "${category}" },
    { "key": "pricing", "value": "Free" },
    { "key": "type", "value": "Web App" }
  ],
  "repoUrl": "https://github.com/owner/repo (if open source, optional)",
  "twitterUrl": "https://x.com/handle (optional)",
  "githubUrl": "https://github.com/org (optional)",
  "discordUrl": "https://discord.gg/invite (optional)"
}
\`\`\`

**SEO rules for the JSON fields:**
- \`description\` is for the on-page summary
- \`seoDescription\` is for CTR in Google, and must combine the tool with its **no-login task**
- \`seoTaskPhrase\` MUST mention the zero-login angle explicitly ("without signup", "no account required", etc.)
- \`seoTitle\` should lead with the tool name, then the task
- \`seoIntent\` must be one of: \`task\`, \`review\`, \`alternative\`

**Valid tag keys and values:**
- \`category\`: AI, Design, Writing, Development, Productivity, Media, Privacy, Data, Communication, Education, Finance (REQUIRED, exactly one)
- \`data\`: Client-Side Only, Server-Side
- \`privacy\`: No Trackers, Privacy Focused
- \`type\`: PWA, Web App, CLI, Desktop App, Browser Extension
- \`hosting\`: Self-Hostable, Cloud Only
- \`offline\`: Works Offline, Online Only
- \`pricing\`: Free, Freemium, Ad-Supported

The \`{slug}\` is derived from the URL: take hostname+path, lowercase, replace non-alphanumeric with hyphens, strip leading/trailing hyphens.

**3b. Blog post** → \`src/content/blog/{slug}.md\`:

Write a blog post introducing the discovered tool.

\`\`\`yaml
---
title: "Your Title Here"
description: "A concise summary (120-160 chars)"
publishedAt: ${today}
author: "nologin.tools"
tags: ["tools", "review"]
featured: false
heroImageQuery: "relevant search term for hero image"
---
\`\`\`

**Writing guidelines:**
- 1500-2500 words
- Open with a hook — surprising fact, question, or contradiction
- Mix sentence lengths, use active voice, address reader as "you"
- Include at least 2 internal links (\`/tool/{slug}\` pages from existing tools above)
- Include at least 2 external links to authoritative sources
- Naturally work in "no-login tools", "privacy-friendly", "without signup"
- Start tool introduction with a concrete use scenario (NOT fabricated personal experience)
- 3-6 H2 headings, NEVER use "Introduction" or "Conclusion" as headings
- Include at least one of: blockquote, code snippet, comparison table
- End with a forward-looking thought or call to action

**Banned AI phrases:** delve, landscape (metaphor), seamless, leverage, robust, cutting-edge, game-changer, in conclusion, dive in, in today's digital age, harness, revolutionize, streamline, elevate, foster, spearhead, paradigm, synergy, navigate (metaphor), empower, unlock, comprehensive (self-referential), without further ado, it's worth noting, in this article we will

### Step 4: If no tool found
If ALL candidates fail verification or no suitable tools are found:
- Create \`.github/auto-tools/_skip-${today}.md\` with a brief explanation of what you searched and why nothing qualified
- Do NOT create a blog post or tool JSON
- This is perfectly fine — quality over quantity

### After writing
Just commit and push your changes. The CI workflow handles PR creation, hero images, and D1 submission automatically.
Do NOT run \`gh pr create\` or \`gh pr merge\`.
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.error('[prepare-tool] Starting tool discovery preparation...');

  const categoryHint = process.env.CATEGORY_HINT || '';
  const category = selectCategory(new Date(), categoryHint || undefined);
  console.error(`[prepare-tool] Selected category: ${category}`);

  const searchConfig = getSearchConfig(category);
  console.error(`[prepare-tool] Search queries: ${searchConfig.searchQueries.length}`);

  const existingTools = readExistingTools();
  console.error(`[prepare-tool] Found ${existingTools.length} existing tool(s) for dedup`);

  const body = buildIssueBody({ category, searchConfig, existingTools });

  const title = `[Auto Tool] Discover ${category} tool`;

  // Write body to temp file
  writeFileSync('/tmp/tool-issue-body.md', body);
  console.error('[prepare-tool] Issue body written to /tmp/tool-issue-body.md');

  // Set GitHub Actions output
  const ghOutput = process.env.GITHUB_OUTPUT;
  if (ghOutput) {
    appendFileSync(ghOutput, `title=${title}\n`);
    console.error(`[prepare-tool] Set GITHUB_OUTPUT title: ${title}`);
  } else {
    // Local testing
    console.log(JSON.stringify({ title, bodyFile: '/tmp/tool-issue-body.md' }, null, 2));
  }
}

// Only run main when executed directly (not imported for testing)
const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/prepare-tool-discovery.mjs'));

if (isMainModule) {
  main().catch((err) => {
    console.error(`[prepare-tool] Fatal error: ${err.message}`);
    process.exit(1);
  });
}
