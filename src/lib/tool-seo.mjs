const EN_NO_LOGIN_PATTERN = /\b(?:no login|no account|without login|without signup|no signup|without registration|no registration)\b/i;
const GLOBAL_NO_LOGIN_PATTERN = /(?:no login|no account|without login|without signup|no signup|without registration|no registration|免登录|无需登录|无需注册|ログイン不要|会員登録不要|sin registro|sin iniciar sesión|sans inscription|sans connexion|ohne anmeldung|ohne registrierung|sem login|sem cadastro|로그인 없이|회원가입 없이)/i;
const TERMINAL_PUNCTUATION_PATTERN = /[.!?。！？]+$/u;
const CJK_LOCALES = new Set(['zh', 'ja', 'ko']);
const NO_LOGIN_SUFFIX_BY_LOCALE = {
  en: 'without login',
  zh: '无需登录',
  ja: 'ログイン不要',
  ko: '로그인 없이',
  es: 'sin registro',
  fr: 'sans inscription',
  de: 'ohne Anmeldung',
  pt: 'sem login',
};
const DEFAULT_TASK_PHRASE_BY_LOCALE = {
  en: 'use this tool without login',
  zh: '免登录使用这个工具',
  ja: 'ログイン不要でこのツールを使う',
  ko: '로그인 없이 이 도구 사용하기',
  es: 'usar esta herramienta sin registro',
  fr: 'utiliser cet outil sans inscription',
  de: 'dieses Tool ohne Anmeldung nutzen',
  pt: 'usar esta ferramenta sem login',
};

export const SEO_INTENTS = ['task', 'review', 'alternative'];

function cleanText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function cleanOptionalText(value) {
  const cleaned = cleanText(value);
  return cleaned || null;
}

function stripTerminalPunctuation(value) {
  return cleanText(value).replace(TERMINAL_PUNCTUATION_PATTERN, '');
}

function lowerFirst(value) {
  if (!value) return '';
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function upperFirst(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getSentenceTerminator(locale = 'en') {
  return CJK_LOCALES.has(locale) ? '。' : '.';
}

function truncateAtWord(value, maxLength) {
  if (value.length <= maxLength) return value;
  const sliced = value.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = (lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : value.slice(0, maxLength)).trim();
  return `${trimmed}...`;
}

function firstSentence(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return '';
  const match = cleaned.match(/^.+?[.!?。！？](?:\s|$)/u);
  return match ? cleanText(match[0]) : cleaned;
}

export function includesNoLoginIntent(value) {
  return GLOBAL_NO_LOGIN_PATTERN.test(cleanText(value));
}

export function normalizeSeoIntent(value) {
  return SEO_INTENTS.includes(value) ? value : 'task';
}

export function hasLocalizedToolContent(translation) {
  return Boolean(cleanOptionalText(translation?.description) && cleanOptionalText(translation?.coreTask));
}

export function getLocalizedToolFields(tool, translation, locale = 'en') {
  if (locale === 'en') {
    return {
      ...tool,
      description: cleanOptionalText(tool?.description),
      coreTask: cleanText(tool?.coreTask),
      seoTitle: cleanOptionalText(tool?.seoTitle),
      seoDescription: cleanOptionalText(tool?.seoDescription),
      seoFocusKeyword: cleanOptionalText(tool?.seoFocusKeyword),
      seoTaskPhrase: cleanOptionalText(tool?.seoTaskPhrase),
      hasLocalizedCopy: true,
    };
  }

  return {
    ...tool,
    description: cleanOptionalText(translation?.description) ?? cleanOptionalText(tool?.description),
    coreTask: cleanOptionalText(translation?.coreTask) ?? cleanText(tool?.coreTask),
    seoTitle: cleanOptionalText(translation?.seoTitle),
    seoDescription: cleanOptionalText(translation?.seoDescription),
    seoFocusKeyword: cleanOptionalText(translation?.seoFocusKeyword),
    seoTaskPhrase: cleanOptionalText(translation?.seoTaskPhrase),
    hasLocalizedCopy: hasLocalizedToolContent(translation),
  };
}

export function resolveToolCanonicalLocale(locale = 'en', availableLocales) {
  if (!availableLocales || availableLocales.has(locale)) return locale;
  return 'en';
}

export function buildLocalizedToolStaticPaths(
  tools,
  locales,
  defaultLocale = 'en',
  getAvailableLocales = () => new Set([defaultLocale])
) {
  return tools.flatMap((tool) => {
    const availableLocales = getAvailableLocales(tool);
    return locales
      .filter((locale) => locale !== defaultLocale && availableLocales.has(locale))
      .map((locale) => ({
        params: { lang: locale, slug: tool.slug },
        props: { tool, locale },
      }));
  });
}

function getNoLoginSuffix(locale = 'en') {
  return NO_LOGIN_SUFFIX_BY_LOCALE[locale] || NO_LOGIN_SUFFIX_BY_LOCALE.en;
}

function getDefaultTaskPhrase(locale = 'en') {
  return DEFAULT_TASK_PHRASE_BY_LOCALE[locale] || DEFAULT_TASK_PHRASE_BY_LOCALE.en;
}

export function buildSeoTaskPhrase(tool, locale = 'en') {
  const explicit = stripTerminalPunctuation(tool?.seoTaskPhrase);
  if (explicit) return explicit;

  const coreTask = stripTerminalPunctuation(tool?.coreTask);
  if (!coreTask) return getDefaultTaskPhrase(locale);
  if (includesNoLoginIntent(coreTask)) return lowerFirst(coreTask);

  const separator = CJK_LOCALES.has(locale) ? '' : ' ';
  return `${lowerFirst(coreTask)}${separator}${getNoLoginSuffix(locale)}`;
}

export function buildSeoTitle(tool, locale = 'en') {
  const explicit = cleanText(tool?.seoTitle);
  if (explicit) return truncateAtWord(explicit, 80);

  const name = cleanText(tool?.name) || 'Tool';
  const taskPhrase = upperFirst(buildSeoTaskPhrase(tool, locale));
  let title = `${name}: ${taskPhrase}`;
  if (locale === 'en' && !EN_NO_LOGIN_PATTERN.test(title) && title.length < 58) {
    title += ' | No Login Required';
  }
  return truncateAtWord(title, 80);
}

export function buildSeoDescription(tool, locale = 'en') {
  const explicit = cleanText(tool?.seoDescription);
  if (explicit) return truncateAtWord(explicit, 180);

  const name = cleanText(tool?.name) || 'This tool';
  const description = firstSentence(tool?.description);
  const taskPhrase = lowerFirst(buildSeoTaskPhrase(tool, locale));

  if (locale !== 'en') {
    if (!description) {
      return truncateAtWord(`${name}: ${upperFirst(taskPhrase)}${getSentenceTerminator(locale)}`, 180);
    }
    if (includesNoLoginIntent(description)) {
      return truncateAtWord(description, 180);
    }

    const separator = CJK_LOCALES.has(locale) ? '' : ' ';
    const localizedDescription = `${stripTerminalPunctuation(description)}${separator}${upperFirst(taskPhrase)}${getSentenceTerminator(locale)}`;
    return truncateAtWord(localizedDescription, 180);
  }

  const fragments = [`${name} helps you ${taskPhrase}.`];
  if (description) {
    fragments.push(description);
  } else {
    fragments.push('Use it directly in your browser with no account required.');
  }

  let combined = fragments.join(' ');
  if (!EN_NO_LOGIN_PATTERN.test(combined)) {
    combined += ' No account required.';
  }
  return truncateAtWord(combined, 180);
}

export function buildSeoFocusKeyword(tool, locale = 'en') {
  const explicit = cleanText(tool?.seoFocusKeyword);
  if (explicit) return truncateAtWord(explicit, 120);

  const name = cleanText(tool?.name);
  const taskPhrase = buildSeoTaskPhrase(tool, locale)
    .replace(GLOBAL_NO_LOGIN_PATTERN, '')
    .replace(/\b(?:without|signup|required|account|login|registration|no)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const combined = cleanText(`${name} ${taskPhrase}`) || name || 'no login tool';
  return truncateAtWord(combined, 120);
}

export function buildToolSeoMeta(tool, locale = 'en') {
  return {
    title: buildSeoTitle(tool, locale),
    description: buildSeoDescription(tool, locale),
    taskPhrase: buildSeoTaskPhrase(tool, locale),
    focusKeyword: buildSeoFocusKeyword(tool, locale),
    intent: normalizeSeoIntent(tool?.seoIntent),
  };
}

export function getToolCanonicalPath(slug, locale = 'en') {
  const cleanSlug = cleanText(slug);
  if (!cleanSlug) return '/tool';
  return locale && locale !== 'en'
    ? `/${locale}/tool/${cleanSlug}`
    : `/tool/${cleanSlug}`;
}
