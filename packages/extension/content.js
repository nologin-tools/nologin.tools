// NoLogin Quick Switcher v2.0 — Low-Noise SERP Inline Badge Annotator & Paywall Switch Bar (Search Engines Only)
// Zero DOM injection on tool websites. Zero private file access, zero browsing history upload.

(async function () {
  const SEARCH_ENGINE_HOST_PATTERN =
    /(?:^|\.)(?:google\.[a-z.]+|bing\.com|duckduckgo\.com|baidu\.com|yahoo\.com|yahoo\.co\.jp|brave\.com|startpage\.com|ecosia\.org|kagi\.com|qwant\.com|mojeek\.com|swisscows\.com|metager\.org|metager\.de|presearch\.com|searx\.be|priv\.au|opnxng\.com|bus-hit\.me|tiekoetter\.com|inetol\.net|paulgo\.io|naver\.com|daum\.net|goo\.ne\.jp|toutiao\.com|quark\.cn|yandex\.[a-z.]+|ya\.ru|sogou\.com|so\.com|seznam\.cz|perplexity\.ai|you\.com|phind\.com|felo\.ai|genspark\.ai|metaso\.cn)$/i;

  const AI_SEARCH_ENGINE_HOST_PATTERN =
    /(?:^|\.)(?:perplexity\.ai|you\.com|phind\.com|felo\.ai|genspark\.ai|metaso\.cn)$/i;

  function isSearchEngineHost(rawHost) {
    if (!rawHost) return false;
    const clean = String(rawHost).trim().toLowerCase().replace(/\.$/, '');
    return SEARCH_ENGINE_HOST_PATTERN.test(clean);
  }

  function isAiSearchEngineHost(rawHost) {
    if (!rawHost) return false;
    const clean = String(rawHost).trim().toLowerCase().replace(/\.$/, '');
    return AI_SEARCH_ENGINE_HOST_PATTERN.test(clean);
  }

  if (!isSearchEngineHost(location.hostname)) return;

  async function detectLang() {
    try {
      if (chrome.storage?.local) {
        const stored = await chrome.storage.local.get(['nl_lang_pref']);
        if (stored?.nl_lang_pref === 'zh' || stored?.nl_lang_pref === 'en') {
          return stored.nl_lang_pref;
        }
      }
    } catch {}
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  const lang = await detectLang();
  const isZh = lang === 'zh';
  const l = (zh, en) => (isZh ? zh : en);
  const prefix = isZh ? '/zh' : '';

  function extractSearchQuery(searchStr) {
    const params = new URLSearchParams(searchStr || '');
    for (const key of ['q', 'wd', 'word', 'p', 'query', 'text', 'keyword', 'MT', 'k']) {
      const val = params.get(key);
      if (val && val.trim()) return val.trim();
    }
    // Prefer visible/non-hidden search inputs first (Startpage places empty <input type="hidden" name="query" value="">
    // in header settings forms before the actual <input type="text" id="q" name="query"> search box on POST searches).
    const visibleInputs = document.querySelectorAll(
      'input:not([type="hidden"])#q, input:not([type="hidden"])#kw, input:not([type="hidden"])#sb_form_q, input:not([type="hidden"])#nx_query, input:not([type="hidden"])[name="q"], input:not([type="hidden"])[name="query"], input:not([type="hidden"])[name="wd"], input:not([type="hidden"])[name="p"], input:not([type="hidden"])[name="text"], input:not([type="hidden"])[name="keyword"], input:not([type="hidden"])[name="MT"], textarea[name="q"]'
    );
    for (const inp of visibleInputs) {
      const val = (inp?.value || '').trim();
      if (val) return val;
    }
    const allInputs = document.querySelectorAll(
      'input[name="q"], input[name="query"], input[name="wd"], input[name="p"], input[name="text"], input[name="keyword"], input[name="MT"], input#q, input#kw, input#sb_form_q, input#nx_query, textarea[name="q"]'
    );
    for (const inp of allInputs) {
      const val = (inp?.value || '').trim();
      if (val) return val;
    }
    return '';
  }

  function unwrapRedirectUrl(rawUrl) {
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

    // 5. Generic search engine redirect parameters
    if (isSearchEngineHost(host)) {
      for (const key of ['url', 'q', 'target', 'uddg', 'ru', 'u', 'to', 'link', 'dest', 'redirect']) {
        const val = parsed.searchParams.get(key);
        if (val && /^https?:\/\//i.test(val)) return val;
      }
    }

    return rawUrl;
  }

  function parseCiteToUrl(citeText) {
    if (!citeText) return null;
    const text = String(citeText).trim();
    if (/https?:\/\//i.test(text) && text.includes('›')) {
      const normalized = text
        .replace(/^.*?https?:\/\//i, (m) => m.match(/https?:\/\//i)[0])
        .split(/\s*›\s*/)
        .map((part) => part.trim().replace(/[\s….\u4e00-\u9fff]+$/g, ''))
        .filter(Boolean)
        .join('/');
      if (/^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(normalized)) return normalized;
    }
    const urlMatch = text.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s<>›"'\u4e00-\u9fff]*)?/i);
    if (urlMatch) {
      let matched = urlMatch[0];
      if (/(?:\.{2,}|…)$/.test(matched)) {
        matched = matched.replace(/\/[^/]*(?:\.{2,}|…)$/, '/').replace(/(?:\.{2,}|…)+$/, '');
      }
      return matched;
    }
    const domainMatch = text.match(/(?:^|\s)((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/[^\s<>›"'\u4e00-\u9fff]*)?/i);
    if (domainMatch) {
      const clean = domainMatch[1].replace(/(?:\.{2,}|…)+$/, '');
      if (!isSearchEngineHost(clean)) {
        return `https://${clean}`;
      }
    }
    return null;
  }

  function resolveResultUrlFromDom(anchor) {
    const rawHref = anchor.href || '';
    const unwrapped = unwrapRedirectUrl(rawHref);
    try {
      const u = new URL(unwrapped);
      if (!isSearchEngineHost(u.hostname)) return unwrapped;
    } catch {}

    const card = anchor.closest(
      '[mu], [data-landurl], li.b_algo, .result, .result-op, .c-container, .cosc-card, .vrwrap, .rb, li.res-list, .dd.algo, .snippet, article[data-testid="result"], [data-test-id="mainline-result-web"], .sw-Card, .Algo, .total_wrap, .bx, .c-item-doc, [data-testid="webResult"], article.item, article.result, .Result'
    );
    const attrCandidates = [
      anchor.getAttribute('data-mdurl'),
      anchor.getAttribute('data-url'),
      anchor.getAttribute('data-landurl'),
      card?.getAttribute('mu'),
      card?.getAttribute('data-landurl'),
      card?.getAttribute('data-url'),
    ];
    for (const cand of attrCandidates) {
      if (cand && /^https?:\/\//i.test(cand.trim())) {
        return cand.trim();
      }
    }

    if (card) {
      const citeEl = card.querySelector(
        'cite, .b_attribution cite, .citeurl, .citeLinkClass, .g-linkinfo-a, .c-showurl, .c-color-gray, .cosc-source'
      );
      const fromCite = parseCiteToUrl(citeEl?.textContent);
      if (fromCite) return fromCite;
    }

    return unwrapped;
  }

  function matchSiteUrl(rawUrl, index) {
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

    const pathLower = (parsed.pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
    const tools = Array.isArray(index.tools) ? index.tools : [];
    let matchedTool = null;

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
      return {
        kind: 'verified',
        domain: matchedTool.hostname,
        tool: matchedTool,
        comparisons: Array.isArray(matchedTool.comparisons) ? matchedTool.comparisons : [],
      };
    }

    const paywallTargets = index.paywallTargets || {};
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

    return null;
  }

  async function loadIndex() {
    const indexKey = `nl_remote_index_${lang}`;
    try {
      if (chrome.storage?.local) {
        const stored = await chrome.storage.local.get([indexKey]);
        if (stored?.[indexKey]?.schema_version === '2.0' && Array.isArray(stored[indexKey].tools)) {
          return stored[indexKey];
        }
      }
    } catch {}
    const file = isZh ? 'src/extension-index.zh.json' : 'src/extension-index.en.json';
    try {
      const url = chrome.runtime.getURL(file);
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  // Walk up from heading anchor past any Google SERP header wrapper using transform: scaleY(-1)
  // AND past any compact horizontal flex title row (e.g. Baidu's .title-box_6uu5k -> .title-wrapper_4oy6O)
  // so the badge always sits cleanly on its own line below the title bar, never squeezed beside the title.
  function insertBadgeSafely(anchor, badge) {
    const cardOrListStopSelector = [
      'li', 'article', 'section', 'main', 'body',
      // Google
      '#rso', '#search', '.MjjYud', '.g',
      // Bing
      '#b_results', 'li.b_algo',
      // DuckDuckGo
      '[data-testid="mainline"]', '.react-results--main', 'article[data-testid="result"]', 'li[data-layout="organic"]',
      // Baidu
      '#content_left', '.c-container', '.result', '.result-op', '.cosc-card', '.cosc-card-content',
      // Yahoo
      '#web', '.dd.algo', '.sw-Card', '.Algo',
      // Brave
      '#results', '.snippet',
      // Startpage
      '.w-gl',
      // Ecosia
      '[data-test-id="mainline-result-web"]',
      // Kagi
      '.__sri', '._0_main-search-results',
      // Yandex
      '#search-result', '.serp-list', '.serp-item', '.Organic',
      // Sogou & 360 Search
      '.vrwrap', '.rb', 'li.res-list',
      // Naver / Daum / Qwant / Seznam
      '.total_wrap', '.bx', '.c-item-doc', '[data-testid="webResult"]', '.Result',
    ].join(', ');

    let base = anchor.querySelector('h3, h2, h4, .search-snippet-title, .snippet-title, .wgl-title, .sw-Card__titleInner, .api_txt_lines')
      ? anchor
      : (anchor.closest('h3, h2, .total_tit, .tit_main, .sw-Card__title, .result_header') || anchor);

    if (
      base.parentElement?.classList?.contains('compTitle') ||
      base.parentElement?.classList?.contains('OrganicTitle')
    ) {
      base = base.parentElement;
    }

    // Step up past compact single-line horizontal flex heading rows (e.g. Baidu's nested
    // .title-box_6uu5k -> .title-wrapper_4oy6O, height < 52px) so the badge always sits on its
    // own line below the title bar instead of squeezed to the right of the title.
    let flexStep = 0;
    while (
      base.parentElement &&
      !base.parentElement.matches?.(cardOrListStopSelector) &&
      flexStep < 4
    ) {
      try {
        const parentEl = base.parentElement;
        const parentClass = typeof parentEl.className === 'string' ? parentEl.className : '';
        const parentStyle = window.getComputedStyle(parentEl);
        const parentRect = parentEl.getBoundingClientRect();
        const isCompactFlexRow =
          parentStyle &&
          (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') &&
          parentStyle.flexDirection.startsWith('row') &&
          parentRect.height > 0 &&
          parentRect.height < 52;
        const isKnownTitleRow = /(?:^|\s)(?:title-box|title-wrapper|c-title-wrap|t-row)/i.test(parentClass);
        if (isCompactFlexRow || isKnownTitleRow) {
          base = parentEl;
          flexStep++;
          continue;
        }
      } catch {}
      break;
    }

    let safe = base;
    let curr = base;
    let depth = 0;

    while (
      curr &&
      curr.parentElement &&
      !curr.matches?.(cardOrListStopSelector) &&
      !curr.parentElement.matches?.(cardOrListStopSelector) &&
      depth < 6
    ) {
      try {
        const style = window.getComputedStyle(curr);
        if (style && style.transform && style.transform !== 'none') {
          safe = curr;
        }
      } catch {}
      if (curr.classList?.contains('yuRUbf') || curr.classList?.contains('b8lM7')) {
        safe = curr;
      }
      curr = curr.parentElement;
      depth++;
    }

    safe.insertAdjacentElement('afterend', badge);

    // Post-insertion safety check 1: ensure badge is not sitting inside a horizontal flex title row
    let flexParent = badge.parentElement;
    let flexFixDepth = 0;
    while (
      flexParent &&
      flexParent !== document.body &&
      !flexParent.matches?.(cardOrListStopSelector) &&
      flexFixDepth < 3
    ) {
      try {
        const ps = window.getComputedStyle(flexParent);
        const pr = flexParent.getBoundingClientRect();
        if (
          ps &&
          (ps.display === 'flex' || ps.display === 'inline-flex') &&
          ps.flexDirection.startsWith('row') &&
          pr.height > 0 &&
          pr.height < 90
        ) {
          flexParent.insertAdjacentElement('afterend', badge);
          flexParent = badge.parentElement;
          flexFixDepth++;
          continue;
        }
      } catch {}
      break;
    }

    // Post-insertion safety check 2: verify no ancestor of badge inside the card has a CSS transform (e.g. scaleY(-1))
    let anc = badge.parentElement;
    let outermostTransformed = null;
    let checkDepth = 0;
    while (anc && anc !== document.body && !anc.matches?.(cardOrListStopSelector) && checkDepth < 6) {
      try {
        const tr = window.getComputedStyle(anc).transform;
        if (tr && tr !== 'none') {
          outermostTransformed = anc;
        }
      } catch {}
      anc = anc.parentElement;
      checkDepth++;
    }
    if (outermostTransformed && !outermostTransformed.matches?.(cardOrListStopSelector)) {
      outermostTransformed.insertAdjacentElement('afterend', badge);
    }
  }

  function findSummaryInsertionTarget() {
    const host = location.hostname.toLowerCase();
    // DuckDuckGo: target ol.react-results--main inside section[data-testid="mainline"] (below filter bar),
    // never the legacy empty div.results--main[data-testid="mainline"] at x=0.
    if (host.includes('duckduckgo.com')) {
      const ddgList =
        document.querySelector('ol.react-results--main') ||
        document.querySelector('.react-results--main') ||
        document.querySelector('#links.results');
      if (ddgList) return { node: ddgList, position: 'beforebegin' };
    }
    // Bing: #b_results is display:inline-block next to #b_context; prepend inside #b_results so the right sidebar never shifts.
    if (host.includes('bing.com')) {
      const bingList = document.querySelector('#b_results');
      if (bingList) return { node: bingList, position: 'afterbegin' };
    }
    // Baidu: #content_left is floated left; prepend inside #content_left so it aligns with the 608px result column.
    if (host.includes('baidu.com')) {
      const baiduLeft = document.querySelector('#content_left');
      if (baiduLeft) return { node: baiduLeft, position: 'afterbegin' };
    }
    // Yahoo: #web ol.searchCenterMiddle (below top ads, inside 616px main column)
    if (host.includes('yahoo.com') || host.includes('yahoo.co.jp')) {
      const yahooList =
        document.querySelector('#web ol.searchCenterMiddle') ||
        document.querySelector('#web') ||
        document.querySelector('#cols #left') ||
        document.querySelector('#contents .Contents__inner') ||
        document.querySelector('#contents');
      if (yahooList) return { node: yahooList, position: 'beforebegin' };
    }
    if (host.includes('naver.com')) {
      const naverList = document.querySelector('#main_pack') || document.querySelector('#content');
      if (naverList) return { node: naverList, position: 'afterbegin' };
    }
    if (host.includes('daum.net')) {
      const daumList = document.querySelector('#mArticle') || document.querySelector('#daumContent');
      if (daumList) return { node: daumList, position: 'afterbegin' };
    }
    if (host.includes('qwant.com')) {
      const qwantList =
        document.querySelector('[data-testid="sectionWeb"]') ||
        document.querySelector('[data-testid="web-results"]');
      if (qwantList) return { node: qwantList, position: 'afterbegin' };
    }
    if (host.includes('mojeek.com')) {
      const mojeekList = document.querySelector('ul.results-standard');
      if (mojeekList) return { node: mojeekList, position: 'beforebegin' };
    }
    if (host.includes('swisscows.com')) {
      const swisscowsList = document.querySelector('.web-results') || document.querySelector('main');
      if (swisscowsList) return { node: swisscowsList, position: 'afterbegin' };
    }
    if (host.includes('seznam.cz')) {
      const seznamList = document.querySelector('#result-list') || document.querySelector('main');
      if (seznamList) return { node: seznamList, position: 'afterbegin' };
    }
    // Brave Search: #results
    if (host.includes('brave.com')) {
      const braveList = document.querySelector('#results');
      if (braveList) return { node: braveList, position: 'afterbegin' };
    }
    // Startpage: insert right before .w-gl inside section#main so it stays aligned with the 598px result column
    if (host.includes('startpage.com')) {
      const spWgl = document.querySelector('section#main .w-gl') || document.querySelector('.w-gl');
      if (spWgl) return { node: spWgl, position: 'beforebegin' };
      const spMain = document.querySelector('section#main');
      if (spMain) return { node: spMain, position: 'afterbegin' };
    }
    // Ecosia: [data-test-id="mainline"] or .mainline
    if (host.includes('ecosia.org')) {
      const ecosiaList =
        document.querySelector('[data-test-id="mainline"]') ||
        document.querySelector('.mainline__content') ||
        document.querySelector('.mainline');
      if (ecosiaList) return { node: ecosiaList, position: 'afterbegin' };
    }
    // Kagi & Yandex
    if (host.includes('kagi.com')) {
      const kagiList = document.querySelector('._0_main-search-results') || document.querySelector('#main');
      if (kagiList) return { node: kagiList, position: 'afterbegin' };
    }
    if (host.includes('yandex.') || host === 'ya.ru') {
      const yandexList =
        document.querySelector('#search-result') ||
        document.querySelector('ul.serp-list') ||
        document.querySelector('.main__content');
      if (yandexList) return { node: yandexList, position: 'beforebegin' };
    }
    // Sogou: #main .results
    if (host.includes('sogou.com')) {
      const sogouList = document.querySelector('#main .results') || document.querySelector('.results');
      if (sogouList) return { node: sogouList, position: 'afterbegin' };
    }
    // 360 Search (so.com): #main ul.result
    if (host.includes('so.com')) {
      const soList = document.querySelector('#main ul.result') || document.querySelector('ul.result');
      if (soList) return { node: soList, position: 'beforebegin' };
    }
    // Google & default fallback
    const fallback =
      document.querySelector('#rso') ||
      document.querySelector('#search') ||
      document.querySelector('#urls') ||
      document.querySelector('ol.react-results--main') ||
      document.querySelector('.react-results--main') ||
      document.querySelector('#b_results') ||
      document.querySelector('main');
    if (fallback) return { node: fallback, position: 'beforebegin' };
    return null;
  }

  function makeSep() {
    const sep = document.createElement('span');
    sep.className = 'nl-serp-sep';
    sep.textContent = '·';
    return sep;
  }

  const index = await loadIndex();
  if (!index) return;

  let lastSearchSignature = '';
  let queryText = '';
  let annotatedAnchors = new WeakSet();
  const annotatedByDomain = new Map();

  const SKIP_ANCESTOR_SELECTOR = [
    'table',
    '.usJj9c', '.HiHjCd', '.d4rhi', '.osl', '.MhgNwc', '[jsname="yEVEwb"]', '[data-initq]', 'g-scrolling-carousel', '[role="dialog"]',
    '#b_context', '.b_ans', '.b_ad', '.b_deeplinks', '.b_vlist2col', '.b_rich',
    '[data-testid="ad"]', '.badge--ad', '.results--sidebar', '.js-sidebar-ads',
    '#content_right', '.ec_tuiguang', '.ad-block', '.ad-widget', '.EC_result', '[cmatchid]',
    '.searchCenterTopAds', '.searchCenterBottomAds', '#right', '.AdTop', '.ads',
    '#side', '#so_top', '#so-pdr-guide', '[class*="followUp"]', '.anonymous-view-link',
  ].join(', ');

  function updateSummaryBar(liveMatches) {
    const verifiedTools = [];
    const seenSlugs = new Set();
    const paywallTargets = [];

    for (const m of liveMatches) {
      if (m.kind === 'verified' && m.tool && !seenSlugs.has(m.tool.slug)) {
        seenSlugs.add(m.tool.slug);
        verifiedTools.push(m.tool);
      } else if (m.kind === 'paywall' && m.target) {
        paywallTargets.push(m.target);
        for (const alt of m.alternatives || []) {
          if (alt && !seenSlugs.has(alt.slug)) {
            seenSlugs.add(alt.slug);
            verifiedTools.push(alt);
          }
        }
      }
    }

    if (verifiedTools.length < 2) return;

    const insertionTarget = findSummaryInsertionTarget();
    if (!insertionTarget) return;

    let compareUrl = null;
    let compareText = null;
    const pairs = Array.isArray(index.comparisons) ? index.comparisons : [];
    for (const pair of pairs) {
      if (seenSlugs.has(pair.toolASlug) && seenSlugs.has(pair.toolBSlug)) {
        compareUrl = pair.url;
        compareText = l(
          `${pair.toolAName} vs ${pair.toolBName} 对比 ↗`,
          `${pair.toolAName} vs ${pair.toolBName} ↗`
        );
        break;
      }
    }

    const previewLimit = verifiedTools.length > 3 ? 2 : 3;
    const preview = verifiedTools
      .slice(0, previewLimit)
      .map((t) => `${t.name}${t.cades?.score ? ` ${t.cades.score}` : ''}`)
      .join(' · ');
    const previewLabel = verifiedTools.length > previewLimit ? `${preview}…` : preview;

    let bar = document.getElementById('nl-serp-summary-bar');
    if (!bar || !bar.isConnected) {
      bar = document.createElement('div');
      bar.id = 'nl-serp-summary-bar';
      // Leading "b_" class satisfies Bing's CI.AdPrevention MutationObserver
      bar.className = 'b_nl-serp-summary-bar nl-serp-summary-bar';
      insertionTarget.node.insertAdjacentElement(insertionTarget.position, bar);
    }

    bar.title = verifiedTools
      .map((t) => `${t.name}${t.cades?.score ? ` ${t.cades.score}/100` : ''}`)
      .join(' · ');
    bar.replaceChildren();
    const textWrap = document.createElement('span');
    textWrap.className = 'nl-serp-summary-text';
    const strong = document.createElement('strong');
    strong.textContent = '✓ nologin.tools：';
    const detail = document.createElement('span');
    detail.textContent =
      paywallTargets.length > 0
        ? l(
            `已为本页结果匹配 ${verifiedTools.length} 款免登录工具（${previewLabel}）`,
            `${verifiedTools.length} zero-login tools matched for this search (${previewLabel})`
          )
        : l(
            `本页命中 ${verifiedTools.length} 款已验证免登录工具（${previewLabel}）`,
            `${verifiedTools.length} verified zero-login tools on this page (${previewLabel})`
          );
    textWrap.append(strong, detail);

    const actions = document.createElement('span');
    actions.className = 'nl-serp-summary-actions';

    if (compareUrl && compareText) {
      const vsBtn = document.createElement('a');
      vsBtn.className = 'nl-serp-cta';
      vsBtn.href = compareUrl;
      vsBtn.target = '_blank';
      vsBtn.rel = 'noopener';
      vsBtn.textContent = compareText;
      actions.appendChild(vsBtn);
    } else if (paywallTargets[0]?.alternativePageUrl) {
      const altBtn = document.createElement('a');
      altBtn.className = 'nl-serp-cta';
      altBtn.href = paywallTargets[0].alternativePageUrl;
      altBtn.target = '_blank';
      altBtn.rel = 'noopener';
      altBtn.textContent = l(
        `${paywallTargets[0].targetName} 免登录平替榜 ↗`,
        `${paywallTargets[0].targetName} Alternatives ↗`
      );
      actions.appendChild(altBtn);
    }

    const finderLink = document.createElement('a');
    finderLink.className = 'nl-serp-link';
    finderLink.href = `https://nologin.tools${prefix}/finder${queryText ? `?q=${encodeURIComponent(queryText)}` : ''}`;
    finderLink.target = '_blank';
    finderLink.rel = 'noopener';
    finderLink.textContent = l('免登录罗盘 ↗', 'No-Login Finder ↗');
    actions.appendChild(finderLink);

    bar.append(textWrap, actions);
  }

  function scanAndAnnotate() {
    const currentQuery = extractSearchQuery(location.search);
    const currentSig = `${location.pathname}${location.search}#${currentQuery}`;
    if (currentSig !== lastSearchSignature) {
      lastSearchSignature = currentSig;
      queryText = currentQuery;
      annotatedAnchors = new WeakSet();
      annotatedByDomain.clear();
      document.getElementById('nl-serp-summary-bar')?.remove();
      for (const oldBadge of document.querySelectorAll('.nl-serp-badge')) {
        oldBadge.remove();
      }
    } else if (!queryText && currentQuery) {
      queryText = currentQuery;
    }

    // Self-heal when SSR hydration or SPA re-renders detach previously annotated anchors or badges
    let healed = false;
    for (const [domain, record] of annotatedByDomain.entries()) {
      const anchorAlive = Boolean(record.anchor && record.anchor.isConnected && document.body.contains(record.anchor));
      const badgeAlive = Boolean(record.badge && record.badge.isConnected && document.body.contains(record.badge));
      if (!anchorAlive || !badgeAlive) {
        if (record.badge?.isConnected) record.badge.remove();
        if (record.anchor) annotatedAnchors.delete(record.anchor);
        annotatedByDomain.delete(domain);
        healed = true;
      }
    }

    const anchors = Array.from(document.querySelectorAll('a[href]'));
    let added = false;
    const isAiHost = isAiSearchEngineHost(location.hostname);
    const currentSerpDomain = location.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');

    for (const a of anchors) {
      if (annotatedAnchors.has(a)) continue;
      if (!a.href || !/^https?:\/\//i.test(a.href)) continue;
      if (a.closest('.nl-serp-badge, .nl-serp-summary-bar')) continue;
      if (a.closest(SKIP_ANCESTOR_SELECTOR)) continue;

      const heading =
        a.querySelector('h3, h2, h4, .search-snippet-title, .snippet-title, .wgl-title, .sw-Card__titleInner, .api_txt_lines') ||
        a.closest('h3, h2, .total_tit, .tit_main, .sw-Card__title, .result_header') ||
        (a.matches(
          '.result__title, .w-gl__result-title, a.result-title, a[data-testid="result-title-a"], a[data-testid="gl-title-link"], a.heading-serpresult, a.link_tit, a.total_tit, a.f_link_b, a.title, a[data-testid="serp-link"]'
        )
          ? a
          : null) ||
        (isAiHost &&
        !a.closest('nav, header, footer, aside') &&
        (a.textContent || '').trim().length >= 3
          ? a
          : null);
      if (!heading) continue;

      annotatedAnchors.add(a);
      const resolvedUrl = resolveResultUrlFromDom(a);
      const match = matchSiteUrl(resolvedUrl, index);
      if (!match || (match.kind !== 'verified' && match.kind !== 'paywall')) continue;

      if (
        match.domain === currentSerpDomain ||
        currentSerpDomain.endsWith(`.${match.domain}`) ||
        match.domain.endsWith(`.${currentSerpDomain}`)
      ) {
        continue;
      }

      if (annotatedByDomain.has(match.domain)) continue;
      added = true;

      const badge = document.createElement('div');

      if (match.kind === 'verified') {
        const t = match.tool;
        badge.className = 'b_nl-serp-badge nl-serp-badge nl-serp-verified';
        badge.title = t.cades?.bestFor || t.description || '';

        const titleNode = document.createElement('strong');
        titleNode.textContent = `✓ ${l('NoLogin 已验证', 'NoLogin Verified')}`;
        badge.appendChild(titleNode);

        if (typeof t.cades?.score === 'number') {
          const scorePill = document.createElement('span');
          scorePill.className = 'nl-serp-score';
          scorePill.textContent = `${t.cades.score}/100`;
          badge.appendChild(scorePill);
        }

        if (t.cades?.tierLabel) {
          badge.appendChild(makeSep());
          const tierSpan = document.createElement('span');
          tierSpan.className = 'nl-serp-tag';
          tierSpan.textContent = t.cades.tierLabel;
          badge.appendChild(tierSpan);
        }

        badge.appendChild(makeSep());
        const privacySpan = document.createElement('span');
        privacySpan.className = 'nl-serp-tag';
        privacySpan.textContent = t.capabilities?.clientSideOnly
          ? l('本地处理', '100% Local')
          : l('免登录直用', 'Zero Signup');
        badge.appendChild(privacySpan);

        if (t.capabilities?.openSource) {
          badge.appendChild(makeSep());
          const osSpan = document.createElement('span');
          osSpan.className = 'nl-serp-meta';
          osSpan.textContent = l('开源', 'Open Source');
          badge.appendChild(osSpan);
        }

        badge.appendChild(makeSep());
        const reportLink = document.createElement('a');
        reportLink.className = 'nl-serp-link';
        reportLink.href = t.detailUrl;
        reportLink.target = '_blank';
        reportLink.rel = 'noopener';
        reportLink.textContent = l('实测档案 ↗', 'Lab Report ↗');
        badge.appendChild(reportLink);

        if (Array.isArray(match.comparisons) && match.comparisons.length > 0) {
          badge.appendChild(makeSep());
          const vsLink = document.createElement('a');
          vsLink.className = 'nl-serp-link';
          vsLink.href = match.comparisons[0].url;
          vsLink.target = '_blank';
          vsLink.rel = 'noopener';
          vsLink.textContent = `vs ${match.comparisons[0].vsName} ↗`;
          badge.appendChild(vsLink);
        }
      } else if (match.kind === 'paywall') {
        const target = match.target;
        const alts = (match.alternatives || []).slice(0, 2);
        badge.className = 'b_nl-serp-badge nl-serp-badge nl-serp-paywall';
        badge.title = target.headline || '';

        const titleNode = document.createElement('strong');
        titleNode.textContent = l('需登录/付费墙 · 免登录平替：', 'Signup Wall · No-Login Switch:');
        badge.appendChild(titleNode);

        alts.forEach((alt, idx) => {
          if (idx > 0) badge.appendChild(makeSep());
          const altLink = document.createElement('a');
          altLink.className = 'nl-serp-alt-link';
          altLink.href = alt.url;
          altLink.target = '_blank';
          altLink.rel = 'noopener';
          altLink.textContent = alt.name;
          if (typeof alt.cades?.score === 'number') {
            const altScore = document.createElement('span');
            altScore.className = 'nl-serp-score nl-serp-score-sm';
            altScore.textContent = String(alt.cades.score);
            altLink.appendChild(altScore);
          }
          const arrow = document.createElement('span');
          arrow.textContent = ' ↗';
          altLink.appendChild(arrow);
          badge.appendChild(altLink);
        });

        if (target.alternativePageUrl) {
          badge.appendChild(makeSep());
          const moreLink = document.createElement('a');
          moreLink.className = 'nl-serp-link';
          moreLink.href = target.alternativePageUrl;
          moreLink.target = '_blank';
          moreLink.rel = 'noopener';
          moreLink.textContent = l(
            `全部 ${match.alternatives.length} 款对比 ↗`,
            `Compare all ${match.alternatives.length} ↗`
          );
          badge.appendChild(moreLink);
        }
      }

      insertBadgeSafely(a, badge);
      annotatedByDomain.set(match.domain, { ...match, anchor: a, badge });
    }

    const liveMatches = Array.from(annotatedByDomain.values());
    const existingBar = document.getElementById('nl-serp-summary-bar');
    if (added || healed || (liveMatches.length >= 2 && (!existingBar || !existingBar.isConnected))) {
      updateSummaryBar(liveMatches);
    }
  }

  scanAndAnnotate();
  window.addEventListener('app:hydrated', () => setTimeout(scanAndAnnotate, 60));
  window.addEventListener('load', () => setTimeout(scanAndAnnotate, 120));
  setTimeout(scanAndAnnotate, 400);
  setTimeout(scanAndAnnotate, 1000);
  setTimeout(scanAndAnnotate, 2200);

  let timer = null;
  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(scanAndAnnotate, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
