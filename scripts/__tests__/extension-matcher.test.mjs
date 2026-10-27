import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isSearchEngineHost,
  isAiSearchEngineHost,
  extractSearchQuery,
  extractCleanDomain,
  matchSiteUrl,
  computeToolbarBadge,
  filterExtensionTools,
  unwrapRedirectUrl,
  annotateSerpResult,
  summarizeSerpMatches,
} from '../../src/lib/extension-matcher.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const extDir = resolve(ROOT, 'packages/extension');

const indexEn = JSON.parse(
  readFileSync(resolve(extDir, 'src/extension-index.en.json'), 'utf8')
);
const indexZh = JSON.parse(
  readFileSync(resolve(extDir, 'src/extension-index.zh.json'), 'utf8')
);

describe('Extension v2.0 Matcher, SERP Radar & CADES 5D Index', () => {
  it('generates valid v2.0 bilingual extension indices and static OTA sync endpoints', () => {
    const publicEnPath = resolve(ROOT, 'public/api/extension-index.json');
    const publicZhPath = resolve(ROOT, 'public/zh/api/extension-index.json');
    assert.ok(existsSync(publicEnPath), 'public/api/extension-index.json must exist');
    assert.ok(existsSync(publicZhPath), 'public/zh/api/extension-index.json must exist');

    assert.equal(indexEn.schema_version, '2.0');
    assert.equal(indexEn.extension_version, '2.0.0');
    assert.equal(indexEn.lang, 'en');
    assert.equal(indexZh.lang, 'zh');
    assert.ok(indexEn.total_tools >= 300, 'Should include 300+ verified tools');
    assert.equal(indexEn.tools.length, indexZh.tools.length);
    assert.ok(indexEn.total_paywall_targets >= 50, 'Should map 50+ closed SaaS paywall domains');

    const excalidraw = indexEn.tools.find((t) => t.slug === 'excalidraw-com');
    assert.ok(excalidraw, 'excalidraw-com must exist in index');
    assert.equal(typeof excalidraw.cades?.score, 'number');
    assert.ok(excalidraw.cades.score >= 85);
    assert.ok(excalidraw.cades.dimensions, 'Must include CADES 2.0 5D dimensions');
    assert.equal(typeof excalidraw.cades.dimensions.frictionless, 'number');
    assert.equal(typeof excalidraw.cades.dimensions.depth, 'number');
    assert.equal(typeof excalidraw.cades.dimensions.exportFreedom, 'number');
    assert.equal(typeof excalidraw.cades.dimensions.privacy, 'number');
    assert.equal(typeof excalidraw.cades.dimensions.polish, 'number');
  });

  it('normalizes domains and identifies global, privacy, regional & AI search engine hosts', () => {
    assert.equal(extractCleanDomain('https://www.Excalidraw.com/app'), 'excalidraw.com');
    // Mainstream & Privacy Search Engines
    for (const host of [
      'www.google.com',
      'www.google.co.jp',
      'www.google.com.mx',
      'www.bing.com',
      'duckduckgo.com',
      'search.brave.com',
      'kagi.com',
      'www.startpage.com',
      'www.ecosia.org',
      'www.qwant.com',
      'www.mojeek.com',
      'swisscows.com',
      'metager.org',
      'presearch.com',
      'searx.be',
      // Regional Search Engines (JP / KR / CN / EU / RU)
      'search.yahoo.co.jp',
      'search.goo.ne.jp',
      'search.naver.com',
      'search.daum.net',
      'www.baidu.com',
      'www.sogou.com',
      'www.so.com',
      'so.toutiao.com',
      'ai.quark.cn',
      'yandex.ru',
      'search.seznam.cz',
      // AI Answer Engines
      'www.perplexity.ai',
      'you.com',
      'www.phind.com',
      'felo.ai',
      'www.genspark.ai',
      'metaso.cn',
    ]) {
      assert.equal(isSearchEngineHost(host), true, `${host} should be recognized as search engine`);
      const match = matchSiteUrl(`https://${host}/search?q=pdf`, indexEn);
      assert.notEqual(
        match?.kind,
        'unlisted',
        `${host} should never be treated as an unlisted tool nomination`
      );
    }

    assert.equal(isAiSearchEngineHost('www.perplexity.ai'), true);
    assert.equal(isAiSearchEngineHost('metaso.cn'), true);
    assert.equal(isAiSearchEngineHost('www.google.com'), false);
    assert.equal(isSearchEngineHost('excalidraw.com'), false);

    assert.equal(extractSearchQuery('?q=free+pdf+editor&hl=en'), 'free pdf editor');
    assert.equal(extractSearchQuery('?query=excalidraw&where=nexearch'), 'excalidraw'); // Naver
    assert.equal(extractSearchQuery('?keyword=photopea'), 'photopea'); // Toutiao
    assert.equal(extractSearchQuery('?MT=squoosh'), 'squoosh'); // goo.ne.jp
  });

  it('matchSiteUrl detects verified zero-login tools and returns CADES 5D peers & comparisons', () => {
    const res = matchSiteUrl('https://excalidraw.com/#room=123', indexEn);
    assert.ok(res);
    assert.equal(res.kind, 'verified');
    assert.equal(res.tool.slug, 'excalidraw-com');
    assert.ok(res.tool.cades.score >= 85);
    assert.ok(Array.isArray(res.sameCategoryAlts));
    assert.ok(res.sameCategoryAlts.length > 0, 'Should return category peers');
    assert.ok(Array.isArray(res.comparisons));
  });

  it('matchSiteUrl detects closed SaaS paywall targets across domains', () => {
    const canvaMatch = matchSiteUrl('https://www.canva.com/design/play', indexEn);
    assert.ok(canvaMatch);
    assert.equal(canvaMatch.kind, 'paywall');
    assert.equal(canvaMatch.target.targetName, 'Canva');
    assert.equal(canvaMatch.target.targetSlug, 'canva');
    assert.ok(canvaMatch.alternatives.length > 0);
    assert.equal(typeof canvaMatch.alternatives[0].cades?.score, 'number');

    const adobeMatch = matchSiteUrl(
      'https://acrobat.adobe.com/link/home/',
      indexEn
    );
    assert.ok(adobeMatch);
    assert.equal(adobeMatch.kind, 'paywall');
    assert.equal(adobeMatch.target.targetSlug, 'smallpdf');
  });

  it('matchSiteUrl returns unlisted for unknown external sites and null for search engines or nologin.tools', () => {
    const unlisted = matchSiteUrl('https://unknown-indie-app.example.org/studio', indexEn);
    assert.ok(unlisted);
    assert.equal(unlisted.kind, 'unlisted');
    assert.equal(unlisted.host, 'unknown-indie-app.example.org');
    assert.ok(unlisted.submitUrl.includes('/submit?url='));

    const searchEngine = matchSiteUrl('https://www.google.com/search?q=free+pdf+editor', indexEn);
    assert.equal(searchEngine, null);

    const ownSite = matchSiteUrl('https://nologin.tools/extension', indexEn);
    assert.equal(ownSite, null);
  });

  it('computeToolbarBadge returns emerald CADES score with pure white textColor for verified tools and amber count for paywalls', () => {
    const verifiedBadge = computeToolbarBadge('https://photopea.com/', indexEn);
    assert.equal(verifiedBadge.kind, 'verified');
    assert.equal(verifiedBadge.color, '#08695d');
    assert.equal(verifiedBadge.textColor, '#FFFFFF');
    assert.match(verifiedBadge.text, /^\d+$/);

    const paywallBadge = computeToolbarBadge('https://www.canva.com/', indexEn);
    assert.equal(paywallBadge.kind, 'paywall');
    assert.equal(paywallBadge.color, '#b45309');
    assert.equal(paywallBadge.textColor, '#FFFFFF');
    assert.match(paywallBadge.text, /^\d+$/);

    const emptyBadge = computeToolbarBadge('https://www.google.com/search?q=test', indexEn);
    assert.equal(emptyBadge.text, '');
  });

  it('filterExtensionTools supports scenario presets, categories, and "alternative to" search', () => {
    const editorsChoice = filterExtensionTools(indexEn, {
      preset: 'editors',
      limit: 50,
    });
    assert.ok(editorsChoice.items.length > 0);
    assert.ok(
      editorsChoice.items.every(
        (t) => t.cades?.tier === 'editors-choice' || (t.cades?.score || 0) >= 90
      )
    );

    const localWasm = filterExtensionTools(indexEn, {
      preset: 'local',
      limit: 50,
    });
    assert.ok(localWasm.items.length > 0);
    assert.ok(localWasm.items.every((t) => t.capabilities?.clientSideOnly));

    const openSourceDesign = filterExtensionTools(indexEn, {
      preset: 'opensource',
      category: 'Design',
      limit: 50,
    });
    assert.ok(openSourceDesign.items.length > 0);
    assert.ok(
      openSourceDesign.items.every(
        (t) => t.capabilities?.openSource && t.category === 'Design'
      )
    );

    const canvaAlts = filterExtensionTools(indexEn, {
      query: 'canva',
    });
    assert.ok(canvaAlts.items.length > 0, 'Searching "canva" should match tools with alternativeTo Canva');
  });

  it('unwraps search engine redirect URLs and annotates SERP results in EN and ZH', () => {
    const wrappedGoogle =
      'https://www.google.com/url?q=https%3A%2F%2Fexcalidraw.com%2F&sa=U';
    assert.equal(unwrapRedirectUrl(wrappedGoogle), 'https://excalidraw.com/');

    const wrappedDdg =
      'https://duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.canva.com%2F';
    assert.equal(unwrapRedirectUrl(wrappedDdg), 'https://www.canva.com/');

    const verifiedSerpEn = annotateSerpResult(wrappedGoogle, indexEn);
    assert.ok(verifiedSerpEn);
    assert.equal(verifiedSerpEn.kind, 'verified');
    assert.equal(verifiedSerpEn.slug, 'excalidraw-com');
    assert.equal(verifiedSerpEn.detailUrl, 'https://nologin.tools/tool/excalidraw-com');

    const verifiedSerpZh = annotateSerpResult(wrappedGoogle, indexZh);
    assert.ok(verifiedSerpZh);
    assert.equal(verifiedSerpZh.detailUrl, 'https://nologin.tools/zh/tool/excalidraw-com');

    const paywallSerpEn = annotateSerpResult(wrappedDdg, indexEn);
    assert.ok(paywallSerpEn);
    assert.equal(paywallSerpEn.kind, 'paywall');
    assert.equal(paywallSerpEn.alternativePageUrl, 'https://nologin.tools/alternative/canva');
  });

  it('summarizeSerpMatches builds a multi-tool comparison summary when >=2 tools appear on SERP', () => {
    const a1 = annotateSerpResult('https://excalidraw.com/', indexEn);
    const a2 = annotateSerpResult('https://www.photopea.com/', indexEn);
    const a3 = annotateSerpResult('https://www.canva.com/', indexEn);

    const summary = summarizeSerpMatches([a1, a2, a3], 'diagram editor', indexEn);
    assert.ok(summary, 'Should return summary bar payload when >=2 annotations exist');
    assert.ok(summary.verifiedCount >= 2);
    assert.equal(summary.paywallCount, 1);
    assert.equal(summary.tools[0].slug, 'excalidraw-com');
  });
});
