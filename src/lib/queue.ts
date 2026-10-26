import { eq, asc } from 'drizzle-orm';
import { getDb } from '../db';
import { tools, badgeDisplays } from '../db/schema';
import {
  DAILY_TOTAL_CAPACITY,
  DAILY_PRIORITY_CAPACITY,
  DAILY_STANDARD_MIN_CAPACITY,
  extractHostname,
  estimateWaitDays,
  formatEtaLabel,
  buildReviewQueue,
  extractCandidateGitHubRepo,
  extractSameOriginScriptUrls,
} from './queue-core.mjs';

export {
  DAILY_TOTAL_CAPACITY,
  DAILY_PRIORITY_CAPACITY,
  DAILY_STANDARD_MIN_CAPACITY,
  extractHostname,
  estimateWaitDays,
  formatEtaLabel,
  buildReviewQueue,
  extractCandidateGitHubRepo,
  extractSameOriginScriptUrls,
};

export interface QueueItem {
  id: number;
  slug: string;
  name: string;
  hostname: string;
  submittedAt: string;
  hasExplicitBadge: boolean;
  badgeDisplayType: string;
  hasRepo: boolean;
  lane: 'priority' | 'standard';
  position: number;
  estimatedDays: number;
  etaLabel: { en: string; zh: string };
  fastTrackJump: {
    targetPosition: number;
    targetEstimatedDays: number;
    targetEtaLabel: { en: string; zh: string };
    daysSaved: number;
  } | null;
}

export interface ReviewQueueSnapshot {
  updatedAt: string;
  quota: {
    dailyTotal: number;
    dailyPriority: number;
    dailyStandardMin: number;
  };
  summary: {
    priorityCount: number;
    standardCount: number;
    totalPending: number;
    nextPriorityPosition: number;
    nextPriorityEtaDays: number;
    nextPriorityEtaLabel: { en: string; zh: string };
    standardTailEtaDays: number;
    standardTailEtaLabel: { en: string; zh: string };
  };
  priorityQueue: QueueItem[];
  standardQueue: QueueItem[];
  lookup: QueueItem | null;
}

/**
 * Fetch pending tools and their badge display status from D1 and build the two-lane review queue.
 */
export async function fetchReviewQueueSnapshot(
  d1: any,
  options: { limit?: number; lookupQuery?: string | null } = {}
): Promise<ReviewQueueSnapshot> {
  if (!d1) {
    return buildReviewQueue([], options) as ReviewQueueSnapshot;
  }
  const db = getDb(d1);
  const rows = await db
    .select({
      id: tools.id,
      slug: tools.slug,
      name: tools.name,
      url: tools.url,
      submittedAt: tools.submittedAt,
      submitterEmail: tools.submitterEmail,
      repoUrl: tools.repoUrl,
      badgeDisplayType: badgeDisplays.displayType,
    })
    .from(tools)
    .leftJoin(badgeDisplays, eq(tools.id, badgeDisplays.toolId))
    .where(eq(tools.status, 'pending'))
    .orderBy(asc(tools.submittedAt), asc(tools.id));

  return buildReviewQueue(rows, options) as ReviewQueueSnapshot;
}
