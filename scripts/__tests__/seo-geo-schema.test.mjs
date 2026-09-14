// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const TOOL_DETAIL_PAGE = resolve(ROOT, 'src/components/ToolDetailPage.astro');
const HOME_PAGE = resolve(ROOT, 'src/components/HomePage.astro');
const LAYOUT = resolve(ROOT, 'src/layouts/Layout.astro');

describe('SEO & GEO: Structured Data & Semantic Markup', () => {
  it('ToolDetailPage has visible FAQ section matching FAQPage schema', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');

    // Must have FAQPage JSON-LD
    assert.ok(content.includes("'@type': 'FAQPage'"), 'Must contain FAQPage in JSON-LD');
    assert.ok(content.includes("'tool.faq.q1'"), 'FAQPage must contain question 1');
    assert.ok(content.includes("'tool.faq.q2'"), 'FAQPage must contain question 2');

    // Must have visible FAQ HTML section
    assert.ok(content.includes('<section class="border-t border-neutral-100 pt-8" aria-labelledby="tool-faq-heading">'), 'Must render visible FAQ section in HTML');
    assert.ok(content.includes("t(locale, 'tool.faq.q1', { name: tool.name })"), 'Visible FAQ must display question 1');
    assert.ok(content.includes("t(locale, 'tool.faq.q2', { name: tool.name })"), 'Visible FAQ must display question 2');
    assert.ok(content.includes("t(locale, 'tool.faq.a1', { name: tool.name })"), 'Visible FAQ must display answer 1');
    assert.ok(content.includes("t(locale, 'tool.faq.a2', { name: tool.name, coreTask: tool.coreTask })"), 'Visible FAQ must display answer 2');
  });

  it('ToolDetailPage has Verification Details factsheet for GEO quotability', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');
    assert.ok(content.includes('Verification Details'), 'Must render Verification Details section');
    assert.ok(content.includes('None Required'), 'Must prominently show None Required for account');
    assert.ok(content.includes('Category'), 'Must show Category in factsheet');
    assert.ok(content.includes('Processing'), 'Must show Processing in factsheet');
    assert.ok(content.includes('Pricing'), 'Must show Pricing in factsheet');
  });

  it('ToolDetailPage has enhanced SoftwareApplication schema', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');
    assert.ok(content.includes('isAccessibleForFree: true'), 'Must declare isAccessibleForFree: true');
    assert.ok(content.includes('featureList'), 'Must include featureList');
    assert.ok(content.includes('operatingSystem: \'All, Web Browser\''), 'Must include operatingSystem');
    assert.ok(content.includes('getApplicationCategory('), 'Must dynamically resolve applicationCategory');
    assert.ok(content.includes("name: 'NoLoginTools.org'"), 'Must attribute publisher to NoLoginTools.org');
  });

  it('HomePage has enhanced WebSite and Organization schema', () => {
    const content = readFileSync(HOME_PAGE, 'utf-8');
    assert.ok(content.includes('"@type": "WebSite"'), 'Must contain WebSite schema');
    assert.ok(content.includes('"@id": "https://nologin.tools/#organization"'), 'WebSite must reference organization ID');
    assert.ok(content.includes('"about": {'), 'WebSite must declare about entity');
    assert.ok(content.includes('"knowsAbout": ['), 'Organization must declare knowsAbout entity topics');
  });

  it('Layout.astro includes standard SEO and GEO meta tags', () => {
    const content = readFileSync(LAYOUT, 'utf-8');
    assert.ok(content.includes('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />'), 'Must set robots max-snippet');
    assert.ok(content.includes('<link rel="canonical" href={canonicalUrl} />'), 'Must include canonical URL');
    assert.ok(content.includes('<link rel="alternate" hreflang="x-default"'), 'Must include x-default hreflang');
    assert.ok(content.includes('<meta property="og:image" content={ogImageUrl} />'), 'Must include OpenGraph image');
    assert.ok(content.includes('<meta name="twitter:card" content="summary_large_image" />'), 'Must include Twitter large card');
    assert.ok(content.includes('INDEXABLE_LOCALES.filter'), 'Must filter hreflang links to INDEXABLE_LOCALES to avoid noindex conflicts');
  });

  it('tool-editorial.json has valid E-E-A-T reviews for at least 50 core tools', () => {
    const raw = readFileSync(resolve(ROOT, 'src/data/tool-editorial.json'), 'utf-8');
    const editorial = JSON.parse(raw);
    const slugs = Object.keys(editorial);

    assert.ok(slugs.length >= 50, `Must have at least 50 core tools, found ${slugs.length}`);

    const core50Tools = [
      'photopea-com', 'excalidraw-com', 'tldraw-com', 'squoosh-app', 'tinypng-com',
      'remove-bg', 'tools-pdf24-org-en', 'gchq-github-io-cyberchef', 'devdocs-io',
      'regex101-com', 'carbon-now-sh', 'jsoncrack-com', 'app-diagrams-net',
      'pomofocus-io', 'ezgif-com', 'haveibeenpwned-com', 'temp-mail-org',
      'privacytests-org', 'crontab-guru', 'bundlephobia-com', 'caniuse-com',
      'audiotrimmer-com', 'convertio-co', 'hemingwayapp-com', 'languagetool-org',
      'coolors-co', 'favicon-io', 'meet-jit-si', 'typescriptlang-org-play', 'explainshell-com',
      'phind-com', 'svgedit-netlify-app-editor-index-html', 'dillinger-io', 'jsonformatter-org',
      'tinywow-com', 'omnicalculator-com', 'csvjson-com', 'tableconvert-com',
      'desmos-com-calculator', 'wolframalpha-com', 'geogebra-org-calculator',
      'xe-com-currencyconverter', 'wise-com-gb-currency-converter', 'quickstart-to',
      'jakearchibald-github-io-svgomg', 'hat-sh', 'audiomass-co', 'cfiresim-com',
      'fffuel-co', 'jwt-io'
    ];

    for (const slug of core50Tools) {
      assert.ok(editorial[slug], `Missing editorial entry for ${slug}`);
      for (const lang of ['en', 'zh']) {
        const item = editorial[slug][lang];
        assert.ok(item, `Missing ${lang} review for ${slug}`);
        assert.ok(typeof item.bestFor === 'string' && item.bestFor.length > 10, `${slug}.${lang}.bestFor must be non-empty`);
        assert.ok(Array.isArray(item.pros) && item.pros.length >= 2, `${slug}.${lang}.pros must have at least 2 items`);
        assert.ok(Array.isArray(item.cons) && item.cons.length >= 1, `${slug}.${lang}.cons must have at least 1 item`);
        assert.ok(typeof item.privacyVerdict === 'string' && item.privacyVerdict.length > 10, `${slug}.${lang}.privacyVerdict must be non-empty`);
        assert.ok(Array.isArray(item.alternativeTo) && item.alternativeTo.length >= 1, `${slug}.${lang}.alternativeTo must have at least 1 item`);
      }
    }
  });

  it('category-editorial.json has valid guides for all 11 core categories', () => {
    const raw = readFileSync(resolve(ROOT, 'src/data/category-editorial.json'), 'utf-8');
    const categories = JSON.parse(raw);
    const expectedCategories = ['AI', 'Design', 'Writing', 'Development', 'Productivity', 'Media', 'Privacy', 'Data', 'Communication', 'Education', 'Finance'];

    assert.equal(Object.keys(categories).length, 11, 'Must contain exactly 11 categories');

    for (const cat of expectedCategories) {
      assert.ok(categories[cat], `Missing category: ${cat}`);
      for (const lang of ['en', 'zh']) {
        const guide = categories[cat][lang];
        assert.ok(guide, `Missing ${lang} guide for category ${cat}`);
        assert.ok(typeof guide.title === 'string' && guide.title.length > 5, `${cat}.${lang}.title must be non-empty`);
        assert.ok(typeof guide.overview === 'string' && guide.overview.length > 50, `${cat}.${lang}.overview must be comprehensive`);
        assert.ok(typeof guide.architectureInsights === 'string' && guide.architectureInsights.length > 30, `${cat}.${lang}.architectureInsights must be detailed`);
        assert.ok(guide.tradeoffs && typeof guide.tradeoffs.gain === 'string' && typeof guide.tradeoffs.sacrifice === 'string', `${cat}.${lang}.tradeoffs must be defined`);
        assert.ok(typeof guide.recommendedWorkflow === 'string' && guide.recommendedWorkflow.length > 10, `${cat}.${lang}.recommendedWorkflow must be non-empty`);
      }
    }
  });

  it('CategoryPage renders Editorial Guide and Schema metadata', () => {
    const categoryPageContent = readFileSync(resolve(ROOT, 'src/components/CategoryPage.astro'), 'utf-8');

    assert.ok(categoryPageContent.includes('getCategoryEditorial'), 'CategoryPage must import getCategoryEditorial');
    assert.ok(categoryPageContent.includes('category.editorial.heading'), 'CategoryPage must render editorial heading');
    assert.ok(categoryPageContent.includes('category.editorial.architecture'), 'CategoryPage must render architecture heading');
    assert.ok(categoryPageContent.includes('category.editorial.gain'), 'CategoryPage must render gain label');
    assert.ok(categoryPageContent.includes('category.editorial.sacrifice'), 'CategoryPage must render sacrifice label');
    assert.ok(categoryPageContent.includes('category.editorial.workflow'), 'CategoryPage must render workflow label');
    assert.ok(categoryPageContent.includes("about: {"), 'CategoryPage JSON-LD must include about Thing');
  });

  it('ToolDetailPage renders Editorial Review, Pros & Cons, and Schema Review with positiveNotes/negativeNotes', () => {
    const content = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');

    // UI elements
    assert.ok(content.includes('getToolEditorial'), 'Must import and use getToolEditorial');
    assert.ok(content.includes('tool.editorial.heading'), 'Must render editorial heading');
    assert.ok(content.includes('tool.editorial.bestFor'), 'Must render bestFor label');
    assert.ok(content.includes('tool.editorial.alternatives'), 'Must render alternatives label');
    assert.ok(content.includes('tool.editorial.pros'), 'Must render pros label');
    assert.ok(content.includes('tool.editorial.cons'), 'Must render cons label');
    assert.ok(content.includes('tool.editorial.privacy'), 'Must render privacy verdict label');

    // Schema.org Review & Pros/Cons enhancement
    assert.ok(content.includes("'@type': 'Review'"), 'Must include Review in JSON-LD');
    assert.ok(content.includes('positiveNotes: {'), 'Must include positiveNotes in JSON-LD');
    assert.ok(content.includes('negativeNotes: {'), 'Must include negativeNotes in JSON-LD');
    assert.ok(content.includes('isSimilarTo:'), 'Must map alternativeTo to isSimilarTo in JSON-LD');
  });

  it('i18n files include tool.editorial and category.editorial keys', () => {
    const en = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/en.json'), 'utf-8'));
    const zh = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/zh.json'), 'utf-8'));

    const requiredKeys = [
      'tool.editorial.heading',
      'tool.editorial.bestFor',
      'tool.editorial.alternatives',
      'tool.editorial.pros',
      'tool.editorial.cons',
      'tool.editorial.privacy',
      'category.editorial.heading',
      'category.editorial.architecture',
      'category.editorial.tradeoffs',
      'category.editorial.gain',
      'category.editorial.sacrifice',
      'category.editorial.workflow',
      'tool.relatedArticles',
    ];

    for (const key of requiredKeys) {
      assert.ok(en[key], `en.json missing key: ${key}`);
      assert.ok(zh[key], `zh.json missing key: ${key}`);
    }
  });

  it('all 9 allowed tag pages have valid intros in en.json and zh.json', () => {
    const en = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/en.json'), 'utf-8'));
    const zh = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/zh.json'), 'utf-8'));

    const allowedTags = [
      'free',
      'client-side-only',
      'privacy-focused',
      'self-hostable',
      'freemium',
      'no-trackers',
      'works-offline',
      'ad-supported',
      'pwa',
    ];

    for (const tag of allowedTags) {
      const key = `tag.page.intro.${tag}`;
      assert.ok(en[key] && en[key].length > 20, `en.json must have descriptive ${key}`);
      assert.ok(zh[key] && zh[key].length > 10, `zh.json must have descriptive ${key}`);
    }
  });

  it('tool-to-blog internal linking is bi-directional and valid', async () => {
    const toolDetailPageContent = readFileSync(TOOL_DETAIL_PAGE, 'utf-8');
    assert.ok(toolDetailPageContent.includes('getRelatedArticlesForTool'), 'ToolDetailPage must import getRelatedArticlesForTool');
    assert.ok(toolDetailPageContent.includes('tool.relatedArticles'), 'ToolDetailPage must render relatedArticles heading');
    assert.ok(toolDetailPageContent.includes('subjectOf: relatedArticles.map'), 'ToolDetailPage JSON-LD must include subjectOf articles');

    const { getRelatedArticlesForTool } = await import('../../src/lib/tool-blogs.ts');

    // Test specific high-impact tools
    const photopeaArticlesEn = getRelatedArticlesForTool('photopea-com', 'en');
    assert.ok(photopeaArticlesEn.length >= 2, 'Photopea must have at least 2 related articles');
    assert.ok(photopeaArticlesEn[0].url.startsWith('/blog/'), 'Article URL must be valid in EN');

    const photopeaArticlesZh = getRelatedArticlesForTool('photopea-com', 'zh');
    assert.ok(photopeaArticlesZh.length >= 2, 'Photopea must have at least 2 related articles in ZH');
    assert.ok(photopeaArticlesZh[0].url.startsWith('/zh/blog/'), 'Article URL must be localized in ZH');

    // Verify all articles mapped exist in filesystem in both EN and ZH
    const excalidrawArticles = getRelatedArticlesForTool('excalidraw-com', 'en');
    for (const article of excalidrawArticles) {
      const enFile = resolve(ROOT, `src/content/blog/${article.slug}.md`);
      const zhFile = resolve(ROOT, `src/content/blog/zh/${article.slug}.md`);
      assert.ok(readFileSync(enFile, 'utf-8'), `File must exist: ${enFile}`);
      assert.ok(readFileSync(zhFile, 'utf-8'), `File must exist: ${zhFile}`);
    }
  });

  it('llms.txt documents 11 category hubs and core verified tools for AI agents', () => {
    const llmsContent = readFileSync(resolve(ROOT, 'public/llms.txt'), 'utf-8');
    assert.ok(llmsContent.includes('Tool Categories & Architectural Hubs'), 'Must document Category Architectural Hubs');
    assert.ok(llmsContent.includes('Featured Verified Tools (50 Core Tools)'), 'Must document 50 Core Tools');
    assert.ok(llmsContent.includes('In-Depth Editorial Reviews & Comparison Guides'), 'Must document In-Depth Guides');
    assert.ok(llmsContent.includes('https://nologin.tools/blog/photopea-vs-canva'), 'Must link to Photopea comparison');
    assert.ok(llmsContent.includes('https://nologin.tools/category/design'), 'Must link to Design category hub');
  });

  it('tag-editorial.json has valid architectural guides for all 9 allowed tags', () => {
    const raw = readFileSync(resolve(ROOT, 'src/data/tag-editorial.json'), 'utf-8');
    const tags = JSON.parse(raw);
    const allowedTags = ['client-side-only', 'privacy-focused', 'works-offline', 'self-hostable', 'no-trackers', 'pwa', 'free', 'freemium', 'ad-supported'];

    assert.equal(Object.keys(tags).length, 9, 'Must contain exactly 9 tags');

    for (const tag of allowedTags) {
      assert.ok(tags[tag], `Missing tag: ${tag}`);
      for (const lang of ['en', 'zh']) {
        const item = tags[tag][lang];
        assert.ok(item, `Missing ${lang} guide for tag ${tag}`);
        assert.ok(typeof item.name === 'string' && item.name.length > 2, `${tag}.${lang}.name must be non-empty`);
        assert.ok(typeof item.tagline === 'string' && item.tagline.length > 10, `${tag}.${lang}.tagline must be descriptive`);
        assert.ok(typeof item.architecture === 'string' && item.architecture.length > 30, `${tag}.${lang}.architecture must explain mechanism`);
        assert.ok(typeof item.verification === 'string' && item.verification.length > 20, `${tag}.${lang}.verification must explain DevTools test`);
        assert.ok(typeof item.tradeoff === 'string' && item.tradeoff.length > 10, `${tag}.${lang}.tradeoff must explain boundaries`);
      }
    }
  });

  it('TagPage renders Tag Editorial Guide and CollectionPage about schema', () => {
    const tagPageContent = readFileSync(resolve(ROOT, 'src/components/TagPage.astro'), 'utf-8');
    assert.ok(tagPageContent.includes('getTagEditorial'), 'TagPage must import getTagEditorial');
    assert.ok(tagPageContent.includes('tag.editorial.heading'), 'TagPage must render editorial heading');
    assert.ok(tagPageContent.includes('tag.editorial.architecture'), 'TagPage must render architecture heading');
    assert.ok(tagPageContent.includes('tag.editorial.verification'), 'TagPage must render verification heading');
    assert.ok(tagPageContent.includes('tag.editorial.tradeoff'), 'TagPage must render tradeoff heading');
    assert.ok(tagPageContent.includes("about: {"), 'TagPage JSON-LD must include about Thing');
  });

  it('Blog pages render Mentioned Tools and SoftwareApplication about schema', async () => {
    const blogEnContent = readFileSync(resolve(ROOT, 'src/pages/blog/[slug].astro'), 'utf-8');
    assert.ok(blogEnContent.includes('getToolsForBlogArticle'), 'Blog EN must import getToolsForBlogArticle');
    assert.ok(blogEnContent.includes('blog.mentionedTools'), 'Blog EN must render mentionedTools heading');
    assert.ok(blogEnContent.includes("'@type': 'SoftwareApplication'"), 'Blog EN must include SoftwareApplication about in postLd');

    const blogLangContent = readFileSync(resolve(ROOT, 'src/pages/[lang]/blog/[slug].astro'), 'utf-8');
    assert.ok(blogLangContent.includes('getToolsForBlogArticle'), 'Blog Lang must import getToolsForBlogArticle');
    assert.ok(blogLangContent.includes('blog.mentionedTools'), 'Blog Lang must render mentionedTools heading');
    assert.ok(blogLangContent.includes("'@type': 'SoftwareApplication'"), 'Blog Lang must include SoftwareApplication about in postLd');

    const { getToolsForBlogArticle } = await import('../../src/lib/tool-blogs.ts');
    const photopeaTools = getToolsForBlogArticle('photopea-vs-canva', 'en');
    assert.ok(photopeaTools.length >= 1, 'photopea-vs-canva must have at least 1 mentioned tool');
    assert.equal(photopeaTools[0].slug, 'photopea-com');
    assert.equal(photopeaTools[0].name, 'Photopea');
    assert.ok(photopeaTools[0].description.length > 10);
  });
});


