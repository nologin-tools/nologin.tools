import { resolveEffectiveStatus, type EffectiveStatus } from '../lib/health';
import type { Locale } from '../i18n/config';

type ToolTranslation = {
  _hash?: string;
  description?: string;
  coreTask?: string;
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

export function getLocalizedDescription(tool: BuildDataTool, locale: Locale): string | null {
  if (locale === 'en') return tool.description;
  const translations = loadToolTranslations(locale);
  return translations[tool.slug]?.description ?? tool.description;
}

export function getLocalizedCoreTask(tool: BuildDataTool, locale: Locale): string {
  if (locale === 'en') return tool.coreTask;
  const translations = loadToolTranslations(locale);
  return translations[tool.slug]?.coreTask ?? tool.coreTask;
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

export function getBuildDataGeneratedAt(): string {
  return buildData.generatedAt;
}
