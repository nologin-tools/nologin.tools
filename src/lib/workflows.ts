import {
  getToolBySlug,
  getToolHealthStatus,
  getLocalizedDescription,
  type BuildDataTool,
} from '../data/loader';
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

import type { WorkflowRecipe, WorkflowStep } from './workflows-data.mjs';

export interface HydratedWorkflowStep extends WorkflowStep {
  tool: BuildDataTool;
  toolName: string;
  toolUrl: string;
  toolDescription: string;
  toolCategory?: string;
  toolHealth: ReturnType<typeof getToolHealthStatus>;
}

export interface HydratedWorkflowRecipe extends Omit<WorkflowRecipe, 'steps'> {
  steps: HydratedWorkflowStep[];
}

/**
 * Hydrates a workflow recipe with live tool data from build data
 */
export function resolveWorkflowDetails(
  recipe: WorkflowRecipe,
  locale: Locale = 'en'
): HydratedWorkflowRecipe {
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
    const categoryTag = tool.tags.find((t) => t.tagKey === 'category')?.tagValue;

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
    steps,
  };
}
