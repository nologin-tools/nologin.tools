export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { parseGitHubRepoUrl, fetchGitHubRepoDataAuth } from '../../../lib/github';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { secret, toolId } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  if (!toolId || typeof toolId !== 'number') {
    return api.error('toolId is required.', 400);
  }

  const [tool] = await db
    .select({ id: tools.id, name: tools.name, repoUrl: tools.repoUrl })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  if (!tool.repoUrl) {
    return api.error('Tool has no repository URL.', 400);
  }

  const parsed = parseGitHubRepoUrl(tool.repoUrl);
  if (!parsed) {
    return api.error('Invalid GitHub repository URL.', 400);
  }

  const githubToken = env.GITHUB_TOKEN as string | undefined;
  const data = await fetchGitHubRepoDataAuth(parsed.owner, parsed.repo, githubToken);

  if (!data) {
    return api.error('Failed to fetch GitHub data.', 500);
  }

  await db.update(tools).set({
    githubStars: data.stars,
    githubForks: data.forks,
    githubLicense: data.license,
    githubLanguage: data.language,
    githubUpdatedAt: data.updatedAt,
    githubFetchedAt: new Date(),
  }).where(eq(tools.id, toolId));

  return api.success({
    toolId: tool.id,
    stars: data.stars,
    forks: data.forks,
    license: data.license,
    language: data.language,
    updatedAt: data.updatedAt.toISOString(),
    fetchedAt: new Date().toISOString(),
  });
};
