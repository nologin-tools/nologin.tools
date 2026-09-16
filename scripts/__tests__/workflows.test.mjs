// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  WORKFLOW_RECIPES,
  getWorkflowRecipes,
  getWorkflowBySlug,
  findWorkflowsForTool,
} from '../../src/lib/workflows-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDataPath = resolve(__dirname, '../../src/data/build-data.json');
/** @type {{ tools: Array<{ slug: string; status: string }> }} */
const buildData = JSON.parse(readFileSync(buildDataPath, 'utf-8'));
const approvedToolSlugs = new Set(
  buildData.tools.filter((t) => t.status === 'approved').map((t) => t.slug)
);

describe('Workflow Recipes Data Model', () => {
  it('defines 13 high-intent workflow recipes', () => {
    assert.equal(WORKFLOW_RECIPES.length, 13);
    const recipes = getWorkflowRecipes();
    assert.equal(recipes.length, 13);
  });

  it('has valid URL-safe slugs for all recipes', () => {
    const slugRegex = /^[a-z0-9-]+$/;
    for (const recipe of WORKFLOW_RECIPES) {
      assert.ok(slugRegex.test(recipe.slug), `Recipe slug ${recipe.slug} must be URL-safe lowercase`);
      assert.ok(recipe.title.length > 5, `Recipe ${recipe.slug} has short title`);
      assert.ok(recipe.category.length > 0, `Recipe ${recipe.slug} has empty category`);
      assert.ok(recipe.timeEstimate.length > 0, `Recipe ${recipe.slug} has empty timeEstimate`);
      assert.ok(
        ['Beginner', 'Intermediate', 'Advanced'].includes(recipe.difficulty),
        `Recipe ${recipe.slug} has invalid difficulty ${recipe.difficulty}`
      );
      assert.ok(recipe.privacyGuarantee.length > 10, `Recipe ${recipe.slug} has short privacyGuarantee`);
      assert.ok(recipe.headline.length > 10, `Recipe ${recipe.slug} has short headline`);
      assert.ok(recipe.summary.length > 30, `Recipe ${recipe.slug} has short summary`);
      assert.ok(recipe.whyThisStack.length > 30, `Recipe ${recipe.slug} has short whyThisStack`);
    }
  });

  it('ensures all workflow slugs are unique', () => {
    const slugs = WORKFLOW_RECIPES.map((r) => r.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(uniqueSlugs.size, slugs.length, 'Duplicate workflow slugs found');
  });

  it('ensures every tool referenced in all steps is an approved tool in build-data.json', () => {
    let totalToolRefs = 0;
    for (const recipe of WORKFLOW_RECIPES) {
      for (const step of recipe.steps) {
        totalToolRefs++;
        assert.ok(
          approvedToolSlugs.has(step.toolSlug),
          `Tool slug "${step.toolSlug}" in recipe "${recipe.slug}" (step ${step.stepNumber}) must exist and be approved in build-data.json`
        );
      }
    }
    assert.ok(totalToolRefs >= 30, `Expected at least 30 total tool references across recipes, found ${totalToolRefs}`);
  });

  it('ensures all steps are sequential, 1-indexed, and have complete action specs', () => {
    for (const recipe of WORKFLOW_RECIPES) {
      assert.ok(recipe.steps.length >= 3, `Recipe ${recipe.slug} must have at least 3 steps`);
      recipe.steps.forEach((step, idx) => {
        assert.equal(
          step.stepNumber,
          idx + 1,
          `Step number in ${recipe.slug} at index ${idx} must be ${idx + 1}`
        );
        assert.ok(step.actionTitle.length > 5, `Empty or short actionTitle in ${recipe.slug} step ${step.stepNumber}`);
        assert.ok(step.actionDescription.length > 20, `Short actionDescription in ${recipe.slug} step ${step.stepNumber}`);
        assert.ok(step.inputFormat.length > 0, `Empty inputFormat in ${recipe.slug} step ${step.stepNumber}`);
        assert.ok(step.outputFormat.length > 0, `Empty outputFormat in ${recipe.slug} step ${step.stepNumber}`);
        assert.ok(step.proTip.length > 10, `Empty or short proTip in ${recipe.slug} step ${step.stepNumber}`);
      });
    }
  });

  it('contains structured FAQs for all recipes', () => {
    for (const recipe of WORKFLOW_RECIPES) {
      assert.ok(recipe.faqs.length >= 2, `Recipe ${recipe.slug} must have at least 2 FAQs`);
      for (const faq of recipe.faqs) {
        assert.ok(faq.question.length > 10, `Short question in ${recipe.slug}`);
        assert.ok(faq.answer.length > 20, `Short answer in ${recipe.slug}`);
      }
    }
  });
});

describe('getWorkflowBySlug', () => {
  it('resolves valid workflow recipe by slug', () => {
    const podcast = getWorkflowBySlug('private-podcast-production');
    assert.ok(podcast);
    assert.equal(podcast.title, 'Private Podcast Production Pipeline');
    assert.equal(podcast.steps.length, 4);
    assert.equal(podcast.steps[0].toolSlug, 'audiomass-co');

    const redaction = getWorkflowBySlug('secure-document-redaction');
    assert.ok(redaction);
    assert.equal(redaction.steps[0].toolSlug, 'tools-pdf24-org-en');
    assert.equal(redaction.steps[2].toolSlug, 'yopass-se');
  });

  it('returns undefined for non-existent recipe slug', () => {
    assert.equal(getWorkflowBySlug('non-existent-recipe'), undefined);
    assert.equal(getWorkflowBySlug(''), undefined);
  });
});

describe('findWorkflowsForTool', () => {
  it('finds all workflow recipes featuring a specific tool', () => {
    const squooshWorkflows = findWorkflowsForTool('squoosh-app');
    assert.ok(squooshWorkflows.length >= 3, 'Squoosh should be featured in at least 3 workflows');
    assert.ok(squooshWorkflows.some((w) => w.slug === 'private-podcast-production'));
    assert.ok(squooshWorkflows.some((w) => w.slug === 'vector-to-web-asset'));
    assert.ok(squooshWorkflows.some((w) => w.slug === 'social-media-media-prep'));

    const excalidrawWorkflows = findWorkflowsForTool('excalidraw-com');
    assert.ok(excalidrawWorkflows.length >= 2);
    assert.ok(excalidrawWorkflows.some((w) => w.slug === 'vector-to-web-asset'));
    assert.ok(excalidrawWorkflows.some((w) => w.slug === 'ephemeral-team-sync'));

    const wormholeWorkflows = findWorkflowsForTool('wormhole-app');
    assert.ok(wormholeWorkflows.length >= 2);
  });

  it('returns empty array for tool not in any workflow', () => {
    assert.deepEqual(findWorkflowsForTool('non-existent-tool-slug'), []);
  });
});
