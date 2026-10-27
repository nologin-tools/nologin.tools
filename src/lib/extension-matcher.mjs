// @ts-check
/**
 * Pure matching, filtering, toolbar badge, and SERP annotation logic for the
 * NoLogin Tools Browser Extension (v2.0).
 *
 * Shared across:
 * - scripts/build-extension.mjs (bundled into background.js, content.js, popup.js)
 * - scripts/__tests__/extension-matcher.test.mjs (unit & contract tests)
 */

export const SEARCH_ENGINE_HOST_PATTERN =
  /(?:^|\.)(?:google\.[a-z.]+|bing\.com|duckduckgo\.com|baidu\.com|yahoo\.com|yahoo\.co\.jp|brave\.com|startpage\.com|ecosia\.org|kagi\.com|qwant\.com|mojeek\.com|swisscows\.com|metager\.org|metager\.de|presearch\.com|searx\.be|priv\.au|opnxng\.com|bus-hit\.me|tiekoetter\.com|inetol\.net|paulgo\.io|naver\.com|daum\.net|goo\.ne\.jp|toutiao\.com|quark\.cn|yandex\.[a-z.]+|ya\.ru|sogou\.com|so\.com|seznam\.cz|perplexity\.ai|you\.com|phind\.com|felo\.ai|genspark\.ai|metaso\.cn)$/i;

export const AI_SEARCH_ENGINE_HOST_PATTERN =
  /(?:^|\.)(?:perplexity\.ai|you\.com|phind\.com|felo\.ai|genspark\.ai|metaso\.cn)$/i;

export const IGNORED_NOMINATION_HOSTS =
  /(?:^|\.)(?:nologin\.tools|nologintools\.org|google\.[a-z.]+|bing\.com|duckduckgo\.com|baidu\.com|yahoo\.com|yahoo\.co\.jp|brave\.com|startpage\.com|ecosia\.org|kagi\.com|qwant\.com|mojeek\.com|swisscows\.com|metager\.org|metager\.de|presearch\.com|searx\.be|priv\.au|opnxng\.com|bus-hit\.me|tiekoetter\.com|inetol\.net|paulgo\.io|naver\.com|daum\.net|goo\.ne\.jp|toutiao\.com|quark\.cn|yandex\.[a-z.]+|ya\.ru|sogou\.com|so\.com|seznam\.cz|perplexity\.ai|you\.com|phind\.com|felo\.ai|genspark\.ai|metaso\.cn|localhost|github\.com|gitlab\.com|bitbucket\.org|npmjs\.com|wikipedia\.org|youtube\.com|youtu\.be|x\.com|twitter\.com|reddit\.com|facebook\.com|instagram\.com|linkedin\.com|apple\.com|microsoft\.com|mozilla\.org|cloudflare\.com)$/i;

/**
 * Checks whether a hostname belongs to a supported search engine.
 * @param {string} rawHost
 * @returns {boolean}
 */
export function isSearchEngineHost(rawHost) {
  if (!rawHost) return false;
  const clean = String(rawHost).trim().toLowerCase().replace(/\.$/, '');
  return SEARCH_ENGINE_HOST_PATTERN.test(clean);
}

/**
 * Checks whether a hostname belongs to an AI answer engine.
 * @param {string} rawHost
 * @returns {boolean}
 */
export function isAiSearchEngineHost(rawHost) {
  if (!rawHost) return false;
  const clean = String(rawHost).trim().toLowerCase().replace(/\.$/, '');
  return AI_SEARCH_ENGINE_HOST_PATTERN.test(clean);
}

/**
 * Extracts the search query string from URL search params.
 * @param {string | URLSearchParams} searchOrParams
 * @returns {string}
 */
export function extractSearchQuery(searchOrParams) {
  if (!searchOrParams) return '';
  const params =
    typeof searchOrParams === 'string'
      ? new URLSearchParams(searchOrParams)
      : searchOrParams;
  if (!params || typeof params.get !== 'function') return '';
  for (const key of ['q', 'query', 'wd', 'word', 'p', 'text', 'keyword', 'MT', 'k']) {
    const val = params.get(key);
    if (val && String(val).trim()) return String(val).trim();
  }
  return '';
}

/**
 * Unwraps search engine redirect URLs (Bing /ck/a base64, Yahoo /RU=, DDG /l/?uddg=, Google /url?q=).
 * @param {string} rawUrl
 * @returns {string}
 */
export function unwrapRedirectUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');

  // 1. Bing redirect (/ck/a?...&u=a1<base64url>)
  if (/(?:^|\.)bing\.com$/i.test(host) && parsed.pathname.startsWith('/ck/a')) {
    const u = parsed.searchParams.get('u');
    if (u) {
      if (/^https?:\/\//i.test(u)) return u;
      if (/^a[01]/i.test(u)) {
        try {
          const b64 = u.slice(2).replace(/-/g, '+').replace(/_/g, '/');
          const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, '=');
          const binary = atob(padded);
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
          const decoded = new TextDecoder().decode(bytes).trim();
          if (/^https?:\/\//i.test(decoded)) return decoded;
        } catch {}
      }
    }
  }

  // 2. Yahoo & Yahoo! JAPAN redirect (r.search.yahoo.com/.../RU=https%3A%2F%2F.../RK=...)
  if (/(?:^|\.)(?:search\.yahoo\.com|yahoo\.co\.jp)$/i.test(host)) {
    const ruMatch = parsed.pathname.match(/\/RU=([^/]+)/i);
    if (ruMatch) {
      try {
        const decoded = decodeURIComponent(ruMatch[1]).trim();
        if (/^https?:\/\//i.test(decoded)) return decoded;
      } catch {}
    }
  }

  // 3. DuckDuckGo redirect (/l/?uddg=...)
  if (/(?:^|\.)duckduckgo\.com$/i.test(host) && parsed.pathname.startsWith('/l/')) {
    const uddg = parsed.searchParams.get('uddg');
    if (uddg && /^https?:\/\//i.test(uddg)) return uddg;
  }

  // 4. Google redirect (/url?q=... or /url?url=...)
  if (/(?:^|\.)google\.[a-z.]+$/i.test(host) && parsed.pathname === '/url') {
    const target = parsed.searchParams.get('q') || parsed.searchParams.get('url');
    if (target && /^https?:\/\//i.test(target)) return target;
  }

  // 5. Generic search engine redirect parameters (MetaGer, Sogou, 360, Seznam, etc.)
  if (isSearchEngineHost(host)) {
    for (const key of ['url', 'q', 'target', 'uddg', 'ru', 'u', 'to', 'link', 'dest', 'redirect']) {
      const val = parsed.searchParams.get(key);
      if (val && /^https?:\/\//i.test(val)) return val;
    }
  }

  return rawUrl;
}

/**
 * Extracts normalized domain (lowercase, no leading www., no trailing dot).
 * @param {string} rawUrlOrHost
 * @returns {string | null}
 */
export function extractCleanDomain(rawUrlOrHost) {
  if (!rawUrlOrHost) return null;
  let host = String(rawUrlOrHost).trim().toLowerCase();
  try {
    if (host.includes('://')) {
      const parsed = new URL(host);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      host = parsed.hostname.toLowerCase();
    }
  } catch {
    return null;
  }
  host = host.replace(/\.$/, '').replace(/^www\./, '');
  return host || null;
}

/**
 * Matches a URL against the extension index:
 * 1. Verified NoLogin Tool ('verified')
 * 2. Closed / Paywalled SaaS Target ('paywall')
 * 3. Unlisted candidate site ('unlisted')
 *
 * @param {string} rawUrl
 * @param {any} index
 * @returns {any | null}
 */
export function matchSiteUrl(rawUrl, index) {
  if (!rawUrl || !index) return null;
  const unwrapped = unwrapRedirectUrl(rawUrl);
  let parsed;
  try {
    parsed = new URL(unwrapped);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null;

  const cleanHost = parsed.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
  if (!cleanHost) return null;
  if (
    cleanHost === 'nologin.tools' ||
    cleanHost.endsWith('.nologin.tools') ||
    cleanHost === 'nologintools.org' ||
    cleanHost.endsWith('.nologintools.org')
  ) {
    return null;
  }

  const isZh = index.lang === 'zh';
  const prefix = isZh ? '/zh' : '';
  const pathLower = (parsed.pathname || '/').toLowerCase().replace(/\/$/, '') || '/';

  // 1. Check Verified NoLogin Tools
  const tools = Array.isArray(index.tools) ? index.tools : [];
  let matchedTool = null;

  // 1a. Exact host + specific path prefix match (for multi-tool hosts like github.io, go.dev, investor.gov)
  const hostCandidates = tools.filter(
    (t) => t.hostname === cleanHost || cleanHost.endsWith(`.${t.hostname}`)
  );

  if (hostCandidates.length > 0) {
    let bestPathLen = -1;
    for (const cand of hostCandidates) {
      let candPath = '/';
      try {
        candPath = new URL(cand.url).pathname.toLowerCase().replace(/\/$/, '') || '/';
      } catch {}
      // Ignore pure locale prefixes like /en or /gb as strict path requirements
      const isLocaleOnlyPath = /^\/[a-z]{2}(?:-[a-z]{2})?$/i.test(candPath);
      if (candPath !== '/' && !isLocaleOnlyPath) {
        if (pathLower === candPath || pathLower.startsWith(`${candPath}/`)) {
          if (candPath.length > bestPathLen) {
            matchedTool = cand;
            bestPathLen = candPath.length;
          }
        }
      }
    }

    // If no non-root path matched, pick a candidate whose canonical path is root or locale-only
    // (avoiding false positives on shared hosts like *.github.io when visiting an unrelated repo)
    if (!matchedTool) {
      const sharedHost = /(?:^|\.)(?:github\.io|gitlab\.io|pages\.dev|vercel\.app|netlify\.app|gov)$/i.test(cleanHost);
      if (!sharedHost) {
        matchedTool = hostCandidates[0];
      } else {
        const rootCand = hostCandidates.find((cand) => {
          try {
            const p = new URL(cand.url).pathname.replace(/\/$/, '') || '/';
            return p === '/';
          } catch {
            return false;
          }
        });
        if (rootCand) matchedTool = rootCand;
      }
    }
  }

  if (matchedTool) {
    const sameCategoryAlts = tools
      .filter((t) => t.slug !== matchedTool.slug && t.category === matchedTool.category)
      .slice(0, 3);

    return {
      kind: 'verified',
      domain: matchedTool.hostname,
      tool: matchedTool,
      sameCategoryAlts,
      comparisons: Array.isArray(matchedTool.comparisons) ? matchedTool.comparisons : [],
    };
  }

  // 2. Check Paywalled / Forced-Signup SaaS Targets
  const paywallTargets = index.paywallTargets || index.alternatives || {};
  let matchedPaywallDomain = null;
  let matchedPaywall = paywallTargets[cleanHost] || null;
  if (matchedPaywall) {
    matchedPaywallDomain = cleanHost;
  } else {
    for (const key of Object.keys(paywallTargets)) {
      if (cleanHost === key || cleanHost.endsWith(`.${key}`)) {
        matchedPaywallDomain = key;
        matchedPaywall = paywallTargets[key];
        break;
      }
    }
  }

  if (matchedPaywall && Array.isArray(matchedPaywall.tools) && matchedPaywall.tools.length > 0) {
    return {
      kind: 'paywall',
      domain: matchedPaywallDomain,
      target: matchedPaywall,
      alternatives: matchedPaywall.tools,
    };
  }

  // 3. Unlisted third-party website (eligible for 1-click nomination)
  if (
    isSearchEngineHost(cleanHost) ||
    IGNORED_NOMINATION_HOSTS.test(cleanHost) ||
    /^\d+\.\d+\.\d+\.\d+$/.test(cleanHost)
  ) {
    return null;
  }

  return {
    kind: 'unlisted',
    host: cleanHost,
    url: unwrapped,
    submitUrl: `https://nologin.tools${prefix}/submit?url=${encodeURIComponent(unwrapped)}`,
  };
}

/**
 * Computes the non-intrusive browser toolbar badge (text, background color, hover title).
 * @param {string} rawUrl
 * @param {any} index
 * @returns {{ text: string, color: string | null, title: string, kind: string | null }}
 */
export function computeToolbarBadge(rawUrl, index) {
  const isZh = index?.lang === 'zh';
  const defaultTitle = isZh
    ? 'NoLogin Quick Switcher — 免登录工具与隐私实测助手'
    : 'NoLogin Quick Switcher — Privacy & Zero-Signup Companion';

  if (!rawUrl || !index) {
    return { text: '', color: null, title: defaultTitle, kind: null };
  }

  const match = matchSiteUrl(rawUrl, index);
  if (!match) {
    return { text: '', color: null, title: defaultTitle, kind: null };
  }

  if (match.kind === 'verified') {
    const tool = match.tool;
    const score = tool.cades?.score;
    const text = typeof score === 'number' ? String(score) : '✓';
    const color =
      typeof score === 'number'
        ? score >= 85
          ? '#08695d' // Deep Emerald-Teal (guarantees pure white text in Chrome toolbar badge)
          : '#1d4ed8' // Deep Blue-700
        : '#08695d';
    const tierText = tool.cades?.tierLabel ? ` (${tool.cades.tierLabel})` : '';
    const title = isZh
      ? `🛡️ NoLogin 已验证 · ${tool.name} · ⚡ ${score ?? '✓'}/100${tierText}`
      : `🛡️ NoLogin Verified · ${tool.name} · ⚡ ${score ?? '✓'}/100${tierText}`;
    return { text, color, textColor: '#FFFFFF', title, kind: 'verified' };
  }

  if (match.kind === 'paywall') {
    const count = match.alternatives.length;
    const targetName = match.target.targetName || match.domain;
    return {
      text: String(count),
      color: '#b45309', // Deep Amber-700 (guarantees pure white text in Chrome toolbar badge)
      textColor: '#FFFFFF',
      title: isZh
        ? `⚡ 正在访问 ${targetName}？点击切换至 ${count} 款免登录隐私平替工具`
        : `⚡ Visiting ${targetName}? ${count} verified no-login alternatives ready`,
      kind: 'paywall',
    };
  }

  return { text: '', color: null, textColor: '#FFFFFF', title: defaultTitle, kind: match.kind };
}

/**
 * Filters and ranks tools in the extension Popup by keyword query, category, and scenario preset.
 * @param {any} index
 * @param {{ query?: string, category?: string, preset?: string, excludeSlug?: string, limit?: number }} [options]
 * @returns {{ total: number, items: any[] }}
 */
export function filterExtensionTools(index, options = {}) {
  const tools = Array.isArray(index?.tools) ? index.tools : [];
  const q = String(options.query || '').trim().toLowerCase();
  const cat = String(options.category || 'all').trim().toLowerCase();
  const preset = String(options.preset || 'all').trim().toLowerCase();
  const excludeSlug = options.excludeSlug || null;
  const limit = typeof options.limit === 'number' ? options.limit : 35;

  const filtered = tools.filter((tool) => {
    if (!tool || (excludeSlug && tool.slug === excludeSlug)) return false;

    // 1. Scenario preset filter
    if (preset === 'local' && !tool.capabilities?.clientSideOnly) return false;
    if (preset === 'editors' && tool.cades?.tier !== 'editors-choice' && (tool.cades?.score || 0) < 90) {
      return false;
    }
    if (preset === 'opensource' && !tool.capabilities?.openSource) return false;

    // 2. Category filter
    if (cat !== 'all') {
      const toolCat = String(tool.category || '').toLowerCase();
      if (cat === 'pdf & office' && toolCat === 'productivity') {
        // alias match
      } else if (toolCat !== cat) {
        return false;
      }
    }

    // 3. Keyword search (matches name, host, task, description, bestFor, and alternativeTo SaaS names)
    if (q) {
      const matchName = tool.name?.toLowerCase().includes(q);
      const matchHost = tool.hostname?.toLowerCase().includes(q);
      const matchTask = tool.coreTask?.toLowerCase().includes(q);
      const matchDesc = tool.description?.toLowerCase().includes(q);
      const matchCat =
        tool.category?.toLowerCase().includes(q) ||
        tool.categoryLabel?.toLowerCase().includes(q);
      const matchBestFor = tool.cades?.bestFor?.toLowerCase().includes(q);
      const matchAltTo =
        Array.isArray(tool.cades?.alternativeTo) &&
        tool.cades.alternativeTo.some((a) => String(a).toLowerCase().includes(q));

      if (
        !matchName &&
        !matchHost &&
        !matchTask &&
        !matchDesc &&
        !matchCat &&
        !matchBestFor &&
        !matchAltTo
      ) {
        return false;
      }
    }

    return true;
  });

  return {
    total: filtered.length,
    items: filtered.slice(0, limit),
  };
}

/**
 * Generates an inline SERP annotation model for a search result link.
 * Supports both Verified NoLogin Tools ('verified') and Paywalled SaaS Targets ('paywall').
 *
 * @param {string} href
 * @param {any} index
 * @returns {any | null}
 */
export function annotateSerpResult(href, index) {
  if (!href || !index) return null;
  const match = matchSiteUrl(href, index);
  if (!match) return null;

  if (match.kind === 'verified') {
    const t = match.tool;
    return {
      kind: 'verified',
      domain: match.domain,
      slug: t.slug,
      name: t.name,
      category: t.category,
      categoryLabel: t.categoryLabel || t.category,
      score: t.cades?.score ?? null,
      tier: t.cades?.tier ?? null,
      tierLabel: t.cades?.tierLabel ?? null,
      clientSideOnly: Boolean(t.capabilities?.clientSideOnly),
      worksOffline: Boolean(t.capabilities?.worksOffline),
      openSource: Boolean(t.capabilities?.openSource),
      free: Boolean(t.capabilities?.free),
      detailUrl: t.detailUrl,
      comparisons: match.comparisons,
    };
  }

  if (match.kind === 'paywall') {
    const target = match.target;
    const topAlts = (match.alternatives || []).slice(0, 2);
    if (topAlts.length === 0) return null;
    return {
      kind: 'paywall',
      domain: match.domain,
      targetName: target.targetName,
      targetSlug: target.targetSlug,
      category: target.category,
      headline: target.headline,
      alternativePageUrl: target.alternativePageUrl || null,
      totalAlternatives: match.alternatives.length,
      alternatives: topAlts.map((a) => ({
        slug: a.slug,
        name: a.name,
        url: a.url,
        detailUrl: a.detailUrl,
        score: a.cades?.score ?? null,
        clientSideOnly: Boolean(a.capabilities?.clientSideOnly),
      })),
    };
  }

  return null;
}

/**
 * Summarizes multiple SERP annotations on the same search results page into a top comparison bar.
 * @param {any[]} annotations
 * @param {string} queryText
 * @param {any} index
 * @returns {any | null}
 */
export function summarizeSerpMatches(annotations, queryText, index) {
  if (!Array.isArray(annotations) || annotations.length === 0 || !index) return null;
  const isZh = index.lang === 'zh';
  const prefix = isZh ? '/zh' : '';

  const verifiedHits = [];
  const paywallHits = [];
  const seenVerifiedSlugs = new Set();

  for (const item of annotations) {
    if (!item) continue;
    if (item.kind === 'verified' && !seenVerifiedSlugs.has(item.slug)) {
      seenVerifiedSlugs.add(item.slug);
      verifiedHits.push(item);
    } else if (item.kind === 'paywall') {
      paywallHits.push(item);
      for (const alt of item.alternatives || []) {
        if (alt && !seenVerifiedSlugs.has(alt.slug)) {
          seenVerifiedSlugs.add(alt.slug);
          verifiedHits.push({
            kind: 'verified',
            slug: alt.slug,
            name: alt.name,
            score: alt.score,
            clientSideOnly: alt.clientSideOnly,
            detailUrl: alt.detailUrl || alt.url,
            category: item.category,
          });
        }
      }
    }
  }

  // Trigger summary bar when >= 2 verified tools or >= 1 paywall switch with >= 2 alternatives appear
  if (verifiedHits.length < 2) return null;

  // Check if any curated head-to-head comparison pair matches two tools in verifiedHits
  let compareUrl = null;
  let compareLabel = null;
  const pairs = Array.isArray(index.comparisons) ? index.comparisons : [];
  for (const pair of pairs) {
    if (seenVerifiedSlugs.has(pair.toolASlug) && seenVerifiedSlugs.has(pair.toolBSlug)) {
      compareUrl = pair.url;
      compareLabel = `${pair.toolAName} vs ${pair.toolBName}`;
      break;
    }
  }

  // Fallback action link: if there's a paywall target with an alternativePageUrl, use that; otherwise Finder
  if (!compareUrl) {
    const firstPaywallWithPage = paywallHits.find((p) => p.alternativePageUrl);
    if (firstPaywallWithPage) {
      compareUrl = firstPaywallWithPage.alternativePageUrl;
    } else if (queryText) {
      compareUrl = `https://nologin.tools${prefix}/finder?q=${encodeURIComponent(queryText)}`;
    } else {
      compareUrl = `https://nologin.tools${prefix}/finder`;
    }
  }

  return {
    verifiedCount: verifiedHits.length,
    paywallCount: paywallHits.length,
    tools: verifiedHits.slice(0, 4),
    paywallTargets: paywallHits.map((p) => p.targetName),
    compareUrl,
    compareLabel,
    finderUrl: `https://nologin.tools${prefix}/finder${queryText ? `?q=${encodeURIComponent(queryText)}` : ''}`,
  };
}
