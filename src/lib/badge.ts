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

export interface DynamicBadgeOptions {
  status?: 'active' | 'verified' | 'pending' | 'not_found';
  badgeType?: 'verified' | 'grade' | 'sandbox';
  grade?: 'A+' | 'A' | 'B+' | 'B' | string;
  sandboxStatus?: string;
  style?: BadgeStyle;
  leftText?: string;
  rightText?: string;
  leftColor?: string;
  rightColor?: string;
  title?: string;
}

export {
  BADGE_GROUPS,
  BADGE_STYLES,
  ORIGINAL_BADGE,
  getBadgeEmbedCode,
  getBadgeWeight,
  measureBadgeTextWidth,
  generateDynamicBadgeSvg,
  getDynamicBadgeEmbedCode,
  getPrivacyGradeEmbedCode,
  getSandboxEmbedCode,
} from './badge-core.mjs';
