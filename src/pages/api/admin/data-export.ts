export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, tags, dataExports } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { TAG_DEFINITIONS } from '../../../lib/tags';

const CATEGORY_ORDER = TAG_DEFINITIONS.find((d) => d.key === 'category')!.values;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { secret } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  if (!env.GITHUB_TOKEN) {
    return api.error('GITHUB_TOKEN not configured.', 500);
  }

  // Query approved tools
  const approvedTools = await db
    .select({
      id: tools.id,
      slug: tools.slug,
      name: tools.name,
      url: tools.url,
      description: tools.description,
      coreTask: tools.coreTask,
      isFeatured: tools.isFeatured,
      repoUrl: tools.repoUrl,
      githubStars: tools.githubStars,
      githubLanguage: tools.githubLanguage,
      githubLicense: tools.githubLicense,
    })
    .from(tools)
    .where(eq(tools.status, 'approved'))
    .orderBy(tools.name);

  // Query tags for approved tools only
  const allTags = await db
    .select({
      toolId: tags.toolId,
      tagKey: tags.tagKey,
      tagValue: tags.tagValue,
    })
    .from(tags)
    .innerJoin(tools, eq(tools.id, tags.toolId))
    .where(eq(tools.status, 'approved'));

  const tagMap = new Map<number, { key: string; value: string }[]>();
  for (const tag of allTags) {
    if (!tagMap.has(tag.toolId)) tagMap.set(tag.toolId, []);
    tagMap.get(tag.toolId)!.push({ key: tag.tagKey, value: tag.tagValue });
  }

  const toolsList = approvedTools.map((t) => {
    const toolTags = tagMap.get(t.id) || [];
    const category = toolTags.find((tag) => tag.key === 'category')?.value || null;
    return {
      slug: t.slug,
      name: t.name,
      url: t.url,
      description: t.description,
      coreTask: t.coreTask,
      category,
      featured: t.isFeatured || false,
      repoUrl: t.repoUrl || null,
      githubStars: t.githubStars ?? null,
      githubLanguage: t.githubLanguage || null,
      githubLicense: t.githubLicense || null,
    };
  });

  // Generate files
  const toolsJson = JSON.stringify(toolsList, null, 2);
  const readme = generateReadme(toolsList);

  // Push to GitHub
  const repo = 'nologin-tools/awesome-nologin-tools';
  const token = env.GITHUB_TOKEN;

  const filesUpdated: string[] = [];
  let toolCount = toolsList.length;

  try {
    const jsonResult = await pushToGithub(token, repo, 'tools.json', toolsJson);
    if (jsonResult.updated) filesUpdated.push('tools.json');

    const readmeResult = await pushToGithub(token, repo, 'README.md', readme);
    if (readmeResult.updated) filesUpdated.push('README.md');

    // Record success
    await db.insert(dataExports).values({
      exportedAt: new Date(),
      toolCount,
      filesUpdated: JSON.stringify(filesUpdated),
      triggerSource: 'manual',
      status: 'success',
    });

    return api.success({
      toolCount,
      files: [
        { path: 'tools.json', updated: filesUpdated.includes('tools.json') },
        { path: 'README.md', updated: filesUpdated.includes('README.md') },
      ],
    });
  } catch (err: any) {
    // Record failure
    await db.insert(dataExports).values({
      exportedAt: new Date(),
      toolCount,
      filesUpdated: JSON.stringify(filesUpdated),
      triggerSource: 'manual',
      status: 'error',
      errorMessage: err.message?.slice(0, 500),
    });

    return api.error(`Export failed: ${err.message}`, 500);
  }
};

function generateReadme(
  tools: {
    name: string;
    url: string;
    description: string | null;
    coreTask: string;
    category: string | null;
    featured: boolean;
    repoUrl?: string | null;
    githubStars?: number | null;
  }[]
): string {
  const toolCount = tools.length;

  let md = `# Awesome NoLogin Tools\n\n`;
  md += `[![Awesome](https://img.shields.io/badge/Awesome-fc60a8?logo=awesomelists&logoColor=white)](https://github.com/nologin-tools/awesome-nologin-tools)\n`;
  md += `[![Tools](https://img.shields.io/badge/Tools-${toolCount}-4c1)](https://nologin.tools)\n`;
  md += `[![License: CC0](https://img.shields.io/badge/License-CC0_1.0-lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)\n`;
  md += `[![Website](https://img.shields.io/badge/nologin.tools-Visit-blue)](https://nologin.tools)\n`;
  md += `[![Submit a Tool](https://img.shields.io/badge/Submit_a_Tool-orange)](https://nologin.tools/submit)\n\n`;
  md += `[![NoLogin Verified](https://nologin.tools/badges/flat.svg)](https://nologin.tools/badge/awesome-nologin-tools)\n\n`;
  md += `> A curated list of privacy-friendly tools that work without requiring login or registration.\n`;
  md += `> Auto-generated from [nologin.tools](https://nologin.tools).\n\n`;
  md += `## Discover & Submit\n\n`;
  md += `Browse and search all tools at **[nologin.tools](https://nologin.tools)**.\n\n`;
  md += `Know a great tool that works without login? **[Submit it here](https://nologin.tools/submit)**!\n\n`;

  // Group by category
  const groups = new Map<string, typeof tools>();
  for (const tool of tools) {
    const cat = tool.category || 'Other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(tool);
  }

  // Output in defined order, then "Other" at the end
  const orderedCategories = [...CATEGORY_ORDER.filter((c) => groups.has(c))];
  if (groups.has('Other')) orderedCategories.push('Other');

  for (const cat of orderedCategories) {
    const catTools = groups.get(cat)!;
    md += `## ${cat}\n\n`;
    for (const tool of catTools) {
      const star = tool.featured ? ' ★' : '';
      const repoSuffix = tool.repoUrl ? ` ([Source](${tool.repoUrl})${tool.githubStars != null ? ` ⭐${tool.githubStars}` : ''})` : '';
      md += `- **[${tool.name}${star}](${tool.url})**${repoSuffix} — ${tool.description || tool.coreTask}\n`;
      md += `  > _No-login task: ${tool.coreTask}_\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## License\n\n`;
  md += `[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)\n\n`;
  md += `To the extent possible under law, the contributors have waived all copyright and related or neighboring rights to this work. See the [LICENSE](LICENSE) file for details.\n\n`;
  md += `---\n\n`;
  md += `Generated by [nologin.tools](https://nologin.tools) · [Submit a tool](https://nologin.tools/submit)\n`;
  return md;
}

async function pushToGithub(
  token: string,
  repo: string,
  path: string,
  content: string
): Promise<{ updated: boolean }> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'NoLoginTools-Exporter/1.0',
  };

  // Get current file SHA and content (if exists)
  let sha: string | undefined;
  let existingContent: string | undefined;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = (await res.json()) as { sha: string; content: string };
      sha = data.sha;
      try {
        existingContent = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
      } catch {
        // Decoding failed — treat as changed
      }
    }
  } catch {
    // File doesn't exist yet or request failed
  }

  // Skip push if content is unchanged
  if (existingContent !== undefined && existingContent === content) {
    return { updated: false };
  }

  // Create or update file
  const committer = { name: 'nologin-bot', email: 'bot@nologin.tools' };
  const body: Record<string, any> = {
    message: `Update ${path}`,
    content: btoa(unescape(encodeURIComponent(content))),
    committer,
    author: committer,
  };
  if (sha) body.sha = sha;

  const putController = new AbortController();
  const putTimeout = setTimeout(() => putController.abort(), 30000);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: putController.signal,
  });
  clearTimeout(putTimeout);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }

  return { updated: true };
}
