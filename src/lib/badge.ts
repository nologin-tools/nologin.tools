export type BadgeStyle =
  | 'flat' | 'flat-square' | 'plastic' | 'for-the-badge'
  | 'social'
  | 'flat-dark' | 'flat-square-dark' | 'plastic-dark' | 'for-the-badge-dark'
  | 'flat-blue' | 'flat-purple' | 'flat-orange'
  | 'original';

export type BadgeGroup = 'standard' | 'social' | 'dark' | 'color';

export interface BadgeStyleInfo {
  id: BadgeStyle;
  label: string;
  path: string;
  width: number;
  height: number;
  group: BadgeGroup;
}

export const BADGE_GROUPS: { id: BadgeGroup; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'social', label: 'Social' },
  { id: 'dark', label: 'Dark' },
  { id: 'color', label: 'Color' },
];

export const BADGE_STYLES: BadgeStyleInfo[] = [
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

export const ORIGINAL_BADGE: Omit<BadgeStyleInfo, 'group'> = {
  id: 'original',
  label: 'Original',
  path: '/badge.svg',
  width: 160,
  height: 28,
};

export function getBadgeEmbedCode(slug: string, siteUrl: string, style: BadgeStyle = 'flat') {
  const badge = style === 'original'
    ? ORIGINAL_BADGE
    : BADGE_STYLES.find((s) => s.id === style) || BADGE_STYLES[0];

  return {
    svg: `<a href="${siteUrl}/badge/${slug}">
  <img src="${siteUrl}${badge.path}" alt="NoLogin Verified" title="Verified by NoLoginTools.org" />
</a>`,
    meta: `<meta name="nologin-verified" content="${slug}" />`,
    link: `<a href="${siteUrl}/badge/${slug}">NoLogin Verified</a>`,
  };
}

export function getBadgeWeight(
  displayType: 'explicit' | 'implicit' | 'none' | null
): number {
  switch (displayType) {
    case 'explicit':
      return 10;
    case 'implicit':
      return 5;
    default:
      return 0;
  }
}
