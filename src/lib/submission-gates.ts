import {
  checkHardGates,
  normalizeSubmissionUrl,
  siteKey,
  siteKeyLikePatterns,
} from './submission-gates-core.mjs';

export { checkHardGates, normalizeSubmissionUrl, siteKey, siteKeyLikePatterns };

export interface SiteDuplicate {
  id: number;
  slug: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Find an existing tool that shares the same site identity ("one entry per site").
 * Pending and approved entries block a new submission. Rejected entries also block,
 * so the submitter is directed to the resubmit flow instead of creating URL slices.
 */
export async function findSiteDuplicate(
  d1: D1Database,
  url: string,
  excludeToolId?: number
): Promise<SiteDuplicate | null> {
  const key = siteKey(url);
  if (!key) return null;
  const patterns = siteKeyLikePatterns(key);
  const where = patterns.map(() => 'url LIKE ?').join(' OR ');
  const exclude = typeof excludeToolId === 'number' ? ' AND id != ?' : '';
  const params: unknown[] = [...patterns];
  if (typeof excludeToolId === 'number') params.push(excludeToolId);

  const row = await d1
    .prepare(
      `SELECT id, slug, status FROM tools WHERE (${where})${exclude}
       ORDER BY CASE status WHEN 'approved' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, id ASC
       LIMIT 1`
    )
    .bind(...params)
    .first<SiteDuplicate>();
  return row ?? null;
}
