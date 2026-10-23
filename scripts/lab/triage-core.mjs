// @ts-check
/**
 * Pure HTML analysis + tiering for pending-submission triage (no browser, no I/O).
 *
 * Tiers:
 *   C → likely non-compliant; agent confirms evidence (and a screenshot when unsure), then rejects via API
 *   B → undetermined (JS-rendered shells, mixed signals); queued for deep evaluation after A
 *   A → visible interactive surface and no blocking signals; queued for deep evaluation first
 *
 * Triage never approves anything. Approval always requires a full tool-evaluation session.
 */

/** @param {string} html */
function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} html @param {RegExp} re */
function count(html, re) {
  return (html.match(re) || []).length;
}

/** @param {string} html @param {string} tag */
function innerTexts(html, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  /** @type {string[]} */
  const out = [];
  let m;
  while ((m = re.exec(html)) && out.length < 20) {
    const t = stripTags(m[1]).slice(0, 160);
    if (t) out.push(t);
  }
  return out;
}

/**
 * @param {string} html
 */
export function analyzeHtml(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const metaDescription =
    (html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1] ||
      '').slice(0, 300);
  const text = stripTags(html);
  const inputs = html.match(/<input\b[^>]*>/gi) || [];
  const typeOf = (/** @type {string} */ tag) => (tag.match(/type=["']?([a-z-]+)/i)?.[1] || 'text').toLowerCase();
  const inputTypes = inputs.map(typeOf);
  const meaningfulInputs = inputTypes.filter((t) => !['hidden', 'submit', 'button', 'search', 'email', 'checkbox', 'radio', 'image', 'reset'].includes(t));

  return {
    title,
    metaDescription,
    headings: [...innerTexts(html, 'h1'), ...innerTexts(html, 'h2')].slice(0, 12),
    buttons: innerTexts(html, 'button').slice(0, 20),
    textLength: text.length,
    wordCount: text ? text.split(' ').length : 0,
    htmlLength: html.length,
    scriptCount: count(html, /<script\b/gi),
    linkCount: count(html, /<a\b[^>]*href=/gi),
    textareaCount: count(html, /<textarea\b/gi),
    selectCount: count(html, /<select\b/gi),
    canvasCount: count(html, /<canvas\b/gi),
    fileInputCount: inputTypes.filter((t) => t === 'file').length,
    passwordInputCount: inputTypes.filter((t) => t === 'password').length,
    meaningfulInputCount: meaningfulInputs.length,
    contentEditableCount: count(html, /contenteditable=["']?(true|plaintext-only|)["'\s>]/gi),
    hasArticleTag: /<article\b/i.test(html),
    hasSpaRoot: /<div[^>]+id=["'](root|app|__next|__nuxt|svelte)["'][^>]*>\s*<\/div>/i.test(html) || /id=["']__next["']/.test(html),
    text: text.slice(0, 6000),
  };
}

const RE = {
  parked: /\b(this domain (?:is|may be) for sale|buy this domain|domain (?:is )?parked|parked free|hugedomains|sedo\.com|dan\.com\/buy)\b/i,
  loginTitle: /^(?:sign in|log ?in|login|sign up|create (?:an )?account|register)\b/i,
  loginRequired: /\b((?:sign|log) ?in (?:to|required to) (?:continue|use|start|access)|login required|please (?:sign|log) ?in|create (?:a |an )?(?:free )?account to (?:continue|use|start|get started))\b/i,
  entertainment: /\b(tarot|horoscope|astrology|zodiac|natal chart|numerology|fortune ?telling|personality test|love (?:test|calculator)|unblocked games?|play (?:now|online|free)|brain ?rot|meme generator|crush test|iq test)\b/i,
  game: /\b(game|games|puzzle|arcade|wordle|sudoku|solitaire|crossword)\b/i,
  directory: /\b((?:best|top) \d* ?ai tools|ai tools? directory|submit your (?:tool|ai|startup)|tools? directory|list of (?:free )?tools|discover \d+\+? (?:ai )?tools)\b/i,
  article: /\b(\d+\s*min(?:ute)?s? read|table of contents|posted (?:on|by)|written by|published (?:on|by)|leave a (?:comment|reply)|related (?:posts|articles))\b/i,
  paywall: /\b(free trial|start (?:your |a )?(?:\d+[- ]day )?(?:free )?trial|\d+[- ]day (?:free )?trial|upgrade to (?:pro|premium)|buy credits|credits? (?:left|remaining)|per month|\/mo\b|pricing plans?)\b/i,
};

/**
 * @typedef {{ code: string, detail: string }} TriageSignal
 * @typedef {{ status: number | null, finalUrl: string | null, error: string | null, html: string | null }} FetchOutcome
 */

/** @param {string | null | undefined} url */
function hostOf(url) {
  try {
    return url ? new URL(url).hostname.toLowerCase().replace(/^www\./, '') : null;
  } catch {
    return null;
  }
}

/**
 * @param {{ url: string }} tool
 * @param {FetchOutcome} fetched
 * @returns {{ tier: 'A' | 'B' | 'C', signals: TriageSignal[], suggestedReason: string | null, page: ReturnType<typeof analyzeHtml> | null }}
 */
export function triageSubmission(tool, fetched) {
  /** @type {TriageSignal[]} */
  const blocking = [];
  /** @type {TriageSignal[]} */
  const soft = [];

  if (fetched.error || fetched.status === null) {
    blocking.push({ code: 'unreachable', detail: fetched.error || 'no response' });
    return { tier: 'C', signals: blocking, suggestedReason: `站点无法访问/已失效 (${fetched.error || 'no response'})`, page: null };
  }
  if (fetched.status === 404 || fetched.status === 410) {
    blocking.push({ code: 'gone', detail: `HTTP ${fetched.status}` });
    return { tier: 'C', signals: blocking, suggestedReason: `站点无法访问/已失效 (HTTP ${fetched.status})`, page: null };
  }
  if (fetched.status >= 500) soft.push({ code: 'server_error', detail: `HTTP ${fetched.status}` });
  if (fetched.status === 401 || fetched.status === 403) soft.push({ code: 'blocked_or_auth', detail: `HTTP ${fetched.status}` });

  const page = analyzeHtml(fetched.html || '');
  const fromHost = hostOf(tool.url);
  const toHost = hostOf(fetched.finalUrl);
  const visible = [page.title, page.metaDescription, ...page.headings, ...page.buttons].join(' \n ');
  const body = `${visible}\n${page.text}`;
  const interactive =
    page.textareaCount + page.canvasCount + page.fileInputCount + page.contentEditableCount > 0 ||
    page.meaningfulInputCount + page.selectCount >= 2;

  if (fromHost && toHost && fromHost !== toHost) {
    blocking.push({ code: 'cross_host_redirect', detail: `${fromHost} → ${toHost}` });
  }
  if (RE.parked.test(body)) blocking.push({ code: 'parked_domain', detail: body.match(RE.parked)?.[0] || '' });

  const loginTitle = RE.loginTitle.test(page.title) || page.headings.some((h) => RE.loginTitle.test(h));
  const loginCopy = body.match(RE.loginRequired)?.[0];
  if ((page.passwordInputCount > 0 && !interactive) || (loginTitle && page.passwordInputCount > 0) || loginCopy) {
    blocking.push({ code: 'login_wall', detail: loginCopy || (loginTitle ? `title/heading: ${page.title}` : 'password field without other tool inputs') });
  }

  const entertainment = visible.match(RE.entertainment)?.[0];
  if (entertainment) blocking.push({ code: 'entertainment', detail: entertainment });
  else if (RE.game.test(page.title)) soft.push({ code: 'game_like_title', detail: page.title });

  const directory = body.match(RE.directory)?.[0];
  if (directory && page.linkCount > 80) blocking.push({ code: 'directory', detail: `${directory} (${page.linkCount} links)` });

  const articleCopy = body.match(RE.article)?.[0];
  let blogPath = false;
  try {
    blogPath = /\/(blog|blogs|posts?|articles?|news|guides?|learn)\//i.test(new URL(fetched.finalUrl || tool.url).pathname + '/');
  } catch {}
  // Calculators often ship long SEO copy inside <article> with JS-rendered inputs, so an
  // <article> tag alone is only a soft signal. Blocking requires article copy or a blog path.
  if (!interactive && page.wordCount > 600 && (articleCopy || blogPath)) {
    blocking.push({ code: 'static_article', detail: articleCopy || `blog-style path with ${page.wordCount} words and no tool inputs` });
  } else if (!interactive && page.hasArticleTag && page.wordCount > 600) {
    soft.push({ code: 'long_text_no_static_inputs', detail: `<article> with ${page.wordCount} words` });
  }

  const paywall = visible.match(RE.paywall)?.[0];
  if (paywall) soft.push({ code: 'paywall_copy', detail: paywall });

  const jsShell = page.textLength < 400 && page.scriptCount > 0;
  if (jsShell) soft.push({ code: 'js_rendered_shell', detail: `${page.textLength} chars of server HTML text` });
  if (!interactive && !jsShell) soft.push({ code: 'no_static_inputs', detail: 'No textarea, file input, canvas, or form controls in server HTML' });

  const signals = [...blocking, ...soft];
  if (blocking.length > 0) {
    return { tier: 'C', signals, suggestedReason: reasonFor(blocking[0]), page };
  }
  if (interactive && !soft.some((s) => ['paywall_copy', 'server_error', 'blocked_or_auth', 'game_like_title'].includes(s.code))) {
    return { tier: 'A', signals, suggestedReason: null, page };
  }
  return { tier: 'B', signals, suggestedReason: null, page };
}

/** @param {TriageSignal} s */
function reasonFor(s) {
  switch (s.code) {
    case 'cross_host_redirect':
      return `提交 URL 跳转至其他站点 (${s.detail})`;
    case 'parked_domain':
      return `域名停放/出售页面，无在线工具 (${s.detail})`;
    case 'login_wall':
      return `核心功能需要登录/注册 (${s.detail})`;
    case 'entertainment':
      return `娱乐/占卜/游戏类站点，不符合实用工具收录定位 (${s.detail})`;
    case 'directory':
      return `网址导航/工具目录聚合站，非独立工具 (${s.detail})`;
    case 'static_article':
      return `静态文章/指南页面，非在线交互工具 (${s.detail})`;
    default:
      return `${s.code}: ${s.detail}`;
  }
}
