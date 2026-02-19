export type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'original';

export interface BadgeStyleInfo {
  id: BadgeStyle;
  label: string;
  path: string;
  width: number;
  height: number;
}

export const BADGE_STYLES: BadgeStyleInfo[] = [
  { id: 'flat', label: 'Flat', path: '/badges/flat.svg', width: 102, height: 20 },
  { id: 'flat-square', label: 'Flat Square', path: '/badges/flat-square.svg', width: 102, height: 20 },
  { id: 'plastic', label: 'Plastic', path: '/badges/plastic.svg', width: 102, height: 18 },
  { id: 'for-the-badge', label: 'For The Badge', path: '/badges/for-the-badge.svg', width: 169, height: 28 },
];

export const ORIGINAL_BADGE: BadgeStyleInfo = {
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
  <img src="${siteUrl}${badge.path}" alt="NoLogin Verified" />
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
