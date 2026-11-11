import editorialJson from '../data/tool-editorial.json';
import programmaticZh from '../data/translations/programmatic-zh.json';
import { getApprovedTools, getToolBySlug, getToolHealthStatus, computeScore, type BuildDataTool } from '../data/loader';
import type { Locale } from '../i18n/config';

export {
  COMPARISON_PAIRS,
  getComparisonPairs,
  getComparisonBySlug,
  findComparisonsForTool,
  type ComparisonPair,
  type ComparisonVerdict,
} from './comparisons-data.mjs';

import type { ComparisonPair, ComparisonVerdict } from './comparisons-data.mjs';

export function resolveComparisonPair(pair: ComparisonPair, locale: Locale = 'en'): ComparisonPair {
  if (locale === 'zh') {
    const zhEntry = (programmaticZh.comparisons as Record<string, { headline: string; verdict: ComparisonVerdict } | undefined>)[pair.slug];
    const categoryLabel = (programmaticZh.categories as Record<string, string | undefined>)[pair.category] || pair.category;
    if (zhEntry) {
      return {
        ...pair,
        category: categoryLabel,
        headline: zhEntry.headline,
        verdict: zhEntry.verdict,
      };
    }
  }
  return pair;
}

export interface ComparedToolItem extends BuildDataTool {
  health: ReturnType<typeof getToolHealthStatus>;
  score: number;
  bestFor: string;
  pros: string[];
  cons: string[];
  privacyVerdict: string;
  categoryTag?: string;
  dataTag?: string;
  privacyTag?: string;
  offlineTag?: string;
  pricingTag?: string;
}

export interface ComparisonDetails {
  pair: ComparisonPair;
  toolA: ComparedToolItem;
  toolB: ComparedToolItem;
}

export function resolveComparedTool(toolSlug: string, locale: Locale = 'en'): ComparedToolItem {
  const editorialData = editorialJson as Record<string, Record<string, { alternativeTo?: string[]; bestFor?: string; pros?: string[]; cons?: string[]; privacyVerdict?: string }>>;
  const tool = getToolBySlug(toolSlug);
  const editorial = editorialData[toolSlug]?.[locale] ?? editorialData[toolSlug]?.en;

  const fallbackTool: BuildDataTool = {
    id: 0,
    slug: toolSlug,
    name: toolSlug,
    url: `https://${toolSlug.replace(/-/g, '.')}`,
    description: '',
    coreTask: '',
    seoTitle: null,
    seoDescription: null,
    seoFocusKeyword: null,
    seoIntent: null,
    seoTaskPhrase: null,
    status: 'approved',
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    rejectionReason: null,
    submitterEmail: null,
    archiveUrl: null,
    isFeatured: false,
    featuredAt: null,
    twitterUrl: null,
    githubUrl: null,
    discordUrl: null,
    repoUrl: null,
    githubStars: null,
    githubForks: null,
    githubLicense: null,
    githubLanguage: null,
    githubUpdatedAt: null,
    githubFetchedAt: null,
    tags: [],
    healthChecks: [],
    healthHistory: [],
    badgeDisplayType: null,
  };

  const baseTool = tool || fallbackTool;
  const health = getToolHealthStatus(baseTool);
  const score = computeScore(baseTool, health);

  const getTagVal = (key: string) => baseTool.tags.find((t) => t.tagKey === key)?.tagValue;

  return {
    ...baseTool,
    health,
    score,
    bestFor: editorial?.bestFor || baseTool.description || '',
    pros: editorial?.pros || [],
    cons: editorial?.cons || [],
    privacyVerdict: editorial?.privacyVerdict || '',
    categoryTag: getTagVal('category'),
    dataTag: getTagVal('data'),
    privacyTag: getTagVal('privacy'),
    offlineTag: getTagVal('offline'),
    pricingTag: getTagVal('pricing'),
  };
}

export function resolveComparisonDetails(pair: ComparisonPair, locale: Locale = 'en'): ComparisonDetails {
  const localizedPair = resolveComparisonPair(pair, locale);
  return {
    pair: localizedPair,
    toolA: resolveComparedTool(pair.toolASlug, locale),
    toolB: resolveComparedTool(pair.toolBSlug, locale),
  };
}
