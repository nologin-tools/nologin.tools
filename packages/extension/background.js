// NoLogin Quick Switcher v2.0 — Background Service Worker
// Non-intrusive Toolbar Icon Badge Updater + 24h Silent Remote Index Sync
// Zero DOM injection on tool websites. Matches active tab URL locally against extension-index JSON.

const REMOTE_TTL_MS = 24 * 60 * 60 * 1000;
let cachedIndexEn = null;
let cachedIndexZh = null;
let refreshInFlight = {};

function detectDefaultLang() {
  const uiLang = (chrome.i18n?.getUILanguage?.() || navigator.language || '').toLowerCase();
  return uiLang.startsWith('zh') ? 'zh' : 'en';
}

async function getActiveLang() {
  try {
    if (chrome.storage?.local) {
      const stored = await chrome.storage.local.get(['nl_lang_pref']);
      if (stored?.nl_lang_pref === 'zh' || stored?.nl_lang_pref === 'en') {
        return stored.nl_lang_pref;
      }
    }
  } catch {}
  return detectDefaultLang();
}

function isValidIndex(data) {
  return Boolean(
    data &&
      data.schema_version === '2.0' &&
      Array.isArray(data.tools) &&
      data.tools.length > 0 &&
      data.paywallTargets
  );
}

async function refreshRemoteIndex(lang, force = false) {
  const targetLang = lang === 'zh' ? 'zh' : 'en';
  if (refreshInFlight[targetLang]) return refreshInFlight[targetLang];

  const indexKey = `nl_remote_index_${targetLang}`;
  const timeKey = `nl_remote_fetched_at_${targetLang}`;

  refreshInFlight[targetLang] = (async () => {
    try {
      if (!force && chrome.storage?.local) {
        const stored = await chrome.storage.local.get([indexKey, timeKey]);
        const age = Date.now() - Number(stored?.[timeKey] || 0);
        if (isValidIndex(stored?.[indexKey]) && age >= 0 && age < REMOTE_TTL_MS) {
          if (targetLang === 'zh') cachedIndexZh = stored[indexKey];
          else cachedIndexEn = stored[indexKey];
          return stored[indexKey];
        }
      }

      const endpoint =
        targetLang === 'zh'
          ? 'https://nologin.tools/zh/api/extension-index.json'
          : 'https://nologin.tools/api/extension-index.json';
      const res = await fetch(endpoint, { headers: { 'cache-control': 'no-cache' } });
      if (res.ok) {
        const remoteData = await res.json();
        if (isValidIndex(remoteData)) {
          if (targetLang === 'zh') cachedIndexZh = remoteData;
          else cachedIndexEn = remoteData;
          if (chrome.storage?.local) {
            await chrome.storage.local.set({
              [indexKey]: remoteData,
              [timeKey]: Date.now(),
            });
          }
          return remoteData;
        }
      }
    } catch {
      // Offline or network blocked; fall back to bundled index
    } finally {
      refreshInFlight[targetLang] = null;
    }
    return null;
  })();

  return refreshInFlight[targetLang];
}

async function getIndex(langOverride) {
  const lang = langOverride || (await getActiveLang());
  const indexKey = `nl_remote_index_${lang}`;
  const timeKey = `nl_remote_fetched_at_${lang}`;

  try {
    if (chrome.storage?.local) {
      const stored = await chrome.storage.local.get([indexKey, timeKey]);
      const age = Date.now() - Number(stored?.[timeKey] || 0);
      if (isValidIndex(stored?.[indexKey])) {
        if (lang === 'zh') cachedIndexZh = stored[indexKey];
        else cachedIndexEn = stored[indexKey];
        if (age >= REMOTE_TTL_MS) {
          refreshRemoteIndex(lang, true);
        }
        return stored[indexKey];
      }
    }
  } catch {}

  const memCached = lang === 'zh' ? cachedIndexZh : cachedIndexEn;
  if (memCached) return memCached;

  const file = lang === 'zh' ? 'src/extension-index.zh.json' : 'src/extension-index.en.json';
  try {
    const res = await fetch(chrome.runtime.getURL(file));
    if (res.ok) {
      const data = await res.json();
      if (lang === 'zh') cachedIndexZh = data;
      else cachedIndexEn = data;
      refreshRemoteIndex(lang, false);
      return data;
    }
  } catch {}
  return null;
}

function matchSiteUrl(rawUrl, index) {
  if (!rawUrl || !index) return null;
  let parsed;
  try {
    parsed = new URL(rawUrl);
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

function computeToolbarBadge(rawUrl, index) {
  const isZh = index?.lang === 'zh';
  const defaultTitle = isZh
    ? 'NoLogin Quick Switcher — 免登录工具与隐私实测助手'
    : 'NoLogin Quick Switcher — Privacy & Zero-Signup Companion';

  if (!rawUrl || !index) {
    return { text: '', color: null, title: defaultTitle };
  }

  const match = matchSiteUrl(rawUrl, index);
  if (!match) {
    return { text: '', color: null, title: defaultTitle };
  }

  if (match.kind === 'verified') {
    const tool = match.tool;
    const score = tool.cades?.score;
    const text = typeof score === 'number' ? String(score) : '✓';
    const color =
      typeof score === 'number'
        ? score >= 85
          ? '#08695d'
          : '#1d4ed8'
        : '#08695d';
    const tierText = tool.cades?.tierLabel ? ` (${tool.cades.tierLabel})` : '';
    const title = isZh
      ? `🛡️ NoLogin 已验证 · ${tool.name} · ⚡ ${score ?? '✓'}/100${tierText}`
      : `🛡️ NoLogin Verified · ${tool.name} · ⚡ ${score ?? '✓'}/100${tierText}`;
    return { text, color, textColor: '#FFFFFF', title };
  }

  if (match.kind === 'paywall') {
    const count = match.alternatives.length;
    const targetName = match.target.targetName || match.domain;
    return {
      text: String(count),
      color: '#b45309',
      textColor: '#FFFFFF',
      title: isZh
        ? `⚡ 正在访问 ${targetName}？点击切换至 ${count} 款免登录隐私平替工具`
        : `⚡ Visiting ${targetName}? ${count} verified no-login alternatives ready`,
    };
  }

  return { text: '', color: null, textColor: '#FFFFFF', title: defaultTitle };
}

async function updateTabBadge(tabId, url) {
  if (!tabId) return;
  const index = await getIndex();
  const badge = computeToolbarBadge(url, index);
  try {
    await chrome.action.setBadgeText({ tabId, text: badge.text });
    if (badge.color) {
      await chrome.action.setBadgeBackgroundColor({ tabId, color: badge.color });
      if (chrome.action.setBadgeTextColor) {
        await chrome.action.setBadgeTextColor({ tabId, color: '#FFFFFF' });
      }
    }
    await chrome.action.setTitle({ tabId, title: badge.title });
  } catch {}
}

chrome.runtime.onInstalled?.addListener(async () => {
  try {
    await chrome.action.setBadgeTextColor?.({ color: '#FFFFFF' });
  } catch {}
  const lang = await getActiveLang();
  refreshRemoteIndex(lang, true);
});

chrome.runtime.onStartup?.addListener(async () => {
  try {
    await chrome.action.setBadgeTextColor?.({ color: '#FFFFFF' });
  } catch {}
  const lang = await getActiveLang();
  refreshRemoteIndex(lang, false);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateTabBadge(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateTabBadge(activeInfo.tabId, tab?.url);
  } catch {}
});

chrome.storage?.onChanged?.addListener(async (changes, area) => {
  if (area === 'local' && changes.nl_lang_pref) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        updateTabBadge(tab.id, tab.url);
      }
    } catch {}
  }
});
