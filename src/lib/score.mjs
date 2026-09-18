// @ts-check

/**
 * Computes the unified recommendation score for sorting tools across nologin.tools
 * 
 * Formula:
 * Score = badgeWeight + freshness + healthScore + featuredBoost + productBoost + evergreenBoost
 * 
 * - badgeWeight: explicit +4, implicit +2, none +0 (rebalanced to prevent backlink dominance)
 * - freshness: <30d = 5, 30-90d = 3, >90d = 1
 * - evergreenBoost: +3 for mature tools (>=60d) with verified online health (eliminates age penalty)
 * - healthScore: online = 3, unstable/unknown = 1, offline = 0
 * - featuredBoost: isFeatured = +5
 * - productBoost: up to +10 pts derived from 5D Product Power score (Math.round(overall / 10))
 * 
 * @param {any} tool
 * @param {{ status?: string } | null} [healthStatus]
 * @param {any} [editorial]
 * @returns {number}
 */
import { getBadgeWeight } from './badge-core.mjs';

export function computeScore(tool, healthStatus, editorial) {
  const badgeWeight = getBadgeWeight(tool.badgeDisplayType);

  const now = Date.now();
  const approvedMs = tool.approvedAt
    ? new Date(tool.approvedAt).getTime()
    : 0;
  const ageMs = now - approvedMs;
  const freshness = ageMs < 30 * 86400000 ? 5 : ageMs < 90 * 86400000 ? 3 : 1;

  // Evergreen stability bonus for mature, verified tools with reliable online uptime
  const evergreenBoost =
    ageMs >= 60 * 86400000 && healthStatus?.status === 'online' ? 3 : 0;

  const healthScore = !healthStatus
    ? 1
    : healthStatus.status === 'online'
      ? 3
      : healthStatus.status === 'unstable'
        ? 1
        : 0;

  const featuredBoost = tool.isFeatured ? 5 : 0;

  // Editorial product power boost: scaled up to +10 pts for high-quality audited tools
  const ed = editorial || tool.editorial || tool.toolEditorial;
  const productOverall = ed?.productScore?.overall ?? 0;
  const productBoost = productOverall
    ? Math.round((productOverall / 100) * 10)
    : 0;

  return badgeWeight + freshness + healthScore + featuredBoost + productBoost + evergreenBoost;
}
