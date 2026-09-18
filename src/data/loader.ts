import { resolveEffectiveStatus, type EffectiveStatus } from '../lib/health';
import { hasLocalizedToolContent, getLocalizedToolFields as buildLocalizedToolFields } from '../lib/tool-seo.mjs';
import { LOCALES, type Locale } from '../i18n/config';
import { isValidSlug } from '../lib/utils';
import { computeScore as computeRawScore } from '../lib/score.mjs';

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

export interface DueDiligenceEvidence {
  // 1. 全网社区声誉与信誉穿透 (Web & Community Due Diligence)
  community?: {
    status: 'verified-authentic' | 'community-acclaimed' | 'neutral' | 'caution' | 'disputed';
    sentimentScore?: number; // 0-100
    summary?: string;
    sources?: string[];      // e.g. ["Hacker News", "GitHub", "Reddit"]
  };
  // 2. 开源生命力与自部署核查 (Open Source & Self-Hostability)
  openSource?: {
    isRepoVerified: boolean;
    isSelfHostable: boolean;    // Verified Dockerfile / docker-compose
    license?: string;          // MIT, Apache-2.0, etc.
    vitality?: 'active' | 'maintained' | 'stale' | 'archived' | 'closed-source';
    repoUrl?: string;
  };
  // 3. 真实隐私与网络外溢交叉求证 (Privacy & Data Egress Cross-Check)
  privacyAudit?: {
    runtimeClassification: 'Local Only' | 'Cloud Processed' | 'Hybrid';
    statedPolicyCompliance: 'verified-consistent' | 'acceptable' | 'warning' | 'policy-violation';
    zeroEgressConfirmed: boolean;
    dataRetentionPolicy?: string;
  };
  // 4. 多模态真视觉审图质检 (Multimodal Visual Review)
  visualCraft?: {
    adPollutionTier: 'zero-ads' | 'unobtrusive' | 'ad-supported' | 'intrusive-ads';
    uiAesthetics: 'exceptional' | 'modern' | 'minimal' | 'antiquated';
    watermarkFree: boolean;
    hasDeceptiveElements: boolean;
    visualProofCaptured: boolean;
  };
}

export interface ProductScoreBreakdown {
  overall: number;          // 0-100 overall product power score
  frictionless: number;     // 0-20 instant, friction-free UX
  depth: number;            // 0-25 functional depth & fidelity
  exportFreedom: number;    // 0-20 unrestricted export & outputs
  privacy: number;          // 0-20 privacy & data sovereignty (local sandbox, 0-egress, telemetry hygiene)
  polish: number;           // 0-15 visual polish & runtime stability
  factors?: Record<string, string[]>; // explainable reason breakdown per dimension
}

export type EditorialVerdictTier =
  | 'editors-choice'
  | 'highly-recommended'
  | 'capable-utility'
  | 'emergency-only';

export interface ToolEditorial {
  bestFor: string;
  pros: string[];
  cons: string[];
  privacyVerdict: string;
  alternativeTo: string[];
  productScore?: ProductScoreBreakdown;
  verdictTier?: EditorialVerdictTier;
  benchmarkNotes?: string;
  testedAt?: string;
  dueDiligence?: DueDiligenceEvidence;
}

import editorialJson from './tool-editorial.json';
const editorialData = editorialJson as Record<string, Record<string, ToolEditorial>>;

export function getToolEditorial(slug: string, locale: Locale = 'en'): ToolEditorial | null {
  const toolEntry = editorialData[slug];
  if (!toolEntry) return null;
  return toolEntry[locale] ?? toolEntry.en ?? null;
}

export interface CategoryEditorial {
  title: string;
  overview: string;
  architectureInsights: string;
  tradeoffs: {
    gain: string;
    sacrifice: string;
  };
  recommendedWorkflow: string;
}

import categoryEditorialJson from './category-editorial.json';
const categoryEditorialData = categoryEditorialJson as Record<string, Record<string, CategoryEditorial>>;

export function getCategoryEditorial(category: string, locale: Locale = 'en'): CategoryEditorial | null {
  const catEntry = categoryEditorialData[category];
  if (!catEntry) return null;
  return catEntry[locale] ?? catEntry.en ?? null;
}

export interface TagEditorial {
  name: string;
  tagline: string;
  architecture: string;
  verification: string;
  tradeoff: string;
}

import tagEditorialJson from './tag-editorial.json';
const tagEditorialData = tagEditorialJson as Record<string, Record<string, TagEditorial>>;

export function getTagEditorial(tagSlug: string, locale: Locale = 'en'): TagEditorial | null {
  const entry = tagEditorialData[tagSlug];
  if (!entry) return null;
  return entry[locale] ?? entry.en ?? null;
}



export function getApprovedTools(): BuildDataTool[] {
  return buildData.tools.filter((t) => t.status === 'approved' && isValidSlug(t.slug));
}

export function getAllTools(): BuildDataTool[] {
  return buildData.tools.filter((t) => isValidSlug(t.slug));
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
  const editorial = editorialData[tool.slug]?.en;
  return computeRawScore(tool, healthStatus, editorial);
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
