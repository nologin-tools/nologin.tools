// NoLogin Quick Switcher v2.0 - Popup Controller
// Supports Bilingual (EN/ZH) Index, CADES 2.0 5D HUD, Paywall Switcher, Scenario Presets, and 1-Click Nomination

let currentLang = (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
let currentIndex = null;
let allTools = [];
let paywallTargets = {};
let currentCategory = 'all';
let currentPreset = 'all';
let currentQuery = '';
let focusedIndex = -1;

const searchInput = document.getElementById('search-input');
const presetChips = document.getElementById('preset-chips');
const categoryPills = document.getElementById('category-pills');
const resultsList = document.getElementById('results-list');
const resultsCount = document.getElementById('results-count');
const langToggleBtn = document.getElementById('lang-toggle');

const verifiedBanner = document.getElementById('verified-banner');
const altBanner = document.getElementById('alternative-banner');
const nominateBanner = document.getElementById('nominate-banner');

const IGNORED_NOMINATION_HOSTS =
  /(?:^|\.)(?:nologin\.tools|nologintools\.org|google\.[a-z.]+|bing\.com|duckduckgo\.com|baidu\.com|yahoo\.com|yahoo\.co\.jp|brave\.com|startpage\.com|ecosia\.org|kagi\.com|qwant\.com|mojeek\.com|swisscows\.com|metager\.org|metager\.de|presearch\.com|searx\.be|priv\.au|opnxng\.com|bus-hit\.me|tiekoetter\.com|inetol\.net|paulgo\.io|naver\.com|daum\.net|goo\.ne\.jp|toutiao\.com|quark\.cn|yandex\.[a-z.]+|ya\.ru|sogou\.com|so\.com|seznam\.cz|perplexity\.ai|you\.com|phind\.com|felo\.ai|genspark\.ai|metaso\.cn|localhost|github\.com|gitlab\.com|bitbucket\.org|npmjs\.com|wikipedia\.org|youtube\.com|youtu\.be|x\.com|twitter\.com|reddit\.com|facebook\.com|instagram\.com|linkedin\.com|apple\.com|microsoft\.com|mozilla\.org|cloudflare\.com)$/i;

function l(zh, en) {
  return currentLang === 'zh' ? zh : en;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function initLanguagePref() {
  try {
    const localPref = localStorage.getItem('nl_lang_pref');
    if (localPref === 'zh' || localPref === 'en') {
      currentLang = localPref;
    } else if (chrome.storage?.local) {
      const stored = await chrome.storage.local.get(['nl_lang_pref']);
      if (stored?.nl_lang_pref === 'zh' || stored?.nl_lang_pref === 'en') {
        currentLang = stored.nl_lang_pref;
      }
    }
  } catch {}
}

async function saveLanguagePref(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  try {
    localStorage.setItem('nl_lang_pref', currentLang);
    if (chrome.storage?.local) {
      await chrome.storage.local.set({ nl_lang_pref: currentLang });
    }
  } catch {}
}

async function loadData() {
  const indexKey = `nl_remote_index_${currentLang}`;
  try {
    if (chrome.storage?.local) {
      const stored = await chrome.storage.local.get([indexKey]);
      if (stored?.[indexKey]?.schema_version === '2.0' && Array.isArray(stored[indexKey].tools)) {
        currentIndex = stored[indexKey];
        allTools = currentIndex.tools;
        paywallTargets = currentIndex.paywallTargets || {};
        return;
      }
    }
  } catch {}

  try {
    const file = currentLang === 'zh' ? 'src/extension-index.zh.json' : 'src/extension-index.en.json';
    const res = await fetch(chrome.runtime.getURL(file));
    if (res.ok) {
      currentIndex = await res.json();
      allTools = currentIndex.tools || [];
      paywallTargets = currentIndex.paywallTargets || {};
      return;
    }
  } catch {}

  // Legacy fallback
  try {
    const [toolsRes, altsRes] = await Promise.all([
      fetch(chrome.runtime.getURL('src/tools-data.json')),
      fetch(chrome.runtime.getURL('src/alternatives-data.json')),
    ]);
    allTools = await toolsRes.json();
    paywallTargets = await altsRes.json();
    currentIndex = { lang: currentLang, tools: allTools, paywallTargets };
  } catch (err) {
    console.error('Error loading extension data:', err);
    allTools = [];
    paywallTargets = {};
    currentIndex = { lang: currentLang, tools: [], paywallTargets: {} };
  }
}

function updateStaticLabels() {
  const prefix = currentLang === 'zh' ? '/zh' : '';
  const totalCount = allTools.length || 320;

  if (langToggleBtn) {
    langToggleBtn.textContent = currentLang === 'zh' ? 'EN' : '中文';
  }
  const tagline = document.getElementById('header-tagline');
  if (tagline) {
    tagline.textContent = l('零账号注册 · CADES 2.0 实机认证', 'Zero Signup · CADES 2.0 Lab Verified');
  }
  const homeLink = document.getElementById('header-home-link');
  if (homeLink) {
    homeLink.href = `https://nologin.tools${prefix}`;
  }

  if (searchInput) {
    searchInput.placeholder = l(
      `搜索 ${totalCount}+ 款免登录工具或想替换的软件（如 Canva / PDF）...`,
      `Search ${totalCount}+ zero-login tools or SaaS to replace...`
    );
  }

  // Preset chips
  const presetMap = {
    'preset-all': l('全部高分', 'Top Scored'),
    'preset-local': l('纯本地零上传', '100% Local'),
    'preset-editors': l('编辑精选 ≥90', "Editor's Choice"),
    'preset-opensource': l('开源免费', 'Open Source'),
  };
  for (const [id, text] of Object.entries(presetMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Category pills
  const catMap = {
    'cat-all': l('全部', 'All'),
    'cat-ai': 'AI',
    'cat-design': l('设计', 'Design'),
    'cat-prod': l('PDF与办公', 'PDF & Office'),
    'cat-dev': l('开发', 'Dev'),
    'cat-media': l('音视频', 'Media'),
    'cat-privacy': l('隐私安全', 'Privacy'),
    'cat-writing': l('写作', 'Writing'),
    'cat-data': l('数据', 'Data'),
  };
  for (const [id, text] of Object.entries(catMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Footer
  const footerLab = document.getElementById('footer-lab');
  const footerFinder = document.getElementById('footer-finder');
  const footerPrivacy = document.getElementById('footer-privacy');
  const footerSubmit = document.getElementById('footer-submit');
  if (footerLab) {
    footerLab.href = `https://nologin.tools${prefix}/lab`;
    footerLab.textContent = l('实验室', 'Lab');
  }
  if (footerFinder) {
    footerFinder.href = `https://nologin.tools${prefix}/finder`;
    footerFinder.textContent = l('罗盘', 'Finder');
  }
  if (footerPrivacy) {
    footerPrivacy.href = `https://nologin.tools${prefix}/privacy`;
    footerPrivacy.textContent = l('隐私', 'Privacy');
  }
  if (footerSubmit) {
    footerSubmit.href = `https://nologin.tools${prefix}/submit`;
    footerSubmit.textContent = l('提交工具', 'Submit');
  }

  const reviewText = document.getElementById('review-text');
  const reviewBtn = document.getElementById('review-btn');
  if (reviewText) {
    reviewText.textContent = l('喜欢 NoLogin 插件？给我们点个五星好评！', 'Enjoying NoLogin? Leave a review!');
  }
  if (reviewBtn) {
    reviewBtn.textContent = l('去评价 ↗', 'Rate ↗');
  }
}

function matchSiteUrl(rawUrl) {
  if (!rawUrl) return null;
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

  const prefix = currentLang === 'zh' ? '/zh' : '';
  const pathLower = (parsed.pathname || '/').toLowerCase().replace(/\/$/, '') || '/';

  // 1. Check Verified Tools
  const hostCandidates = allTools.filter(
    (t) => t.hostname === cleanHost || cleanHost.endsWith(`.${t.hostname}`)
  );
  let matchedTool = null;

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
    const sameCategoryAlts = allTools
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

  // 2. Check Paywall / SaaS Targets
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

  // 3. Unlisted candidate
  if (IGNORED_NOMINATION_HOSTS.test(cleanHost) || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHost)) {
    return null;
  }

  return {
    kind: 'unlisted',
    host: cleanHost,
    url: rawUrl,
    submitUrl: `https://nologin.tools${prefix}/submit?url=${encodeURIComponent(rawUrl)}`,
  };
}

async function checkActiveTabContext() {
  verifiedBanner?.classList.add('hidden');
  altBanner?.classList.add('hidden');
  nominateBanner?.classList.add('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const match = matchSiteUrl(tab.url);
    if (!match) return;

    if (match.kind === 'verified') {
      const t = match.tool;
      verifiedBanner.classList.remove('hidden');

      document.getElementById('verified-badge-label').textContent = l(
        '✓ NoLogin 实机验证',
        '✓ NoLogin Verified'
      );
      const tierPill = document.getElementById('verified-tier-pill');
      if (t.cades?.tierLabel) {
        tierPill.textContent = t.cades.tierLabel;
        tierPill.classList.remove('hidden');
      } else {
        tierPill.classList.add('hidden');
      }

      const scorePill = document.getElementById('verified-score-pill');
      scorePill.textContent = t.cades?.score ? `${t.cades.score}/100` : 'Verified';

      document.getElementById('verified-tool-title').textContent = `${t.name} (${t.hostname})`;

      // 5D dimensions visual progress grid
      const dimBar = document.getElementById('verified-5d-bar');
      const dims = t.cades?.dimensions;
      if (dims) {
        const items = [
          { label: l('丝滑度', 'UX'), val: dims.frictionless, max: 20 },
          { label: l('功能深度', 'Depth'), val: dims.depth, max: 25 },
          { label: l('导出自由', 'Export'), val: dims.exportFreedom, max: 20 },
          { label: l('隐私主权', 'Privacy'), val: dims.privacy, max: 20 },
          { label: l('稳定度', 'Polish'), val: dims.polish, max: 15 },
        ];
        dimBar.innerHTML = items
          .map((d) => {
            const pct = Math.min(100, Math.round(((d.val || 0) / d.max) * 100));
            return `
              <div class="dim-item">
                <div class="dim-head">
                  <span class="dim-label">${d.label}</span>
                  <span class="dim-val">${d.val}/${d.max}</span>
                </div>
                <div class="dim-track">
                  <div class="dim-fill" style="width:${pct}%"></div>
                </div>
              </div>
            `;
          })
          .join('');
        dimBar.classList.remove('hidden');
      } else {
        dimBar.classList.add('hidden');
      }

      // Capability pills
      const capBox = document.getElementById('verified-cap-pills');
      const caps = [];
      if (t.capabilities?.clientSideOnly) {
        caps.push(`<span class="cap-pill">${l('100% 本地零上传', '100% Client-Side')}</span>`);
      }
      if (t.capabilities?.worksOffline) {
        caps.push(`<span class="cap-pill">${l('支持离线', 'Works Offline')}</span>`);
      }
      if (t.capabilities?.openSource) {
        caps.push(`<span class="cap-pill">${l('开源代码', 'Open Source')}</span>`);
      }
      if (t.capabilities?.free) {
        caps.push(`<span class="cap-pill">${l('免费无套路', 'Free')}</span>`);
      }
      capBox.innerHTML = caps.join('');

      document.getElementById('verified-verdict').textContent =
        t.cades?.bestFor || t.coreTask || t.description || '';

      // Actions
      const actionsBox = document.getElementById('verified-actions');
      const prefix = currentLang === 'zh' ? '/zh' : '';
      const detailUrl = t.detailUrl || `https://nologin.tools${prefix}/tool/${t.slug}`;
      let actionsHtml = `<a href="${detailUrl}" target="_blank" rel="noopener" class="btn-action-primary">${l('查看实验室评测档案 ↗', 'Lab Report & Details ↗')}</a>`;
      if (match.comparisons?.length > 0) {
        const cmp = match.comparisons[0];
        actionsHtml += `<a href="${cmp.url}" target="_blank" rel="noopener" class="btn-action-secondary">vs ${escapeHtml(cmp.vsName)} ↗</a>`;
      }
      actionsBox.innerHTML = actionsHtml;

      // Same-category high-score peers
      const peersBox = document.getElementById('verified-peers');
      if (match.sameCategoryAlts?.length > 0) {
        peersBox.classList.remove('hidden');
        peersBox.innerHTML = `
          <div>${l('同分类高分免登录工具：', 'Top verified peers in this category:')}</div>
          <div class="peers-row">
            ${match.sameCategoryAlts
              .map(
                (p) =>
                  `<a href="${p.url}" target="_blank" rel="noopener" class="peer-link" data-url="${p.url}"><span>${escapeHtml(p.name)}</span>${p.cades?.score ? `<span class="peer-score">${p.cades.score}</span>` : ''}<span>↗</span></a>`
              )
              .join('')}
          </div>
        `;
        peersBox.querySelectorAll('.peer-link').forEach((link) => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            recordLaunch();
            chrome.tabs.create({ url: link.dataset.url });
          });
        });
      } else {
        peersBox.classList.add('hidden');
      }
    } else if (match.kind === 'paywall') {
      const target = match.target;
      altBanner.classList.remove('hidden');
      document.getElementById('banner-title').textContent = l(
        `正在访问 ${target.targetName}？免登录平替方案`,
        `Visiting ${target.targetName}? No-Login Switch`
      );
      document.getElementById('banner-desc').textContent = l(
        `${target.headline}。一键切换至已实机验证的免登录隐私替代品：`,
        `${target.headline}. Switch to a verified, no-signup alternative:`
      );

      const prefix = currentLang === 'zh' ? '/zh' : '';
      const bannerTools = document.getElementById('banner-tools');
      bannerTools.innerHTML = match.alternatives
        .map((t) => {
          const favUrl = `https://www.google.com/s2/favicons?domain=${t.hostname}&sz=32`;
          const scoreBadge = t.cades?.score
            ? `<span class="alt-score">${t.cades.score}</span>`
            : '';
          const tagLabel = t.capabilities?.clientSideOnly
            ? l('本地', 'Local')
            : l('免登录', 'Free');
          const detailUrl = t.detailUrl || `https://nologin.tools${prefix}/tool/${t.slug}`;
          return `
            <div class="alt-card">
              <div class="alt-card-info">
                <img src="${favUrl}" alt="" class="alt-favicon" onerror="this.style.display='none'" />
                <span class="alt-name">${escapeHtml(t.name)}</span>
                ${scoreBadge}
                <span class="alt-tag">${tagLabel}</span>
              </div>
              <div class="alt-actions">
                <a href="${detailUrl}" target="_blank" rel="noopener" class="alt-report-link">${l('档案', 'Report')}</a>
                <button type="button" class="alt-btn" data-url="${t.url}">${l('免登录启动 ↗', 'Launch ↗')}</button>
              </div>
            </div>
          `;
        })
        .join('');

      bannerTools.querySelectorAll('.alt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          recordLaunch();
          chrome.tabs.create({ url: btn.dataset.url });
        });
      });

      const bannerFooter = document.getElementById('banner-footer');
      if (target.alternativePageUrl) {
        bannerFooter.classList.remove('hidden');
        bannerFooter.innerHTML = `
          <a href="${target.alternativePageUrl}" target="_blank" rel="noopener">
            ${l(`查看 ${target.targetName} 完整免登录替代对比矩阵 →`, `Full ${target.targetName} No-Login Comparison Matrix →`)}
          </a>
        `;
      } else {
        bannerFooter.classList.add('hidden');
      }
    } else if (match.kind === 'unlisted') {
      nominateBanner.classList.remove('hidden');
      document.getElementById('nominate-host').textContent = match.host;
      document.getElementById('nominate-sub').textContent = l(
        '暂未收录 · 若该站支持免登录，欢迎一键提名实测',
        'Not indexed yet · Nominate for NoLogin Lab vetting'
      );
      const nomBtn = document.getElementById('nominate-btn');
      nomBtn.href = match.submitUrl;
      nomBtn.textContent = l('+ 一键提名 ↗', '+ Nominate ↗');
    }
  } catch (err) {
    console.warn('Could not inspect active tab:', err);
  }
}

function renderTools() {
  const q = currentQuery.trim().toLowerCase();
  const cat = currentCategory.toLowerCase();
  const preset = currentPreset.toLowerCase();

  const filtered = allTools.filter((tool) => {
    if (preset === 'local' && !tool.capabilities?.clientSideOnly) return false;
    if (preset === 'editors' && tool.cades?.tier !== 'editors-choice' && (tool.cades?.score || 0) < 90) {
      return false;
    }
    if (preset === 'opensource' && !tool.capabilities?.openSource) return false;

    if (cat !== 'all') {
      const toolCat = String(tool.category || '').toLowerCase();
      if (cat === 'pdf & office' && toolCat === 'productivity') {
        // match
      } else if (toolCat !== cat) {
        return false;
      }
    }

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

  resultsCount.textContent = l(
    `共 ${filtered.length} 款已验证免登录工具`,
    `${filtered.length} verified tool${filtered.length === 1 ? '' : 's'}`
  );

  const prefix = currentLang === 'zh' ? '/zh' : '';

  if (filtered.length === 0) {
    const submitUrl = `https://nologin.tools${prefix}/submit`;
    resultsList.innerHTML = `
      <div style="padding: 20px 12px; text-align: center; color: #737373;">
        <p style="font-weight: bold; margin-bottom: 4px;">${l('未找到匹配的工具', 'No tools found')}</p>
        <p style="font-size: 10px; margin-bottom: 10px;">${l('尝试更换关键词或筛选条件', 'Try a different keyword or preset.')}</p>
        <a href="${submitUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:4px 10px;background:#171717;color:#fff;text-decoration:none;font-weight:800;font-size:10px;">
          ${l('+ 提名新工具申请实测 ↗', '+ Submit a Tool for Vetting ↗')}
        </a>
      </div>
    `;
    return;
  }

  const paged = filtered.slice(0, 35);
  focusedIndex = -1;
  resultsList.innerHTML = paged
    .map((t, index) => {
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${t.hostname}&sz=32`;
      const score = t.cades?.score;
      const tierClass =
        score >= 90 ? 'tier-editors' : score >= 80 ? 'tier-high' : 'tier-default';
      const scoreHtml =
        typeof score === 'number'
          ? `<span class="badge-score ${tierClass}" title="CADES 2.0 Score">${score}</span>`
          : '';
      const catLabel = escapeHtml(t.categoryLabel || t.category);
      const localHtml = t.capabilities?.clientSideOnly
        ? `<span class="badge-clientside">${l('本地', 'Local')}</span>`
        : '';
      const detailUrl = t.detailUrl || `https://nologin.tools${prefix}/tool/${t.slug}`;

      return `
        <div class="tool-row" data-url="${t.url}" data-detail-url="${detailUrl}" data-index="${index}">
          <div class="tool-main">
            <img src="${faviconUrl}" alt="" class="tool-favicon" onerror="this.style.display='none'" />
            <div class="tool-details">
              <div class="tool-title-line">
                <span class="tool-name">${escapeHtml(t.name)}</span>
                ${scoreHtml}
                <span class="badge-category">${catLabel}</span>
                ${localHtml}
              </div>
              <div class="tool-desc">${escapeHtml(t.coreTask || t.cades?.bestFor || t.description)}</div>
            </div>
          </div>
          <div class="tool-row-actions">
            <a href="${detailUrl}" target="_blank" rel="noopener" class="tool-report-btn" title="${l('查看实测报告', 'View Lab Report')}">${l('档案', 'Info')}</a>
            <span class="tool-open-btn">${l('打开 ↗', 'Open ↗')}</span>
          </div>
        </div>
      `;
    })
    .join('');

  resultsList.querySelectorAll('.tool-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      const reportBtn = e.target.closest('.tool-report-btn');
      if (reportBtn) {
        return; // Allow normal link click to open Lab Report
      }
      e.preventDefault();
      recordLaunch();
      chrome.tabs.create({ url: row.dataset.url });
    });
  });
}

function recordLaunch() {
  const count = parseInt(localStorage.getItem('nologin_launch_count') || '0', 10) + 1;
  localStorage.setItem('nologin_launch_count', count.toString());
  checkReviewPrompt();
}

const CHROME_REVIEWS_URL =
  'https://chromewebstore.google.com/detail/hblmlbgnglelpkogmadngkjepiapnnon/reviews';

function checkReviewPrompt() {
  const banner = document.getElementById('review-banner');
  if (!banner) return;
  const count = parseInt(localStorage.getItem('nologin_launch_count') || '0', 10);
  const dismissed = localStorage.getItem('nologin_review_dismissed') === 'true';
  if (count >= 3 && !dismissed) {
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function initReviewPrompt() {
  const reviewBtn = document.getElementById('review-btn');
  const dismissBtn = document.getElementById('review-dismiss');

  reviewBtn?.addEventListener('click', () => {
    localStorage.setItem('nologin_review_dismissed', 'true');
    checkReviewPrompt();
    chrome.tabs.create({ url: CHROME_REVIEWS_URL });
  });

  dismissBtn?.addEventListener('click', () => {
    localStorage.setItem('nologin_review_dismissed', 'true');
    checkReviewPrompt();
  });

  checkReviewPrompt();
}

function updateFocus() {
  const rows = resultsList.querySelectorAll('.tool-row');
  rows.forEach((r, idx) => {
    if (idx === focusedIndex) {
      r.classList.add('focused');
      r.scrollIntoView({ block: 'nearest' });
    } else {
      r.classList.remove('focused');
    }
  });
}

document.addEventListener('keydown', (e) => {
  const rows = resultsList.querySelectorAll('.tool-row');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (rows.length === 0) return;
    focusedIndex = Math.min(focusedIndex + 1, rows.length - 1);
    updateFocus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (rows.length === 0) return;
    focusedIndex = Math.max(focusedIndex - 1, -1);
    if (focusedIndex === -1) {
      searchInput.focus();
    }
    updateFocus();
  } else if (e.key === 'Enter') {
    if (focusedIndex >= 0 && rows[focusedIndex]) {
      e.preventDefault();
      recordLaunch();
      const targetUrl = e.shiftKey
        ? rows[focusedIndex].dataset.detailUrl
        : rows[focusedIndex].dataset.url;
      chrome.tabs.create({ url: targetUrl });
    } else if (rows.length > 0 && document.activeElement === searchInput) {
      e.preventDefault();
      recordLaunch();
      chrome.tabs.create({ url: rows[0].dataset.url });
    }
  } else if (e.key === 'Escape') {
    if (currentQuery) {
      searchInput.value = '';
      currentQuery = '';
      renderTools();
    } else {
      window.close();
    }
  }
});

// Event Listeners
searchInput?.addEventListener('input', (e) => {
  currentQuery = e.target.value;
  renderTools();
});

presetChips?.addEventListener('click', (e) => {
  const chip = e.target.closest('.preset-chip');
  if (!chip) return;
  presetChips.querySelectorAll('.preset-chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  currentPreset = chip.dataset.preset || 'all';
  renderTools();
});

categoryPills?.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  categoryPills.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
  pill.classList.add('active');
  currentCategory = pill.dataset.cat || 'all';
  renderTools();
});

langToggleBtn?.addEventListener('click', async () => {
  const nextLang = currentLang === 'zh' ? 'en' : 'zh';
  await saveLanguagePref(nextLang);
  await loadData();
  updateStaticLabels();
  await checkActiveTabContext();
  renderTools();
});

// Initialize
async function init() {
  await initLanguagePref();
  await loadData();
  updateStaticLabels();
  await checkActiveTabContext();
  initReviewPrompt();
  renderTools();
  searchInput?.focus();
}

init();
