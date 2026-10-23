// @ts-check
/**
 * Submission hard gates shared by:
 *   - POST /api/submit and /api/resubmit (intake)
 *   - scripts/batch-reject-pending.mjs and scripts/triage-pending.mjs (backlog)
 *
 * Pure functions only (no I/O) so they can run in Workers, Node scripts, and tests.
 */

/** Query parameters that only carry campaign / referral tracking. */
const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^(fbclid|gclid|gclsrc|dclid|msclkid|yclid|twclid|ttclid|igshid|mc_cid|mc_eid|_ga|_gl|ref_src|ref_url)$/i,
  /^(ref|via)$/i,
];

/**
 * Hosts used for throwaway tunnels, file drops, or temporary previews.
 * Matched against the hostname itself or any parent domain.
 */
export const EPHEMERAL_HOST_SUFFIXES = [
  'trycloudflare.com',
  'ngrok.io',
  'ngrok.app',
  'ngrok-free.app',
  'ngrok-free.dev',
  'loca.lt',
  'localtunnel.me',
  'serveo.net',
  'localhost.run',
  'lhr.life',
  'pinggy.link',
  'telebit.io',
  'chatgpt.site',
  'catbox.moe',
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'we.tl',
  'wetransfer.com',
  'stackblitz.io',
  'csb.app',
  'repl.co',
];

/** Source-code hosts: a repository page is not a deployed tool. */
export const REPO_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org', 'codeberg.org', 'gitee.com', 'sourceforge.net'];

/** App/extension storefronts: the listing is a download page, not a web tool. */
const STORE_RULES = [
  { host: 'chromewebstore.google.com' },
  { host: 'chrome.google.com', pathPrefix: '/webstore' },
  { host: 'addons.mozilla.org' },
  { host: 'microsoftedge.microsoft.com', pathPrefix: '/addons' },
  { host: 'apps.apple.com' },
  { host: 'play.google.com' },
  { host: 'apps.microsoft.com' },
  { host: 'gumroad.com' },
  { host: 'lemonsqueezy.com' },
  { host: 'itch.io' },
];

/** Shared static hosts where each first path segment is an independent project. */
const PATH_SCOPED_HOST_SUFFIXES = ['github.io', 'gitlab.io', 'codeberg.page', 'sourceforge.io'];

/** Submitter email domains / addresses with confirmed automated bulk submissions. */
export const BLOCKED_EMAIL_DOMAINS = ['agent.qq.com', 'foundagent.net'];
export const BLOCKED_EMAILS = [
  'leeswal123@gmail.com',
  'dyjae93@gmail.com',
  'samir.asadov.28@gmail.com',
];

/**
 * @param {string} host
 * @param {string} suffix
 */
function hostMatches(host, suffix) {
  return host === suffix || host.endsWith(`.${suffix}`);
}

/** @param {string} host */
function isPrivateOrLocalHost(host) {
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return true;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true; // bare IPv4
  if (host.startsWith('[')) return true; // bare IPv6
  return false;
}

/**
 * Remove tracking-only query params and the fragment. Returns the cleaned URL
 * and the list of removed keys.
 * @param {string} rawUrl
 * @returns {{ url: string, removed: string[] }}
 */
export function normalizeSubmissionUrl(rawUrl) {
  const parsed = new URL(rawUrl.trim());
  /** @type {string[]} */
  const removed = [];
  for (const key of [...parsed.searchParams.keys()]) {
    if (TRACKING_PARAM_PATTERNS.some((re) => re.test(key))) {
      parsed.searchParams.delete(key);
      if (!removed.includes(key)) removed.push(key);
    }
  }
  parsed.hash = '';
  parsed.hostname = parsed.hostname.toLowerCase();
  let url = parsed.toString();
  // Drop a dangling "?" left after removing all params.
  url = url.replace(/\?$/, '');
  return { url, removed };
}

/**
 * Identity key used for "one entry per site" de-duplication.
 * - Strips `www.`
 * - Path-scoped static hosts (user.github.io/project) include the first path segment.
 * @param {string} rawUrl
 * @returns {string | null}
 */
export function siteKey(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (PATH_SCOPED_HOST_SUFFIXES.some((s) => hostMatches(host, s))) {
      const first = parsed.pathname.split('/').filter(Boolean)[0];
      return first ? `${host}/${first.toLowerCase()}` : host;
    }
    return host;
  } catch {
    return null;
  }
}

/**
 * SQL LIKE patterns that match any stored URL sharing the given site key.
 * Use with `url LIKE ? OR url LIKE ? ...`.
 * @param {string} key result of siteKey()
 * @returns {string[]}
 */
export function siteKeyLikePatterns(key) {
  const variants = [key, `www.${key}`];
  /** @type {string[]} */
  const patterns = [];
  for (const v of variants) {
    patterns.push(`%://${v}`, `%://${v}/%`, `%://${v}?%`, `%://${v}#%`);
  }
  return patterns;
}

/**
 * @typedef {{ code: string, reason: string, userMessage: string }} GateViolation
 */

/**
 * Evaluate URL + submitter hard gates. Returns the first violation or null.
 * Reasons are stored as rejection reasons; userMessage is shown to submitters.
 * @param {{ url: string, submitterEmail?: string | null }} input
 * @returns {GateViolation | null}
 */
export function checkHardGates({ url, submitterEmail }) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { code: 'invalid_url', reason: 'Invalid URL', userMessage: 'Please enter a valid URL.' };
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const path = parsed.pathname.toLowerCase();

  if (isPrivateOrLocalHost(host)) {
    return {
      code: 'private_host',
      reason: 'Local, private, or bare-IP address (not a public deployment)',
      userMessage: 'Please submit a publicly deployed URL, not a local or bare-IP address.',
    };
  }

  if (EPHEMERAL_HOST_SUFFIXES.some((s) => hostMatches(host, s))) {
    return {
      code: 'ephemeral_host',
      reason: `Temporary tunnel, file drop, or preview host (${host})`,
      userMessage: 'Temporary tunnels, file-sharing links, and preview hosts are not accepted. Please submit the stable production URL.',
    };
  }

  if (REPO_HOSTS.some((s) => hostMatches(host, s))) {
    return {
      code: 'repository_url',
      reason: `Source repository URL instead of a deployed web tool (${host})`,
      userMessage: 'Please submit the live tool URL. Repository links can be added later as the source code link.',
    };
  }

  const store = STORE_RULES.find((r) => hostMatches(host, r.host) && (!r.pathPrefix || path.startsWith(r.pathPrefix)));
  if (store) {
    return {
      code: 'store_listing',
      reason: `App store, extension store, or storefront listing (${host})`,
      userMessage: 'Store listings and download pages are not accepted. Please submit a web tool that works in the browser without login.',
    };
  }

  const email = (submitterEmail || '').trim().toLowerCase();
  if (email) {
    const domain = email.split('@')[1] || '';
    if (BLOCKED_EMAILS.includes(email) || BLOCKED_EMAIL_DOMAINS.some((d) => hostMatches(domain, d))) {
      return {
        code: 'blocked_submitter',
        reason: `Automated or bulk submitter (${email})`,
        userMessage: 'Submissions from this address are not accepted.',
      };
    }
  }

  return null;
}
