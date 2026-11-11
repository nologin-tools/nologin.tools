import {
  getToolBySlug,
  getToolHealthStatus,
  getLocalizedDescription,
  type BuildDataTool,
} from '../data/loader';
import programmaticZh from '../data/translations/programmatic-zh.json';
import type { Locale } from '../i18n/config';

export {
  WORKFLOW_RECIPES,
  getWorkflowRecipes,
  getWorkflowBySlug,
  findWorkflowsForTool,
  type WorkflowRecipe,
  type WorkflowStep,
  type WorkflowFAQ,
} from './workflows-data.mjs';

import {
  WORKFLOW_RECIPES,
  findWorkflowsForTool,
  type WorkflowRecipe,
  type WorkflowStep,
  type WorkflowFAQ,
} from './workflows-data.mjs';

export interface HydratedWorkflowStep extends WorkflowStep {
  tool: BuildDataTool;
  toolName: string;
  toolUrl: string;
  toolDescription: string;
  toolCategory?: string;
  toolHealth: ReturnType<typeof getToolHealthStatus>;
}

export interface HydratedWorkflowRecipe extends Omit<WorkflowRecipe, 'steps'> {
  durationMinutes: number;
  difficultyLabel: string;
  steps: HydratedWorkflowStep[];
}

export function localizeWorkflowSummary(recipe: WorkflowRecipe, locale: Locale = 'en'): WorkflowRecipe {
  if (locale !== 'zh') return recipe;
  const zhWf = (programmaticZh.workflows as Record<string, {
    title: string;
    category: string;
    timeEstimate: string;
    privacyGuarantee: string;
    headline: string;
    summary: string;
    whyThisStack: string;
    steps: Record<string, { actionTitle: string; actionDescription: string; inputFormat: string; outputFormat: string; proTip: string }>;
    faqs: WorkflowFAQ[];
  } | undefined>)[recipe.slug];
  if (!zhWf) return recipe;
  return {
    ...recipe,
    title: zhWf.title,
    category: zhWf.category,
    timeEstimate: zhWf.timeEstimate,
    privacyGuarantee: zhWf.privacyGuarantee,
    headline: zhWf.headline,
    summary: zhWf.summary,
    whyThisStack: zhWf.whyThisStack,
    steps: recipe.steps.map((step) => {
      const zs = zhWf.steps[String(step.stepNumber)];
      return zs ? { ...step, ...zs } : step;
    }),
    faqs: zhWf.faqs,
  };
}

export function getLocalizedWorkflowRecipes(locale: Locale = 'en'): WorkflowRecipe[] {
  return WORKFLOW_RECIPES.map((wf) => localizeWorkflowSummary(wf, locale));
}

export function findLocalizedWorkflowsForTool(toolSlug: string, locale: Locale = 'en'): WorkflowRecipe[] {
  return findWorkflowsForTool(toolSlug).map((wf) => localizeWorkflowSummary(wf, locale));
}

/**
 * Hydrates a workflow recipe with live tool data from build data
 */
export function resolveWorkflowDetails(
  rawRecipe: WorkflowRecipe,
  locale: Locale = 'en'
): HydratedWorkflowRecipe {
  const durationMinutes = parseInt(rawRecipe.timeEstimate, 10) || 15;
  const recipe = localizeWorkflowSummary(rawRecipe, locale);
  const difficultyLabel = locale === 'zh'
    ? ((programmaticZh.difficulty as Record<string, string | undefined>)[rawRecipe.difficulty] || rawRecipe.difficulty)
    : rawRecipe.difficulty;

  const steps: HydratedWorkflowStep[] = recipe.steps.map((step) => {
    const foundTool = getToolBySlug(step.toolSlug);

    const fallbackTool: BuildDataTool = {
      id: 0,
      slug: step.toolSlug,
      name: step.toolSlug,
      url: `https://${step.toolSlug.replace(/-/g, '.')}`,
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

    const tool = foundTool || fallbackTool;
    const health = getToolHealthStatus(tool);
    const localizedDesc = getLocalizedDescription(tool, locale) || tool.description || '';
    const rawCat = tool.tags.find((t) => t.tagKey === 'category')?.tagValue;
    const categoryTag = locale === 'zh' && rawCat
      ? ((programmaticZh.categories as Record<string, string | undefined>)[rawCat] || rawCat)
      : rawCat;

    return {
      ...step,
      tool,
      toolName: tool.name,
      toolUrl: tool.url,
      toolDescription: localizedDesc,
      toolCategory: categoryTag,
      toolHealth: health,
    };
  });

  return {
    ...recipe,
    durationMinutes,
    difficultyLabel,
    steps,
  };
}
