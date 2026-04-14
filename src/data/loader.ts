import { resolveEffectiveStatus, type EffectiveStatus } from '../lib/health';
import { hasLocalizedToolContent, getLocalizedToolFields as buildLocalizedToolFields } from '../lib/tool-seo.mjs';
import { LOCALES, type Locale } from '../i18n/config';

type ToolTranslation = {
  _hash?: string;
  description?: string;
  coreTask?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoFocusKeyword?: string;
  seoTaskPhrase?: string;
};

type TranslationsFile = Record<string, ToolTranslation>;

const translationCache = new Map<string, TranslationsFile>();

function loadToolTranslations(locale: Locale): TranslationsFile {
  if (locale === 'en') return {};
  if (translationCache.has(locale)) return translationCache.get(locale)!;

  try {
    // Use Vite's glob import at build time
    const modules = import.meta.glob<{ default: TranslationsFile }>('./translations/*.json', { eager: true });
    const key = `./translations/${locale}.json`;
    const data = modules[key]?.default ?? {};
    translationCache.set(locale, data);
    return data;
  } catch {
    translationCache.set(locale, {});
    return {};
  }
}

function getToolTranslation(tool: BuildDataTool, locale: Locale): ToolTranslation | null {
  if (locale === 'en') return null;
  const translations = loadToolTranslations(locale);
  return translations[tool.slug] ?? null;
}

export function hasLocalizedToolCopy(tool: BuildDataTool, locale: Locale): boolean {
  if (locale === 'en') return true;
  return hasLocalizedToolContent(getToolTranslation(tool, locale));
}

export function getAvailableToolLocales(tool: BuildDataTool): Set<Locale> {
  const locales = new Set<Locale>(['en']);
  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    if (hasLocalizedToolCopy(tool, locale)) {
      locales.add(locale);
    }
  }
  return locales;
}

export function getLocalizedTool(tool: BuildDataTool, locale: Locale) {
  return buildLocalizedToolFields(tool, getToolTranslation(tool, locale), locale);
}

export function getLocalizedDescription(tool: BuildDataTool, locale: Locale): string | null {
  return getLocalizedTool(tool, locale).description;
}

export function getLocalizedCoreTask(tool: BuildDataTool, locale: Locale): string {
  return getLocalizedTool(tool, locale).coreTask;
}

export function getLocalizedSeoTitle(tool: BuildDataTool, locale: Locale): string | null {
  return getLocalizedTool(tool, locale).seoTitle;
}

export function getLocalizedSeoDescription(tool: BuildDataTool, locale: Locale): string | null {
  return getLocalizedTool(tool, locale).seoDescription;
}

export function getLocalizedSeoTaskPhrase(tool: BuildDataTool, locale: Locale): string | null {
  return getLocalizedTool(tool, locale).seoTaskPhrase;
}

export function getLocalizedSeoFocusKeyword(tool: BuildDataTool, locale: Locale): string | null {
  return getLocalizedTool(tool, locale).seoFocusKeyword;
}

interface BuildDataTag {
  tagKey: string;
  tagValue: string;
}

interface BuildDataHealthCheck {
  isOnline: boolean;
  checkedAt: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
}

interface BuildDataHealthHistory {
  isOnline: boolean;
  checkedAt: string;
}

export interface BuildDataTool {
  id: number;
  slug: string;
  name: string;
  url: string;
  description: string | null;
  coreTask: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoFocusKeyword: string | null;
  seoIntent: string | null;
  seoTaskPhrase: string | null;
  status: string;
  submittedAt: string;
  approvedAt: string | null;
  rejectionReason: string | null;
  submitterEmail: string | null;
  archiveUrl: string | null;
  isFeatured: boolean;
  featuredAt: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
  discordUrl: string | null;
  repoUrl: string | null;
  githubStars: number | null;
  githubForks: number | null;
  githubLicense: string | null;
  githubLanguage: string | null;
  githubUpdatedAt: string | null;
  githubFetchedAt: string | null;
  tags: BuildDataTag[];
  healthChecks: BuildDataHealthCheck[];
  healthHistory: BuildDataHealthHistory[];
  badgeDisplayType: string | null;
}

interface BuildData {
  generatedAt: string;
  tools: BuildDataTool[];
}

// Import build data at build time (resolved by Vite's JSON import)
import data from './build-data.json';
const buildData = data as BuildData;

export function getApprovedTools(): BuildDataTool[] {
  return buildData.tools.filter((t) => t.status === 'approved');
}

export function getAllTools(): BuildDataTool[] {
  return buildData.tools;
}

export function getToolBySlug(slug: string): BuildDataTool | undefined {
  return buildData.tools.find((t) => t.slug === slug);
}

export function getToolHealthStatus(
  tool: BuildDataTool
): { status: EffectiveStatus; checkedAt: Date } | null {
  const checks = tool.healthChecks.map((c) => ({
    isOnline: c.isOnline,
    checkedAt: new Date(c.checkedAt),
  }));
  const status = resolveEffectiveStatus(checks);
  if (status === null) return null;
  return { status, checkedAt: new Date(checks[0].checkedAt) };
}

export function computeScore(
  tool: BuildDataTool,
  healthStatus: { status: EffectiveStatus } | null
): number {
  const badgeType = tool.badgeDisplayType;
  const badgeWeight =
    badgeType === 'explicit' ? 10 : badgeType === 'implicit' ? 5 : 0;

  const now = Date.now();
  const approvedMs = tool.approvedAt
    ? new Date(tool.approvedAt).getTime()
    : 0;
  const ageMs = now - approvedMs;
  const freshness = ageMs < 30 * 86400000 ? 5 : ageMs < 90 * 86400000 ? 3 : 1;

  const healthScore = !healthStatus
    ? 1
    : healthStatus.status === 'online'
      ? 3
      : healthStatus.status === 'unstable'
        ? 1
        : 0;

  const featuredBoost = tool.isFeatured ? 8 : 0;

  return badgeWeight + freshness + healthScore + featuredBoost;
}

export function getRelatedTools(currentSlug: string, categoryTag: string | undefined, limit = 6): BuildDataTool[] {
  if (!categoryTag) return [];
  return getApprovedTools()
    .filter(t => t.slug !== currentSlug && t.tags.some(tag => tag.tagKey === 'category' && tag.tagValue === categoryTag))
    .map(t => ({ tool: t, score: computeScore(t, getToolHealthStatus(t)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.tool);
}

export function getBuildDataGeneratedAt(): string {
  return buildData.generatedAt;
}
