// @ts-check

export const BADGE_GROUPS = [
  { id: 'standard', label: 'Standard' },
  { id: 'social', label: 'Social' },
  { id: 'dark', label: 'Dark' },
  { id: 'color', label: 'Color' },
];

export const BADGE_STYLES = [
  // Standard
  { id: 'flat', label: 'Flat', path: '/badges/flat.svg', width: 118, height: 20, group: 'standard' },
  { id: 'flat-square', label: 'Flat Square', path: '/badges/flat-square.svg', width: 118, height: 20, group: 'standard' },
  { id: 'plastic', label: 'Plastic', path: '/badges/plastic.svg', width: 116, height: 18, group: 'standard' },
  { id: 'for-the-badge', label: 'For The Badge', path: '/badges/for-the-badge.svg', width: 191, height: 28, group: 'standard' },
  // Social
  { id: 'social', label: 'Social', path: '/badges/social.svg', width: 142, height: 20, group: 'social' },
  // Dark
  { id: 'flat-dark', label: 'Flat', path: '/badges/flat-dark.svg', width: 118, height: 20, group: 'dark' },
  { id: 'flat-square-dark', label: 'Flat Square', path: '/badges/flat-square-dark.svg', width: 118, height: 20, group: 'dark' },
  { id: 'plastic-dark', label: 'Plastic', path: '/badges/plastic-dark.svg', width: 116, height: 18, group: 'dark' },
  { id: 'for-the-badge-dark', label: 'For The Badge', path: '/badges/for-the-badge-dark.svg', width: 191, height: 28, group: 'dark' },
  // Color
  { id: 'flat-blue', label: 'Blue', path: '/badges/flat-blue.svg', width: 118, height: 20, group: 'color' },
  { id: 'flat-purple', label: 'Purple', path: '/badges/flat-purple.svg', width: 118, height: 20, group: 'color' },
  { id: 'flat-orange', label: 'Orange', path: '/badges/flat-orange.svg', width: 118, height: 20, group: 'color' },
];

export const ORIGINAL_BADGE = {
  id: 'original',
  label: 'Original',
  path: '/badge.svg',
  width: 160,
  height: 28,
};

export function getBadgeEmbedCode(slug, siteUrl, style = 'flat') {
  const badge = style === 'original'
    ? ORIGINAL_BADGE
    : BADGE_STYLES.find((s) => s.id === style) || BADGE_STYLES[0];

  return {
    svg: `<a href="${siteUrl}/badge/${slug}">\n  <img src="${siteUrl}${badge.path}" alt="NoLogin Verified" title="Verified by NoLoginTools.org" />\n</a>`,
    markdown: `[![NoLogin Verified](${siteUrl}${badge.path})](${siteUrl}/badge/${slug} "Verified by NoLoginTools.org")`,
    meta: `<meta name="nologin-verified" content="${slug}" />`,
    link: `<a href="${siteUrl}/badge/${slug}">NoLogin Verified</a>`,
  };
}

export function getBadgeWeight(displayType) {
  switch (displayType) {
    case 'explicit':
      return 4;
    case 'implicit':
      return 2;
    default:
      return 0;
  }
}

export function measureBadgeTextWidth(text) {
  let width = 0;
  for (const char of text) {
    if ('il.:;,!\''.includes(char)) width += 3.5;
    else if ('jfrtI-()[]'.includes(char)) width += 4.5;
    else if ('mwMW_@'.includes(char)) width += 9.5;
    else if (char === ' ') width += 3.5;
    else if (char >= 'A' && char <= 'Z') width += 7.5;
    else width += 6.5;
  }
  return Math.round(width);
}

/**
 * @typedef {Object} DynamicBadgeOptions
 * @property {'active' | 'verified' | 'pending' | 'not_found'} [status]
 * @property {'verified' | 'grade' | 'sandbox'} [badgeType]
 * @property {string} [grade]
 * @property {string} [sandboxStatus]
 * @property {string} [style]
 * @property {string} [leftText]
 * @property {string} [rightText]
 * @property {string} [leftColor]
 * @property {string} [rightColor]
 * @property {string} [title]
 */

/**
 * Generates an SVG string for dynamic status, privacy grade, or sandbox shields
 * @param {DynamicBadgeOptions} options
 * @returns {string}
 */
export function generateDynamicBadgeSvg(options) {
  const badgeType = options.badgeType || 'verified';
  const status = options.status || 'verified';
  const style = options.style || 'flat';

  let leftText = options.leftText || (badgeType === 'grade' ? 'privacy' : badgeType === 'sandbox' ? 'sandbox' : 'nologin');
  let title = options.title || 'Verified by NoLoginTools.org';
  let rightText = options.rightText;
  let rightColor = options.rightColor || '#4c1';
  let leftColor = options.leftColor || '#555';

  if (badgeType === 'grade') {
    const grade = options.grade || 'A';
    rightText = rightText || grade;
    if (!options.rightColor) {
      if (grade === 'A+') rightColor = '#059669';
      else if (grade === 'A') rightColor = '#16a34a';
      else if (grade === 'B+') rightColor = '#0284c7';
      else if (grade === 'B') rightColor = '#d97706';
      else rightColor = '#4c1';
    }
    title = options.title || `Privacy Grade: ${rightText} — Verified by NoLoginTools.org`;
  } else if (badgeType === 'sandbox') {
    rightText = rightText || options.sandboxStatus || 'in-browser';
    if (!options.rightColor) {
      const lower = rightText.toLowerCase();
      if (lower.includes('100%') || lower.includes('ram') || lower.includes('in-browser') || lower.includes('client')) {
        rightColor = '#059669';
      } else if (lower.includes('local')) {
        rightColor = '#16a34a';
      } else {
        rightColor = '#0284c7';
      }
    }
    title = options.title || `Sandbox: ${rightText} — Verified by NoLoginTools.org`;
  } else if (!rightText) {
    switch (status) {
      case 'active':
        rightText = 'verified active';
        rightColor = options.rightColor || '#16a34a';
        leftColor = options.leftColor || '#1e293b';
        break;
      case 'verified':
        rightText = 'verified';
        rightColor = options.rightColor || '#4c1';
        break;
      case 'pending':
        rightText = 'pending';
        rightColor = options.rightColor || '#eab308';
        break;
      case 'not_found':
        rightText = 'not found';
        rightColor = options.rightColor || '#737373';
        break;
    }
  }

  const isSquare = style === 'flat-square' || style === 'flat-square-dark';
  const isDark = style === 'flat-dark' || style === 'flat-square-dark';
  if (isDark && leftColor === '#555') {
    leftColor = '#2d2d2d';
  }

  let leftWidth = 69;
  let leftTextLength = 430;
  let leftCenterX = 435;

  if (leftText !== 'nologin') {
    const leftTextWidth = measureBadgeTextWidth(leftText);
    leftWidth = Math.max(badgeType === 'grade' ? 56 : 60, 24 + leftTextWidth);
    leftTextLength = Math.round(leftTextWidth * 10);
    leftCenterX = Math.round((18 + leftTextWidth / 2) * 10);
  }

  let rightWidth = 49;
  let rightTextLength = 390;
  let rightCenterX = 935;

  if (rightText === 'verified' && leftWidth === 69) {
    rightWidth = 49;
    rightTextLength = 390;
    rightCenterX = 935;
  } else {
    const rightTextWidth = measureBadgeTextWidth(rightText || '');
    rightWidth = Math.max(36, rightTextWidth + 12);
    rightTextLength = Math.round(rightTextWidth * 10);
    rightCenterX = Math.round((leftWidth + rightWidth / 2) * 10);
  }

  const totalWidth = leftWidth + rightWidth;
  const rx = isSquare ? 0 : 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="${title}">
  <title>${title}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="${rx}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="${leftColor}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${rightColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g transform="translate(4, 4)">
    <path d="M6 0.5 L11 2.5 L11 6 C11 9 8.5 11 6 12 C3.5 11 1 9 1 6 L1 2.5 Z" fill="#fff" fill-opacity="0.9"/>
    <path d="M4 6 L5.5 7.8 L8.5 4" stroke="${leftColor}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${leftCenterX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${leftTextLength}">${leftText}</text>
    <text x="${leftCenterX}" y="140" transform="scale(.1)" fill="#fff" textLength="${leftTextLength}">${leftText}</text>
    <text aria-hidden="true" x="${rightCenterX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${rightTextLength}">${rightText}</text>
    <text x="${rightCenterX}" y="140" transform="scale(.1)" fill="#fff" textLength="${rightTextLength}">${rightText}</text>
  </g>
</svg>`;
}

export function getDynamicBadgeEmbedCode(slug, siteUrl, style = 'flat') {
  const badgeUrl = `${siteUrl}/api/badge/${slug}.svg`;
  return {
    svg: `<a href="${siteUrl}/badge/${slug}">\n  <img src="${badgeUrl}" alt="NoLogin Verified" title="Verified by NoLoginTools.org" />\n</a>`,
    markdown: `[![NoLogin Verified](${badgeUrl})](${siteUrl}/badge/${slug} "Verified by NoLoginTools.org")`,
  };
}

export function getPrivacyGradeEmbedCode(
  slug,
  siteUrl,
  grade = 'A+',
  style = 'flat'
) {
  const styleParam = style !== 'flat' ? `&style=${style}` : '';
  const badgeUrl = `${siteUrl}/api/badge/${slug}.svg?type=grade${styleParam}`;
  return {
    svg: `<a href="${siteUrl}/badge/${slug}">\n  <img src="${badgeUrl}" alt="Privacy Grade ${grade}" title="Verified by NoLoginTools.org" />\n</a>`,
    markdown: `[![Privacy Grade ${grade}](${badgeUrl})](${siteUrl}/badge/${slug} "Verified by NoLoginTools.org")`,
  };
}

export function getSandboxEmbedCode(
  slug,
  siteUrl,
  sandboxStatus = 'in-browser',
  style = 'flat'
) {
  const styleParam = style !== 'flat' ? `&style=${style}` : '';
  const badgeUrl = `${siteUrl}/api/badge/${slug}.svg?type=sandbox${styleParam}`;
  return {
    svg: `<a href="${siteUrl}/badge/${slug}">\n  <img src="${badgeUrl}" alt="Sandbox ${sandboxStatus}" title="Verified by NoLoginTools.org" />\n</a>`,
    markdown: `[![Sandbox ${sandboxStatus}](${badgeUrl})](${siteUrl}/badge/${slug} "Verified by NoLoginTools.org")`,
  };
}
