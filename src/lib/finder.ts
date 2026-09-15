import {
  getApprovedTools,
  getToolHealthStatus,
  computeScore,
  getLocalizedDescription,
} from '../data/loader';
import type { Locale } from '../i18n/config';
import {
  buildFinderItemFromTool,
  type FinderToolItem,
  type FinderFilters,
} from './finder-core.mjs';

export {
  buildFinderItemFromTool,
  filterFinderTools,
  extractHostname,
  type FinderToolItem,
  type FinderFilters,
} from './finder-core.mjs';

/**
 * Transforms approved tools into lightweight, searchable finder items for a target locale
 */
export function getFinderTools(locale: Locale = 'en'): FinderToolItem[] {
  const tools = getApprovedTools();

  return tools.map((tool) => {
    const health = getToolHealthStatus(tool);
    const score = computeScore(tool, health);
    const localizedDesc = getLocalizedDescription(tool, locale) || tool.description || '';

    return buildFinderItemFromTool(
      tool,
      localizedDesc,
      health?.status ?? null,
      score
    );
  });
}
