import editorialJson from '../data/tool-editorial.json';
import { getApprovedTools, getToolHealthStatus, computeScore } from '../data/loader';
import type { Locale } from '../i18n/config';

export {
  ALTERNATIVE_TARGETS,
  getAlternativeTargets,
  getAlternativeBySlug,
  findAlternativeByAlias,
  type AlternativeTarget,
} from './alternatives-data.mjs';

import type { AlternativeTarget } from './alternatives-data.mjs';

export function getToolsForAlternative(target: AlternativeTarget, locale: Locale = 'en') {
  const editorialData = editorialJson as Record<string, Record<string, { alternativeTo?: string[]; bestFor?: string; pros?: string[]; cons?: string[]; privacyVerdict?: string }>>;
  const approved = getApprovedTools();

  const matchingSlugs = new Set<string>();
  for (const [toolSlug, entry] of Object.entries(editorialData)) {
    const alts = entry.en?.alternativeTo || [];
    if (alts.some((a) => target.aliases.some((alias) => alias.toLowerCase() === a.toLowerCase()))) {
      matchingSlugs.add(toolSlug);
    }
  }

  return approved
    .filter((tool) => matchingSlugs.has(tool.slug))
    .map((tool) => {
      const health = getToolHealthStatus(tool);
      const score = computeScore(tool, health);
      const editorial = editorialData[tool.slug]?.[locale] ?? editorialData[tool.slug]?.en;
      return {
        ...tool,
        health,
        score,
        bestFor: editorial?.bestFor || tool.description || '',
        pros: editorial?.pros || [],
        cons: editorial?.cons || [],
        privacyVerdict: editorial?.privacyVerdict || '',
      };
    })
    .sort((a, b) => b.score - a.score);
}
